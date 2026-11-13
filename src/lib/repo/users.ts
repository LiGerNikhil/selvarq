import type { User } from "@/data";
import { getDemoAccountById, findDemoAccount, listDemoAccounts } from "@/lib/demo-account-store";
import { paginate, type Page, type PageOptions } from "./types";

export interface UsersRepository {
  getById(id: string): Promise<User | undefined>;
  getByEmail(email: string): Promise<User | undefined>;
  list(options?: PageOptions): Promise<Page<User>>;
}

export const mockUsersRepository: UsersRepository = {
  async getById(id) { return getDemoAccountById(id); },
  async getByEmail(email) { return findDemoAccount(email); },
  async list(options) { return paginate(listDemoAccounts(), options); },
};
