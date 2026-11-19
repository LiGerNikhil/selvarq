import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AdminPageHeader, AdminSection, StatCard } from "@/components/admin/admin-ui";
import { DataTable, type DataColumn } from "@/components/admin/data-table";
import { listDemoAccounts, type DemoAccount } from "@/lib/demo-account-store";
import { ordersRepository } from "@/lib/repo";
import { formatDate, formatINR, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Admin users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const role = params.role === "customer" || params.role === "merchant" || params.role === "admin" ? params.role : "all";
  const accounts = listDemoAccounts();
  const orders = (await ordersRepository.list({ pageSize: 500 })).items;
  const rows = accounts
    .filter((account) => role === "all" || account.role === role)
    .filter((account) => !q || `${account.name} ${account.email} ${account.phone}`.toLowerCase().includes(q))
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));

  function stats(account: DemoAccount) {
    const own = orders.filter((order) => order.userId === account.id);
    return { orders: own.length, spend: own.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + order.total, 0) };
  }

  const columns: DataColumn<DemoAccount>[] = [
    {
      key: "user",
      header: "Person",
      cell: (account) => (
        <div>
          <p className="font-medium text-indigo">{account.name}</p>
          <p className="caption mt-0.5">{account.email}</p>
        </div>
      ),
    },
    { key: "phone", header: "Phone", cell: (account) => account.phone },
    { key: "role", header: "Role", cell: (account) => <Badge variant={account.role === "admin" ? "indigo" : account.role === "merchant" ? "gold" : "outline"}>{account.role}</Badge> },
    { key: "merchant", header: "Merchant", cell: (account) => account.merchantId ?? "—" },
    { key: "joined", header: "Joined", cell: (account) => formatDate(account.joinedAt), className: "whitespace-nowrap" },
    { key: "orders", header: "Orders", cell: (account) => formatNumber(stats(account).orders), className: "whitespace-nowrap" },
    { key: "spend", header: "Lifetime spend", cell: (account) => formatINR(stats(account).spend), className: "text-right whitespace-nowrap" },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="People"
        title="Customers & accounts"
        description="Demo accounts created during registration and seeded users. Read-only in P10, with spend derived from orders."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="All accounts" value={formatNumber(accounts.length)} />
        <StatCard label="Customers" value={formatNumber(accounts.filter((account) => account.role === "customer").length)} />
        <StatCard label="Merchant owners" value={formatNumber(accounts.filter((account) => account.role === "merchant").length)} />
      </div>

      <form method="get" className="mb-4 grid gap-3 border border-line bg-ivory p-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto]">
        <Input name="q" label="Search" placeholder="Name, email or phone" defaultValue={params.q ?? ""} />
        <Select name="role" label="Role" defaultValue={role}>
          <option value="all">All roles</option>
          <option value="customer">Customers</option>
          <option value="merchant">Merchants</option>
          <option value="admin">Admins</option>
        </Select>
        <div className="flex items-end gap-2">
          <Button type="submit">Filter</Button>
        </div>
      </form>

      <AdminSection title="Accounts" description={`${rows.length} of ${accounts.length} accounts`}>
        <DataTable columns={columns} rows={rows} getRowKey={(account) => account.id} caption="Accounts" empty="No accounts match these filters." />
      </AdminSection>
    </>
  );
}