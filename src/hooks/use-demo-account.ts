"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface DemoAccountSummary {
  id: string;
  name: string;
  role: "customer" | "merchant" | "admin";
}

export function useDemoAccount() {
  const pathname = usePathname();
  const [account, setAccount] = useState<DemoAccountSummary | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Account lookup failed with status ${response.status}.`);
        const result = await response.json() as { account: DemoAccountSummary | null };
        setAccount(result.account);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Could not load the current demo account.", error);
      });
    return () => controller.abort();
  }, [pathname]);

  return account;
}
