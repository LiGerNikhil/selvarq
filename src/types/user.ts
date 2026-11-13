import type { Id, ISODateString } from "./common";

export interface Address {
  id: Id;
  label: "Home" | "Work" | "Other";
  fullName: string;
  /** 10-digit Indian mobile number, no country code. */
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  /** 6-digit PIN code. */
  pincode: string;
  country: "IN";
  isDefault: boolean;
}

export type UserRole = "customer" | "merchant" | "admin";

export interface User {
  id: Id;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  /** Set when role is "merchant". */
  merchantId?: Id;
  addresses: Address[];
  /** Product ids. */
  wishlist: Id[];
  avatar?: string;
  createdAt: ISODateString;
}
