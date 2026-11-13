import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MediaImage } from "@/components/ui/media-image";
import { OrderRequestForm } from "@/components/account/order-request-form";
import { TrackingTimeline } from "@/components/account/tracking-timeline";
import { ButtonLink } from "@/components/ui/button";
import { formatDate, formatINR } from "@/lib/format";
import { getSession } from "@/lib/auth/demo-session";
import { ordersRepository } from "@/lib/repo";
import { getDemoOrderRequests } from "@/lib/demo-order-requests";
import { products } from "@/data";

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent("/account/orders")}`);
  const { id } = await params;
  const order = await ordersRepository.getById(id);
  if (!order || order.userId !== session.userId) notFound();
  const canCancel = ["pending", "confirmed", "processing"].includes(order.status);
  const canReturn = order.status === "delivered";
  const orderRequests = getDemoOrderRequests(session.userId, order.id);
  return <section><p className="eyebrow mb-2">Placed {formatDate(order.placedAt)}</p><h2 className="display-md text-indigo">Order {order.orderNumber}</h2>
    <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(15rem,0.7fr)]">
      <div className="space-y-7">
        <section className="border border-line p-4 sm:p-5"><h3 className="mb-4 text-sm font-medium">Items in this order</h3><ul className="space-y-4">{order.items.map((item) => {
          const product = products.find((candidate) => candidate.id === item.productId);
          const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
          return <li key={item.variantId} className="flex gap-3"><div className="w-16 shrink-0"><MediaImage src={item.imageId} alt="" ratio="4/5" sizes="64px" /></div><div className="min-w-0 flex-1"><Link href={`/product/${product?.slug ?? item.productId}`} className="text-sm font-medium text-indigo underline-offset-4 hover:underline">{item.name}</Link><p className="caption mt-1">{item.color ?? variant?.color ?? "Colour"} · {item.size ?? variant?.size ?? "Size"} · Qty {item.quantity}</p></div><span className="text-sm">{formatINR(item.unitPrice * item.quantity)}</span></li>;
        })}</ul></section>
        <section className="border border-line p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-sm font-medium">Delivery progress</h3>{order.trackingNumber ? <span className="text-xs text-muted">{order.trackingNumber}</span> : null}</div><TrackingTimeline status={order.status} trackingNumber={order.trackingNumber} /></section>
        <section className="border border-line p-4 sm:p-5"><h3 className="mb-4 text-sm font-medium">Need help with this order?</h3><OrderRequestForm orderId={order.id} canCancel={canCancel} canReturn={canReturn} initialRequests={orderRequests} /></section>
      </div>
      <aside className="space-y-5 border border-line p-4 sm:p-5">
        <h3 className="text-sm font-medium">Payment summary</h3>
        <dl className="space-y-2 text-sm"><div className="flex justify-between"><dt>Items</dt><dd>{formatINR(order.subtotal)}</dd></div>{order.discount ? <div className="flex justify-between text-success"><dt>Discount</dt><dd>−{formatINR(order.discount)}</dd></div> : null}<div className="flex justify-between"><dt>Delivery</dt><dd>{order.shipping ? formatINR(order.shipping) : "Complimentary"}</dd></div><div className="flex justify-between border-t border-line pt-3 font-medium"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div></dl>
        <p className="caption">{order.paymentMethodLabel ?? order.paymentMethod.toUpperCase()} · <span className="capitalize">{order.paymentStatus}</span></p>
        <ButtonLink href={`/account/invoice/${encodeURIComponent(order.id)}`} variant="ghost" fullWidth>View invoice</ButtonLink>
        {order.address ? <div className="border-t border-line pt-4"><h3 className="text-sm font-medium">Ship to</h3><p className="caption mt-2">{order.address.name}<br />{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />{order.address.city}, {order.address.state} {order.address.pincode}</p></div> : null}
      </aside>
    </div>
  </section>;
}
