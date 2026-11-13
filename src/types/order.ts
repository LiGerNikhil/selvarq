import type { Id, ISODateString, Paise } from "./common";
import type { Address } from "./user";

export interface CartItem {
  productId: Id;
  variantId: Id;
  /** Seller, used to group the cart by merchant. */
  merchantId: Id;
  quantity: number;
  addedAt: ISODateString;
}

export interface Cart {
  id: Id;
  items: CartItem[];
  couponCode?: string;
  updatedAt: ISODateString;
}

export type OrderStatus = "placed" | "confirmed" | "partially_fulfilled" | "completed" | "cancelled";

export type OrderItemStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned";

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

/** One purchased line. Prices are snapshots taken at order time. */
export interface OrderItem {
  id: Id;
  productId: Id;
  variantId: Id;
  merchantId: Id;
  sellerName: string;
  title: string;
  image: string;
  sku: string;
  size: string;
  colorName: string;
  quantity: number;
  /** GST-inclusive price per piece. */
  unitPrice: Paise;
  mrp: Paise;
  /** Percent applied to this line. */
  gstRate: number;
  /** GST contained in the line total. */
  gstAmount: Paise;
  lineTotal: Paise;
  /** Percent captured at order time. */
  commissionRate: number;
  commissionAmount: Paise;
  status: OrderItemStatus;
}

export interface TrackingEvent {
  status: OrderItemStatus;
  label: string;
  at: ISODateString;
  location?: string;
}

/** The per-seller split of an order, used for fulfilment and payouts. */
export interface MerchantOrder {
  id: Id;
  merchantId: Id;
  itemIds: Id[];
  status: OrderItemStatus;
  subtotal: Paise;
  commission: Paise;
  /** subtotal minus commission. */
  payout: Paise;
  courier?: string;
  trackingNumber?: string;
  estimatedDelivery?: ISODateString;
  tracking: TrackingEvent[];
}

export interface OrderTotals {
  subtotal: Paise;
  discount: Paise;
  shipping: Paise;
  /** GST already included in subtotal; shown as a breakup. */
  gstIncluded: Paise;
  total: Paise;
}

export interface Order {
  id: Id;
  /** Human-readable, e.g. "SQ-2026-000123". */
  number: string;
  userId: Id;
  items: OrderItem[];
  merchantOrders: MerchantOrder[];
  status: OrderStatus;
  shippingAddress: Address;
  payment: { method: PaymentMethod; status: PaymentStatus; reference?: string };
  couponCode?: string;
  totals: OrderTotals;
  placedAt: ISODateString;
}
