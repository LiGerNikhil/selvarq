import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, PackageCheck, Truck } from "lucide-react";
import { MediaImage } from "@/components/ui/media-image";
import { formatDate, formatINR } from "@/lib/format";
import { ordersRepository } from "@/lib/repo";
import { privateMetadata } from "@/lib/seo";
import "./celebration.css";

export const metadata: Metadata = privateMetadata("Order confirmed", "/order");

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await ordersRepository.getById(id);
  if (!order) notFound();

  return (
    <main className="page-container min-h-[65vh] py-10 md:py-16">
      <section className="mx-auto max-w-3xl text-center">
        <div className="celebration-check mx-auto grid size-16 place-items-center rounded-full border border-success/30 bg-success/5 text-success motion-reduce:animate-none">
          <Check aria-hidden className="size-8" />
        </div>
        <p className="eyebrow mt-6">A little more joy in the making</p>
        <h1 className="display-lg mt-2 text-indigo">Thank you, {order.address?.name ?? "your order is in"}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
          {order.paymentStatus === "pending"
            ? "Your order is confirmed. Payment is due when your delivery arrives."
            : "Your payment was received in this demo checkout. Each maker is preparing their part of your order."}
        </p>
        <p className="mt-4 text-sm text-ink">Order <strong>{order.orderNumber}</strong> · {formatDate(order.placedAt)}</p>
      </section>

      <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-line p-5">
          <h2 className="display-md mb-4 text-indigo">Your pieces</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <article key={item.variantId} className="flex gap-4 border-b border-line pb-4 last:border-0 last:pb-0">
                <div className="w-16 shrink-0"><MediaImage src={item.imageId} alt={item.name} ratio="4/5" sizes="64px" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-ink">{item.name}</h3>
                  <p className="mt-1 text-xs text-muted">{item.color} · {item.size} · Qty {item.quantity}</p>
                  <p className="mt-1 text-xs text-muted">From {item.sellerName ?? "SELVARQ maker"}</p>
                </div>
                <p className="text-sm">{formatINR(item.unitPrice * item.quantity)}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="border border-line p-5">
            <h2 className="display-md mb-4 text-indigo">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
              {order.discount ? <div className="flex justify-between text-success"><dt>Offer savings</dt><dd>−{formatINR(order.discount)}</dd></div> : null}
              <div className="flex justify-between"><dt>Delivery</dt><dd>{order.shipping ? formatINR(order.shipping) : "Complimentary"}</dd></div>
              {order.gstIncluded ? <div className="flex justify-between text-xs text-muted"><dt>GST included</dt><dd>{formatINR(order.gstIncluded)}</dd></div> : null}
              <div className="flex justify-between border-t border-line pt-3 font-medium"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-muted">{order.paymentMethodLabel ?? order.paymentMethod} · {order.paymentStatus === "pending" ? "Pay on delivery" : "Mock payment successful"}</p>
          </section>
          {order.merchantOrders?.length ? (
            <section className="border border-line p-5">
              <h2 className="display-md mb-4 text-indigo">Made by</h2>
              <ul className="space-y-3">{order.merchantOrders.map((merchantOrder) => <li key={merchantOrder.merchantId} className="flex items-center gap-3 text-sm"><PackageCheck aria-hidden className="size-5 text-gold-ink" /><span>{merchantOrder.merchantName}<span className="block text-xs text-muted">{merchantOrder.itemIds.length} piece{merchantOrder.itemIds.length === 1 ? "" : "s"} · Preparing to ship</span></span></li>)}</ul>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted"><Truck aria-hidden className="size-4" /> Delivery estimate: 3 to 7 business days</p>
            </section>
          ) : null}
          {order.address ? <section className="border border-line p-5"><h2 className="display-md mb-3 text-indigo">Delivery address</h2><p className="text-sm leading-6 text-muted">{order.address.name}<br />{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />{order.address.city}, {order.address.state} {order.address.pincode}<br />{order.address.phone}</p></section> : null}
        </aside>
      </div>
      <div className="mt-10 flex justify-center"><Link href="/shop" className="inline-flex min-h-11 items-center border border-indigo px-6 text-xs font-medium uppercase tracking-wide text-indigo hover:bg-indigo/5">Continue exploring</Link></div>
    </main>
  );
}
