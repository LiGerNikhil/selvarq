import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DataColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Tailwind class applied to both the header and body cells. */
  className?: string;
  /** Hide this value on the mobile card layout. */
  mobileHidden?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  caption,
  empty,
}: {
  columns: DataColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  caption?: string;
  empty?: ReactNode;
}) {
  if (!rows.length) {
    return <div className="p-8 text-center text-sm text-muted">{empty ?? "Nothing to show yet."}</div>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[44rem] text-left text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-pearl">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={cn("whitespace-nowrap p-3 text-xs font-medium uppercase tracking-[0.1em] text-muted", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="border-t border-line align-top">
                {columns.map((column) => (
                  <td key={column.key} className={cn("p-3", column.className)}>{column.cell(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {rows.map((row) => (
          <li key={getRowKey(row)} className="space-y-2 p-4">
            {columns.filter((column) => !column.mobileHidden).map((column, index) => (
              <div key={column.key} className={cn("flex items-start justify-between gap-3", index === 0 && "block")}>
                <span className={cn("text-[11px] uppercase tracking-[0.12em] text-muted", index === 0 && "sr-only")}>{column.header}</span>
                <span className={cn("min-w-0 text-sm", index === 0 ? "font-medium text-indigo" : "text-right")}>{column.cell(row)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}

/** Small label/value pair used inside mobile cards and detail pages. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <dt className="text-xs uppercase tracking-[0.1em] text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-sm">{children}</dd>
    </div>
  );
}