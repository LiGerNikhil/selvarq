import type { Id, ISODateString } from "./common";

export interface Review {
  id: Id;
  productId: Id;
  userId: Id;
  userName: string;
  /** Integer 1 to 5. */
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  /** Size the reviewer bought, when known. */
  size?: string;
  images?: string[];
  createdAt: ISODateString;
}
