import type { Metadata } from "next";
import { AdminPageHeader, StatCard } from "@/components/admin/admin-ui";
import { AdminPasswordForm } from "@/components/admin/password-form";
import { SettingsForm } from "@/components/admin/settings-form";
import { getAdminSettings } from "@/lib/admin-store";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Commerce settings" };

export default function AdminSettingsPage() {
  const settings = getAdminSettings();
  return (
    <>
      <AdminPageHeader
        eyebrow="Platform"
        title="Commerce settings"
        description="Global defaults for commission, tax, delivery and returns. The store reads these values through the server so public pages stay in sync."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Default commission" value={`${settings.defaultCommissionRate}%`} />
        <StatCard label="Free delivery" value={formatINR(settings.freeDeliveryThreshold)} />
        <StatCard label="Standard fee" value={formatINR(settings.standardShippingFee)} />
      </div>
      <SettingsForm settings={settings} />
      <div className="mt-6">
        <AdminPasswordForm />
      </div>
    </>
  );
}