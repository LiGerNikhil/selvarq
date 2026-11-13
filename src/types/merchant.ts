import type { Id, ISODateString } from "./common";
import type { Address } from "./user";

/** Only "approved" merchants can publish products. */
export type MerchantStatus = "pending" | "approved" | "rejected" | "suspended";

export type GstDeclaration = "registered" | "unregistered";

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

export type MerchantDocumentType =
  | "gst_certificate"
  | "pan_card"
  | "cancelled_cheque"
  | "address_proof"
  | "other";

export interface MerchantDocument {
  id: Id;
  type: MerchantDocumentType;
  fileName: string;
  url: string;
  uploadedAt: ISODateString;
  verified: boolean;
}

export interface Merchant {
  id: Id;
  slug: string;
  /** Legal name. */
  businessName: string;
  /** Storefront name shown to shoppers. */
  displayName: string;
  description: string;
  logo?: string;
  status: MerchantStatus;
  rejectionReason?: string;
  gstDeclaration: GstDeclaration;
  /** Required when gstDeclaration is "registered". */
  gstin?: string;
  pan: string;
  bank: BankDetails;
  pickupAddress: Address;
  documents: MerchantDocument[];
  /** Percent, e.g. 12. Admin-editable per merchant. */
  commissionRate: number;
  ownerUserId: Id;
  createdAt: ISODateString;
  approvedAt?: ISODateString;
}
