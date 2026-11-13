import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Boxes, ChartNoAxesCombined, CircleDollarSign, Handshake, PackageCheck, Store } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sell on SELVARQ",
  description: "Apply to sell considered Indian clothing on SELVARQ. Clear 12% commission, product and order tools, and a storefront that tells your label's story.",
  alternates: { canonical: "/sell" },
  openGraph: {
    title: "Sell on SELVARQ",
    description: "A considered marketplace for independent labels and makers. Apply in four clear steps.",
    url: "/sell",
  },
};

const benefits = [
  { icon: Handshake, title: "A considered marketplace", text: "Meet customers who value thoughtful design, good materials and the hands behind every piece." },
  { icon: ChartNoAxesCombined, title: "Tools to grow well", text: "Manage your products, orders and fulfilment from one clear seller workspace." },
  { icon: BadgeCheck, title: "A maker-first story", text: "Tell shoppers what makes your label distinct, from your process to your place of making." },
];

const steps = [
  ["01", "Apply", "Share your business, tax declaration, payout details and brand story."],
  ["02", "Review", "Our team checks your application and supporting documents before approval."],
  ["03", "Set up", "Add products, sizes, stock and images, then preview your storefront."],
  ["04", "Sell & fulfil", "Manage orders, shipping and returns as your customers discover your work."],
];

const faqs = [
  ["Who can apply?", "Indian clothing labels, makers and businesses with original products and the documents required for their tax status."],
  ["How does commission work?", "The current demo rate is 12% of the item subtotal, deducted from the seller payout. There is no listing fee in this demo. Final commercial terms are confirmed during onboarding."],
  ["When can I start listing?", "After the SELVARQ team approves your seller application. You can save drafts and prepare listings in the seller workspace once approved."],
  ["Is this a live marketplace application?", "No. This is a demonstration flow. Uploaded files are represented by local previews and are not transmitted or stored."],
];

export default function SellPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-indigo-deep text-ivory">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,rgba(184,146,58,0.25),transparent_42%)]" />
        <div className="page-container relative grid min-h-[32rem] items-center gap-10 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow !text-gold-soft">For independent labels and makers</p>
            <h1 className="display-xl mt-4 text-ivory">Sell on SELVARQ</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ivory/80">A home for considered Indian clothing and the people who make it. Bring your point of view; we’ll make room for your story.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/merchant/register" size="lg" className="bg-gold text-indigo-deep hover:bg-gold-soft">Start your application <ArrowRight aria-hidden className="ml-2 size-4" /></ButtonLink>
              <ButtonLink href="#how-it-works" variant="ghost" size="lg" className="border-ivory/30 text-ivory hover:bg-white/10">How it works</ButtonLink>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-ivory/15 bg-ivory/5 p-6 sm:col-span-2"><Store aria-hidden className="size-6 text-gold-soft" /><p className="mt-8 font-display text-3xl">Your craft, clearly told.</p><p className="mt-2 text-sm leading-6 text-ivory/70">A storefront that gives equal care to your collection and the story behind it.</p></div>
            <div className="border border-ivory/15 bg-ivory/5 p-5"><CircleDollarSign aria-hidden className="size-5 text-gold-soft" /><p className="mt-4 text-sm font-medium">Transparent commission</p><p className="mt-1 text-xs leading-5 text-ivory/70">A clear 12% demo rate, shown on your payout summary.</p></div>
            <div className="border border-ivory/15 bg-ivory/5 p-5"><PackageCheck aria-hidden className="size-5 text-gold-soft" /><p className="mt-4 text-sm font-medium">Order tools together</p><p className="mt-1 text-xs leading-5 text-ivory/70">Track every step from acceptance to dispatch and returns.</p></div>
          </div>
        </div>
      </section>

      <section className="page-container py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-3">{benefits.map(({ icon: Icon, title, text }) => <article key={title} className="border-t border-gold pt-5"><Icon aria-hidden className="size-5 text-gold-ink" /><h2 className="mt-5 font-display text-2xl text-indigo">{title}</h2><p className="body mt-3">{text}</p></article>)}</div>
      </section>

      <section className="bg-pearl py-16 md:py-20" id="how-it-works">
        <div className="page-container"><p className="eyebrow">From application to first order</p><h2 className="display-lg mt-3 text-indigo">Four clear steps</h2>
          <ol className="mt-9 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">{steps.map(([number, title, text]) => <li key={number} className="bg-pearl p-6"><span className="font-display text-4xl text-gold-ink">{number}</span><h3 className="mt-5 text-lg font-medium text-indigo">{title}</h3><p className="body mt-2">{text}</p></li>)}</ol>
        </div>
      </section>

      <section className="page-container grid gap-8 py-16 md:grid-cols-[1fr_0.8fr] md:py-20">
        <div><p className="eyebrow">Simple by design</p><h2 className="display-lg mt-3 text-indigo">Commission, explained</h2><p className="body mt-4 max-w-xl">For this demo, SELVARQ’s platform commission is 12% of the item subtotal for each seller order. It is deducted before payout; the remaining amount is your seller payout. The order and payout views show the amounts separately, so the calculation is visible.</p><p className="caption mt-4">Demo terms only. Live rates, settlement timing, taxes and service fees will be agreed with sellers before launch.</p></div>
        <div className="border border-line bg-ivory p-6"><div className="flex items-center gap-2 text-indigo"><Boxes aria-hidden className="size-5" /><h3 className="font-medium">Example order line</h3></div><dl className="mt-6 space-y-3 text-sm"><div className="flex justify-between"><dt>Item subtotal</dt><dd>₹5,000</dd></div><div className="flex justify-between"><dt>SELVARQ commission (12%)</dt><dd>−₹600</dd></div><div className="flex justify-between border-t border-line pt-3 font-medium"><dt>Estimated seller payout</dt><dd>₹4,400</dd></div></dl><p className="caption mt-4">Illustrative only; excludes any applicable adjustments.</p></div>
      </section>

      <section className="bg-pearl py-16 md:py-20"><div className="page-container grid gap-10 md:grid-cols-[0.7fr_1.3fr]"><div><p className="eyebrow">Good to know</p><h2 className="display-lg mt-3 text-indigo">Seller FAQs</h2></div><div className="divide-y divide-line border-y border-line">{faqs.map(([question, answer]) => <details key={question} className="group py-4"><summary className="cursor-pointer list-none pr-6 text-base font-medium text-indigo marker:hidden">{question}<span aria-hidden className="float-right text-gold-ink group-open:rotate-45">+</span></summary><p className="body mt-3 max-w-2xl">{answer}</p></details>)}</div></div></section>
      <section className="page-container py-16 text-center md:py-20"><h2 className="display-lg text-indigo">Let’s make room for your work.</h2><p className="body mx-auto mt-3 max-w-xl">Tell us about your label and the care behind your collection.</p><ButtonLink href="/merchant/register" className="mt-7">Apply to sell <ArrowRight aria-hidden className="ml-2 size-4" /></ButtonLink><p className="caption mt-4">Already applied? <Link href="/login?next=%2Fmerchant%2Fdashboard" className="text-indigo underline">Sign in to your seller account</Link></p></section>
    </main>
  );
}
