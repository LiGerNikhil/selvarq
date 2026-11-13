"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export function useListingUrl() {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback((updates: Record<string, string | null>, clearFilters = false) => {
    const params = new URLSearchParams(window.location.search);
    if (clearFilters) {
      for (const key of ["category", "size", "color", "fabric", "fit", "occasion", "merchant", "rating", "discount", "stock", "min", "max", "pageSize"]) {
        params.delete(key);
      }
    }
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router]);
}
