import { Cormorant_Garamond, Jost } from "next/font/google";

/** Display face: headings, brand, section titles. */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/** Body and UI face. latin-ext carries the rupee sign. */
export const jost = Jost({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jost",
  display: "swap",
});

export const fontVariables = `${cormorant.variable} ${jost.variable}`;
