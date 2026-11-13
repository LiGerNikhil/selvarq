import { BRAND, COMMERCE } from "@/lib/config";

const rs = (paise: number) => `Rs ${new Intl.NumberFormat("en-IN").format(paise / 100)}`;

/** Reusable microcopy. Warm, confident, concise. No filler. */
export const copy = {
  brand: {
    tagline: BRAND.tagline,
    promise: "Cut with intent. Finished to last.",
    makers: "Made by makers, chosen by us.",
    footer: BRAND.footerLine,
  },
  delivery: {
    promise: `Free delivery above ${rs(COMMERCE.freeDeliveryThreshold)}. Easy ${COMMERCE.returnWindowDays}-day returns.`,
    returns: `Return within ${COMMERCE.returnWindowDays} days of delivery, unworn and with tags.`,
  },
  actions: {
    addToBag: "Add to bag",
    buyNow: "Buy now",
    checkout: "Checkout",
    continueShopping: "Continue shopping",
    viewDetails: "View details",
    saveToWishlist: "Save to wishlist",
  },
  empty: {
    bag: { title: "Your bag is empty", body: "Pieces you add will wait for you here." },
    wishlist: { title: "Nothing saved yet", body: "Tap the heart on anything you love." },
    search: { title: "No matches", body: "Try a simpler word, or browse the collections." },
    orders: { title: "No orders yet", body: "When you order, you can track it here." },
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    required: "This field is required.",
    email: "Enter a valid email address.",
    phone: "Enter a 10-digit mobile number.",
    pincode: "Enter a 6-digit PIN code.",
  },
  notFound: {
    title: "This page has slipped away",
    body: "The link may be old, or the piece may have sold out. Let us take you back.",
  },
} as const;
