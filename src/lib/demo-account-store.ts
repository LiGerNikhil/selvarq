import { users } from "@/data";
import type { Address } from "@/types/user";
import type { User } from "@/data";
import { demoDataEnabled } from "@/lib/demo-data";
import { markDirty } from "@/lib/db/persistence";
import { groupRecords, type EntityInput, type EntityRecord } from "@/lib/db/types";

export interface CustomerPreferences {
  gender: "men" | "women" | "unisex" | "no_preference";
  styles: string[];
  usualSizes: string[];
  favoriteCategories: string[];
  onboardingComplete: boolean;
}

export interface DemoAccount extends User {
  phone: string;
  password: string;
  addresses: Address[];
  preferences: CustomerPreferences;
  notifications: { email: boolean; sms: boolean; orderUpdates: boolean };
}

interface DemoAccountStore {
  accounts: Map<string, DemoAccount>;
  resetTokens: Map<string, string>;
}

const globalStore = globalThis as typeof globalThis & { __selvarqAccounts?: DemoAccountStore };

// Accounts, passwords, addresses and reset tokens are persisted to MongoDB when
// DATA_SOURCE=mongo; otherwise they live in server process memory.
function createStore(): DemoAccountStore {
  const accounts = new Map<string, DemoAccount>();
  if (demoDataEnabled()) {
    users.forEach((user, index) => {
      accounts.set(user.id, {
        ...user,
        phone: `98765000${String(index + 1).padStart(2, "0")}`,
        password: "Demo123!",
        addresses: user.role === "customer" ? [{
          id: `address-${user.id}-home`,
          label: "Home",
          fullName: user.name,
          phone: `98765000${String(index + 1).padStart(2, "0")}`,
          line1: "12, Palm Grove Road",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "IN",
          isDefault: true,
        }] : [],
        preferences: {
          gender: "no_preference",
          styles: [],
          usualSizes: [],
          favoriteCategories: [],
          onboardingComplete: true,
        },
        notifications: { email: true, sms: false, orderUpdates: true },
      });
    });
  }
  return { accounts, resetTokens: new Map() };
}

function getStore(): DemoAccountStore {
  globalStore.__selvarqAccounts ??= createStore();
  return globalStore.__selvarqAccounts;
}

function persistAccountState(): void {
  markDirty("accounts", accountDocuments);
}

/** Accounts and reset tokens as MongoDB records. */
export function accountDocuments(): EntityInput[] {
  const store = getStore();
  return [
    ...[...store.accounts.values()].map((account) => ({ kind: "accounts", entityId: account.id, data: account })),
    ...[...store.resetTokens].map(([token, userId]) => ({ kind: "resetTokens", entityId: token, data: userId })),
  ];
}

/** Rebuilds accounts and reset tokens from MongoDB. */
export function applyAccountDocuments(records: EntityRecord[]): void {
  const store = createStore();
  const grouped = groupRecords(records);
  store.accounts = new Map((grouped.get("accounts") ?? []).map((record) => [record.entityId, record.data as DemoAccount]));
  store.resetTokens = new Map((grouped.get("resetTokens") ?? []).map((record) => [record.entityId, record.data as string]));
  globalStore.__selvarqAccounts = store;
}

export function listDemoAccounts(): DemoAccount[] {
  return [...getStore().accounts.values()];
}

export function getDemoAccountById(id: string): DemoAccount | undefined {
  return getStore().accounts.get(id);
}

export function findDemoAccount(identifier: string): DemoAccount | undefined {
  const normalized = identifier.trim().toLowerCase();
  return listDemoAccounts().find((account) =>
    account.email.toLowerCase() === normalized || account.phone === normalized.replace(/\D/g, ""),
  );
}

export interface SeedAccountInput {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: DemoAccount["role"];
  merchantId?: string;
}

/**
 * Creates a production access account when it is missing. An existing account
 * with the same email keeps its current password and id, so password resets are
 * not undone on restart.
 */
