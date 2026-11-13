export const homepagePromises = [
  { title: "Free delivery", detail: "On orders above Rs 1,999", icon: "delivery" },
  { title: "7-day returns", detail: "On eligible pieces", icon: "returns" },
  { title: "Secure payments", detail: "Protected at checkout", icon: "payments" },
  { title: "Authentic makers", detail: "Independent Indian labels", icon: "makers" },
] as const;

export const homepageNewsletter = {
  eyebrow: "A note, now and then",
  title: "Stay close to good things.",
  description: "New collections, stories from makers and simple notes on caring for the clothes you love.",
  inputLabel: "Email address",
  placeholder: "Your email address",
  action: "Sign me up",
} as const;

export const homepageTestimonials = [
  {
    quote: "The kind of kurta that feels special on the first wear and familiar by the third.",
    name: "Ananya M.",
    detail: "Verified SELVARQ customer",
    rating: 5,
  },
  {
    quote: "Beautiful cloth, a thoughtful fit and finishing I noticed as soon as I opened the parcel.",
    name: "Meera S.",
    detail: "Verified SELVARQ customer",
    rating: 5,
  },
  {
    quote: "A wardrobe find I know I will keep coming back to, season after season.",
    name: "Rohan I.",
    detail: "Verified SELVARQ customer",
    rating: 5,
  },
] as const;

export const homepagePress = ["The Wardrobe Edit", "Good Things Journal", "India Craft Review", "The Everyday Edit"] as const;

export const craftSteps = [
  { number: "01", title: "Fabric", text: "Choose breathable cloth with a feel and character worth keeping." },
  { number: "02", title: "Cut", text: "Shape each piece for considered proportions and ease of movement." },
  { number: "03", title: "Finish", text: "Refine the seams, edges and small details inside and out." },
  { number: "04", title: "Quality check", text: "Give every garment a final, careful look before it finds its home." },
] as const;

export const instagramTiles = [
  { imageId: "placeholder:instagram-handloom-detail", alt: "Handloom cotton in a soft ivory shade", caption: "Cloth, close up" },
  { imageId: "placeholder:instagram-indigo-dye", alt: "An indigo textile with hand-finished detail", caption: "Colour with character" },
  { imageId: "placeholder:instagram-maker-hands", alt: "A maker finishing a seam by hand", caption: "Made by many hands" },
  { imageId: "placeholder:instagram-everyday-linen", alt: "A relaxed linen layer for an everyday wardrobe", caption: "Ease, every day" },
] as const;
