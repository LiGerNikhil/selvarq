"use client";

import { Button } from "@/components/ui/button";

export function PrintInvoiceButton() {
  return <Button className="print:hidden" onClick={() => window.print()}>Print invoice</Button>;
}