export function ensureDemoAccount(input: SeedAccountInput): DemoAccount {
  const existing = findDemoAccount(input.email);
  if (existing) {
    let changed = false;
    if (existing.name !== input.name) { existing.name = input.name; changed = true; }
    if (existing.role !== input.role) { existing.role = input.role; changed = true; }
    if (input.merchantId && existing.merchantId !== input.merchantId) { existing.merchantId = input.merchantId; changed = true; }
    if (changed) persistAccountState();
    return existing;
  }

  const account: DemoAccount = {
    id: input.id,
    name: input.name,
    email: input.email.trim().toLowerCase(),
    phone: input.phone,
    role: input.role,
    ...(input.merchantId ? { merchantId: input.merchantId } : {}),
    joinedAt: new Date().toISOString(),
    password: input.password,
    addresses: [],
    preferences: { gender: "no_preference", styles: [], usualSizes: [], favoriteCategories: [], onboardingComplete: true },
    notifications: { email: true, sms: false, orderUpdates: true },
  };
  getStore().accounts.set(account.id, account);
  persistAccountState();
  return account;
}

export function createDemoAccount(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): DemoAccount {
  if (findDemoAccount(input.email) || findDemoAccount(input.phone)) {
    throw new Error("An account already exists with that email or mobile number.");
  }
  const account: DemoAccount = {
    id: `customer-${crypto.randomUUID()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone,
    role: "customer",
    joinedAt: new Date().toISOString(),
    password: input.password,
    addresses: [],
    preferences: { gender: "no_preference", styles: [], usualSizes: [], favoriteCategories: [], onboardingComplete: false },
    notifications: { email: true, sms: false, orderUpdates: true },
  };
  getStore().accounts.set(account.id, account);
  persistAccountState();
  return account;
}

export function createDemoMerchantAccount(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  merchantId: string;
}): DemoAccount {
  if (findDemoAccount(input.email) || findDemoAccount(input.phone)) {
    throw new Error("An account already exists with that email or mobile number.");
  }
  const account: DemoAccount = {
    id: `merchant-owner-${crypto.randomUUID()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone,
    role: "merchant",
    merchantId: input.merchantId,
    joinedAt: new Date().toISOString(),
    password: input.password,
    addresses: [],
    preferences: { gender: "no_preference", styles: [], usualSizes: [], favoriteCategories: [], onboardingComplete: true },
    notifications: { email: true, sms: false, orderUpdates: true },
  };
  getStore().accounts.set(account.id, account);
  persistAccountState();
  return account;
}

export function updateDemoAccount(id: string, patch: Partial<Pick<DemoAccount, "name" | "email" | "phone" | "addresses" | "preferences" | "notifications">>): DemoAccount | undefined {
  const account = getDemoAccountById(id);
  if (!account) return undefined;
  if (patch.email) {
    const existing = findDemoAccount(patch.email);
    if (existing && existing.id !== id) throw new Error("That email is already in use.");
  }
  if (patch.phone) {
    const existing = findDemoAccount(patch.phone);
    if (existing && existing.id !== id) throw new Error("That mobile number is already in use.");
  }
  Object.assign(account, patch);
  if (patch.email) account.email = patch.email.trim().toLowerCase();
  persistAccountState();
  return account;
}

export function setDemoPassword(id: string, password: string): boolean {
  const account = getDemoAccountById(id);
  if (!account) return false;
  account.password = password;
  persistAccountState();
  return true;
}

/**
 * Changes a password for a signed-in account after checking the current one.
 * Returns false when the account is missing or the current password is wrong.
 */
export function changeDemoPassword(id: string, currentPassword: string, newPassword: string): boolean {
  const account = getDemoAccountById(id);
  if (!account || account.password !== currentPassword) return false;
  account.password = newPassword;
  persistAccountState();
  return true;
}

export function createDemoResetToken(id: string): string {
  const token = crypto.randomUUID();
  getStore().resetTokens.set(token, id);
  persistAccountState();
  return token;
}

export function consumeDemoResetToken(token: string): string | undefined {
  const store = getStore();
  const userId = store.resetTokens.get(token);
  if (userId) {
    store.resetTokens.delete(token);
    persistAccountState();
  }
  return userId;
}
