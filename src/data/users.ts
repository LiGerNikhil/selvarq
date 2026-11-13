import type { User } from "./types";

export const users: User[] = [
  { id: "user-ananya", name: "Ananya Mehta", email: "ananya.mehta@example.test", role: "customer", joinedAt: "2024-01-12T00:00:00.000Z" },
  { id: "user-rohan", name: "Rohan Iyer", email: "rohan.iyer@example.test", role: "customer", joinedAt: "2024-05-07T00:00:00.000Z" },
  { id: "user-meera", name: "Meera Shah", email: "meera.shah@example.test", role: "customer", joinedAt: "2025-02-20T00:00:00.000Z" },
  { id: "user-sharda-owner", name: "Kavita Sharma", email: "kavita@shardag.example.test", role: "merchant", merchantId: "sharda-garments", joinedAt: "2022-04-18T00:00:00.000Z" },
  { id: "user-admin", name: "SELVARQ Admin", email: "admin@example.test", role: "admin", joinedAt: "2022-01-05T00:00:00.000Z" },
];
