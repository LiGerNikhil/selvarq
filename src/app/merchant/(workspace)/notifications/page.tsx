import { getMerchantIdentity } from "@/lib/merchant-access";
import { listMerchantNotifications } from "@/lib/demo-merchant-store";
import { MerchantNotifications } from "@/components/merchant/notifications";

export default async function MerchantNotificationsPage() {
  const identity = await getMerchantIdentity();
  if (!identity) return null;
  return <div><p className="eyebrow">Seller studio</p><h2 className="display-md mt-1 text-indigo">Notifications</h2><MerchantNotifications notifications={listMerchantNotifications(identity.merchantId)} /></div>;
}
