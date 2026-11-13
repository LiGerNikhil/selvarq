import { getMerchantIdentity } from "@/lib/merchant-access";
import { listMerchantOrders } from "@/lib/demo-merchant-store";
import { MerchantOrderList } from "@/components/merchant/order-list";

export default async function MerchantOrdersPage() {
  const identity = await getMerchantIdentity();
  if (!identity) return null;
  const orders = await listMerchantOrders(identity.merchantId);
  const counts = [
    { label: "To accept", value: orders.filter((item) => item.status === "placed").length },
    { label: "To dispatch", value: orders.filter((item) => item.status === "packed").length },
    { label: "In transit", value: orders.filter((item) => item.status === "shipped").length },
    { label: "Returns", value: orders.filter((item) => item.status === "return_requested").length },
  ];
  return <div><p className="eyebrow">Fulfilment</p><h2 className="display-md mt-1 text-indigo">Orders & returns</h2><p className="body mt-2">Accept each seller order, pack it, then add carrier and AWB details before dispatch. Return requests stay visible until you confirm the returned parcel.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{counts.map((count) => <article key={count.label} className="border border-line p-3"><p className="caption">{count.label}</p><p className="mt-2 text-xl font-medium text-indigo">{count.value}</p></article>)}</div>
    <MerchantOrderList orders={orders} />
  </div>;
}
