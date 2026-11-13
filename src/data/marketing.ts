import type { Banner, Coupon, FAQ, Story } from "./types";

export const coupons: Coupon[] = [
  { id: "coupon-welcome10", code: "WELCOME10", description: "A little welcome for your first order.", discountType: "percentage", discountValue: 10, minimumSpend: 150000, startsAt: "2025-01-01T00:00:00.000Z", endsAt: "2027-12-31T23:59:59.000Z", active: true },
  { id: "coupon-linen15", code: "LINEN15", description: "Save on breathable linen favourites.", discountType: "percentage", discountValue: 15, minimumSpend: 300000, startsAt: "2025-04-01T00:00:00.000Z", endsAt: "2027-09-30T23:59:59.000Z", active: true },
  { id: "coupon-festive500", code: "FESTIVE500", description: "A festive saving on orders over Rs 5,000.", discountType: "fixed", discountValue: 50000, minimumSpend: 500000, startsAt: "2025-08-01T00:00:00.000Z", endsAt: "2027-12-31T23:59:59.000Z", active: true },
  { id: "coupon-quiet12", code: "QUIET12", description: "A considered saving on Quiet Neutrals.", discountType: "percentage", discountValue: 12, minimumSpend: 250000, startsAt: "2025-01-01T00:00:00.000Z", endsAt: "2027-12-31T23:59:59.000Z", active: true },
  { id: "coupon-first200", code: "FIRST200", description: "Rs 200 off your first order above Rs 2,000.", discountType: "fixed", discountValue: 20000, minimumSpend: 200000, startsAt: "2025-01-01T00:00:00.000Z", endsAt: "2027-12-31T23:59:59.000Z", active: true },
  { id: "coupon-expired", code: "MONSOON8", description: "A past-season offer retained for order history examples.", discountType: "percentage", discountValue: 8, minimumSpend: 100000, startsAt: "2024-06-01T00:00:00.000Z", endsAt: "2024-08-31T23:59:59.000Z", active: false },
];

export const stories: Story[] = [
  { id: "story-loom", title: "The quiet beauty of handloom", slug: "quiet-beauty-of-handloom", excerpt: "Meet the makers and rhythms behind fabric woven slowly, one pass at a time.", body: "A handloom carries the pace of its maker. We look at the small variations, patient work and everyday beauty that make each woven piece its own.", imageId: "placeholder:story-handloom", publishedAt: "2025-09-18T10:00:00.000Z", tags: ["craft", "handloom"] },
  { id: "story-linen", title: "A lighter way to dress", slug: "a-lighter-way-to-dress", excerpt: "Why linen and cotton make such easy companions for warm-weather wardrobes.", body: "Breathable natural fibres invite a little more ease into the day. Learn how to layer linen and cotton, care for the texture and wear them season after season.", imageId: "placeholder:story-linen", publishedAt: "2025-08-06T10:00:00.000Z", tags: ["fabric", "linen"] },
  { id: "story-zari", title: "A measured shimmer", slug: "a-measured-shimmer", excerpt: "A closer look at zari details designed to be worn beyond one celebration.", body: "A fine line of zari can change the light of a garment. Our festive edit pairs this time-honoured detail with wearable shapes and thoughtful modern colour.", imageId: "placeholder:story-zari", publishedAt: "2025-07-21T10:00:00.000Z", tags: ["craft", "occasion"] },
  { id: "story-care", title: "Make good clothes last", slug: "make-good-clothes-last", excerpt: "Simple, fabric-first care for the pieces you reach for most.", body: "A little attention goes a long way. Follow garment labels, wash gently and dry in shade to help natural fibres keep their character and feel.", imageId: "placeholder:story-garment-care", publishedAt: "2025-06-12T10:00:00.000Z", tags: ["care", "wardrobe"] },
];

export const banners: Banner[] = [
  { id: "banner-wedding", title: "The Wedding Edit", subtitle: "Considered pieces for your celebrations.", imageId: "placeholder:banner-wedding-edit", href: "/collection/the-wedding-edit", placement: "hero", active: true },
  { id: "banner-linen", title: "Everyday Linen", subtitle: "Easy layers, naturally breathable.", imageId: "placeholder:banner-everyday-linen", href: "/collection/everyday-linen", placement: "campaign", active: true },
  { id: "banner-festive", title: "A hint of zari", subtitle: "Meet the Festive Zari collection.", imageId: "placeholder:banner-festive-zari", href: "/collection/festive-zari", placement: "campaign", active: true },
  { id: "banner-workwear", title: "Office Ease", subtitle: "Polished comfort for every workday.", imageId: "placeholder:banner-office-ease", href: "/collection/office-ease", placement: "category", active: true },
];

export const faqs: FAQ[] = [
  { id: "faq-order", question: "How can I check my order status?", answer: "Sign in and open Orders in your account to see the latest status and tracking details.", category: "orders" },
  { id: "faq-confirmation", question: "Where will I find my order confirmation?", answer: "We send an order confirmation to the email address used at checkout.", category: "orders" },
  { id: "faq-edit", question: "Can I change my order after placing it?", answer: "Contact us as soon as possible. Changes may not be possible once an order is being prepared for dispatch.", category: "orders" },
  { id: "faq-shipping", question: "How long does delivery take?", answer: "Most orders arrive within 3 to 7 business days. Remote locations may take a little longer.", category: "shipping" },
  { id: "faq-shipping-cost", question: "What are the delivery charges?", answer: "Standard delivery is Rs 99. Delivery is complimentary on eligible orders of Rs 1,999 or more.", category: "shipping" },
  { id: "faq-address", question: "Can I ship to a different address?", answer: "Yes. Add a delivery address at checkout and review it carefully before placing your order.", category: "shipping" },
  { id: "faq-return", question: "What is your return window?", answer: "Eligible items can be returned within 7 days of delivery, provided they are unused and have original tags.", category: "returns" },
  { id: "faq-return-start", question: "How do I request a return?", answer: "Open the order in your account and choose the item you would like to return. We will guide you through the next steps.", category: "returns" },
  { id: "faq-refund", question: "When will my refund arrive?", answer: "Refunds are initiated after the returned item is received and checked. Bank processing times vary by payment method.", category: "payments" },
  { id: "faq-payments", question: "Which payment methods are accepted?", answer: "Available options are shown at checkout and may include UPI, cards, net banking and cash on delivery.", category: "payments" },
  { id: "faq-seller", question: "How can I sell on SELVARQ?", answer: "Use Become a Seller to share your business details. Our team reviews applications before a storefront is approved.", category: "sellers" },
  { id: "faq-maker", question: "Who makes the products?", answer: "Each product page names its selling merchant. SELVARQ brings together its own Sharda Garments catalogue and approved independent labels.", category: "sellers" },
];
