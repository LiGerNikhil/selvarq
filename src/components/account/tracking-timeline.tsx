import type { OrderStatus } from "@/data";

const stages: { status: OrderStatus; title: string; detail: string }[] = [
  { status: "confirmed", title: "Order confirmed", detail: "Your order is with the maker." },
  { status: "processing", title: "Being prepared", detail: "Your pieces are being checked and packed." },
  { status: "shipped", title: "On its way", detail: "The parcel has left the maker." },
  { status: "delivered", title: "Delivered", detail: "Enjoy your considered pieces." },
];

export function TrackingTimeline({ status, trackingNumber }: { status: OrderStatus; trackingNumber?: string }) {
  const completedIndex = stages.findIndex((stage) => stage.status === status);
  return (
    <ol className="space-y-0 border-l border-line pl-5">
      {stages.map((stage, index) => {
        const complete = status === "delivered" || (completedIndex >= 0 && index <= completedIndex);
        return <li key={stage.status} className="relative pb-6 last:pb-0">
          <span aria-hidden className={`absolute -left-[1.62rem] top-1 size-3 rounded-full border ${complete ? "border-indigo bg-indigo" : "border-line bg-ivory"}`} />
          <h3 className={`text-sm ${complete ? "font-medium text-indigo" : "text-muted"}`}>{stage.title}</h3>
          <p className="caption mt-1">{stage.detail}</p>
        </li>;
      })}
      {status === "pending" || status === "cancelled" || status === "returned" ? <li className="relative pb-2"><span aria-hidden className="absolute -left-[1.62rem] top-1 size-3 rounded-full border border-line bg-ivory" /><p className="text-sm font-medium capitalize text-indigo">{status}</p></li> : null}
      {trackingNumber ? <li className="pt-4 text-xs text-muted">Tracking reference: <span className="font-medium text-ink">{trackingNumber}</span></li> : null}
    </ol>
  );
}
