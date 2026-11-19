"use client";

import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useCartStore, selectCartCount, selectCartGroups } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";

export function MiniCart() {
  const open = useUIStore((state) => state.cartOpen);
  const setOpen = useUIStore((state) => state.setCartOpen);
  const groups = useCartStore(selectCartGroups);
  const count = useCartStore(selectCartCount);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = groups.reduce((sum, group) => sum + group.subtotal, 0);
  return (
    <Sheet open={open} onOpenChange={setOpen} title="Your bag" description={`${count} ${count === 1 ? "item" : "items"} across ${groups.length} ${groups.length === 1 ? "store" : "stores"}`} side="right">
      {!count ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
          <ShoppingBag aria-hidden className="size-8 text-gold-ink" />
          <p className="body">Your bag is ready for something considered.</p>
          <ButtonLink href="/shop" onClick={() => setOpen(false)}>Explore the collection</ButtonLink>
        </div>
      ) : (
        <div className="space-y-7">
          {groups.map((group) => (
            <section key={group.merchantId} aria-label={`Items from ${group.merchantId}`}>
              <h3 className="eyebrow mb-3">{group.items[0]?.merchantName ?? "SELVARQ maker"}</h3>
              <ul className="space-y-4">
                {group.items.map((item) => {
                  return (
                    <li key={item.variantId} className="flex items-start gap-3 border-b border-line pb-4">
                      <Link href={item.slug ? `/product/${item.slug}` : "/shop"} onClick={() => setOpen(false)} className="flex-1">
                        <span className="block text-sm font-medium text-ink">{item.name}</span>
                        <span className="caption">{item.color} / {item.size} · Qty {item.quantity}</span>
                      </Link>
                      <span className="text-sm text-ink">Rs {((item.unitPrice * item.quantity) / 100).toLocaleString("en-IN")}</span>
                      <button type="button" onClick={() => removeItem(item.variantId)} aria-label={`Remove ${item.name}`} className="grid size-10 place-items-center text-muted hover:text-danger">
                        <Trash2 aria-hidden className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-right text-xs text-muted">Store subtotal: Rs {(group.subtotal / 100).toLocaleString("en-IN")}</p>
            </section>
          ))}
          <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
            <span className="font-medium text-ink">Subtotal</span>
            <span className="font-medium text-ink">Rs {(total / 100).toLocaleString("en-IN")}</span>
          </div>
          <ButtonLink href="/cart" fullWidth onClick={() => setOpen(false)}>Review your bag</ButtonLink>
          <Button variant="quiet" fullWidth onClick={() => useCartStore.getState().clear()}>Clear bag</Button>
        </div>
      )}
    </Sheet>
  );
}
