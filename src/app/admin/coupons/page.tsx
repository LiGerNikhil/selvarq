import type { Metadata } from "next";
import { AdminPageHeader, StatCard } from "@/components/admin/admin-ui";
import { CouponManager } from "@/components/admin/coupon-manager";
import { getAdminCoupons, getAdminMerchants } from "@/lib/admin-store";

export const metadata: Metadata = { title: "Admin coupons" };

export default function AdminCouponsPage() {
  const coupons = getAdminCoupons();
  const active = coupons.filter((coupon) => coupon.active);
  return (
    <>
      <AdminPageHeader
        eyebrow="Commerce"
        title="Coupons"
        description="Create, pause, scope and delete discount codes. Changes feed the public bag and checkout validation."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="All coupons" value={String(coupons.length)} />
        <StatCard label="Active codes" value={String(active.length)} tone="positive" />
        <StatCard label="Merchant-scoped" value={String(coupons.filter((coupon) => coupon.merchantId).length)} />
      </div>
      <CouponManager coupons={coupons} merchants={getAdminMerchants()} />
    </>
  );
}