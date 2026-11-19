import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Invoice", "/account/orders");

import { notFound, redirect } from "next/navigation";
import { PrintInvoiceButton } from "@/components/account/print-invoice-button";
import { getSession } from "@/lib/auth/demo-session";
import { BRAND } from "@/lib/config";
import { formatDate, formatINR } from "@/lib/format";
import { ordersRepository } from "@/lib/repo";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Faccount%2Forders");
  const { id } = await params;
  const order = await ordersRepository.getById(id);
  if (!order || order.userId !== session.userId) notFound();
  return <div className="mx-auto max-w-3xl border border-line bg-white p-5 text-ink sm:p-10 print:max-w-none print:border-0 print:p-0">
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div><p className="eyebrow">Tax invoice · Demo</p><h1 className="display-md mt-2 text-indigo">{BRAND.name}</h1><p className="caption">{BRAND.footerLine}</p></div>
      <PrintInvoiceButton />
    </div>
    <div className="grid gap-5 border-y border-line py-5 sm:grid-cols-2"><div><p className="eyebrow">Invoice to</p><p className="mt-2 text-sm">{order.address?.name ?? "Customer"}<br />{order.address?.line1 ?? "Address on file"}<br />{order.address?.city ?? ""} {order.address?.pincode ?? ""}</p></div><div className="text-sm sm:text-right"><p>Order: {order.orderNumber}</p><p className="mt-1">Date: {formatDate(order.placedAt)}</p><p className="mt-1">Payment: {order.paymentMethodLabel ?? order.paymentMethod.toUpperCase()}</p></div></div>
    <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[36rem] text-left text-sm"><thead><tr className="border-b border-line"><th className="py-3 pr-3">Item</th><th className="py-3 px-3">Qty</th><th className="py-3 px-3">Unit price</th><th className="py-3 pl-3 text-right">Amount</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.variantId} className="border-b border-line"><td className="py-3 pr-3">{item.name}<span className="block text-xs text-muted">{item.color} · {item.size}</span></td><td className="py-3 px-3">{item.quantity}</td><td className="py-3 px-3">{formatINR(item.unitPrice)}</td><td className="py-3 pl-3 text-right">{formatINR(item.unitPrice * item.quantity)}</td></tr>)}</tbody></table></div>
    <dl className="ml-auto mt-6 max-w-xs space-y-2 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>{order.discount ? <div className="flex justify-between"><dt>Discount</dt><dd>−{formatINR(order.discount)}</dd></div> : null}<div className="flex justify-between"><dt>Delivery</dt><dd>{formatINR(order.shipping)}</dd></div>{order.gstIncluded ? <div className="flex justify-between text-muted"><dt>GST included</dt><dd>{formatINR(order.gstIncluded)}</dd></div> : null}<div className="flex justify-between border-t border-line pt-3 font-medium"><dt>Total paid</dt><dd>{formatINR(order.total)}</dd></div></dl>
    <p className="mt-10 border-t border-line pt-4 text-center text-xs text-muted">This invoice is a printable mock document for demo purposes.</p>
  </div>;
}
