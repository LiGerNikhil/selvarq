import { users } from "@/data";
import type { Address } from "@/types/user";
import type { User } from "@/data";

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

// DEMO ONLY: accounts, passwords, addresses and reset tokens live in server process memory.
function getStore(): DemoAccountStore {
  if (!globalStore.__selvarqAccounts) {
    const accounts = new Map<string, DemoAccount>();
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
    globalStore.__selvarqAccounts = { accounts, resetTokens: new Map() };
  }
  return globalStore.__selvarqAccounts;
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
  return account;
}

export function setDemoPassword(id: string, password: string): boolean {
  const account = getDemoAccountById(id);
  if (!account) return false;
  account.password = password;
  return true;
}

export function createDemoResetToken(id: string): string {
  const token = crypto.randomUUID();
  getStore().resetTokens.set(token, id);
  return token;
}

export function consumeDemoResetToken(token: string): string | undefined {
  const store = getStore();
  const userId = store.resetTokens.get(token);
  if (userId) store.resetTokens.delete(token);
  return userId;
}
