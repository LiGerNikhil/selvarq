import { ensureAdminMerchant } from "@/lib/admin-store";
import { ensureDemoAccount } from "@/lib/demo-account-store";
import { ensureMerchantApplication } from "@/lib/demo-merchant-store";
import { flushPersistence } from "./persistence";

function text(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/**
 * Creates the production access accounts from environment variables.
 *
 * This only runs when demo data is disabled, so a fresh production database
 * contains the admin and seller accounts (plus the seller's merchant record)
 * and none of the seeded demo catalogue. Accounts are created only when they
 * are missing; an existing password is never overwritten.
 */
export async function ensureProductionAccess(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    ensureDemoAccount({
      id: "user-admin-nwxglobalservices",
      name: text(process.env.SEED_ADMIN_NAME, "Administrator"),
      email: adminEmail,
      phone: text(process.env.SEED_ADMIN_PHONE, "9000000001"),
      password: adminPassword,
      role: "admin",
    });
  }

  const sellerEmail = process.env.SEED_SELLER_EMAIL?.trim().toLowerCase();
  const sellerPassword = process.env.SEED_SELLER_PASSWORD;
  if (sellerEmail && sellerPassword) {
    const merchantId = text(process.env.SEED_SELLER_MERCHANT_ID, "nwx-global-services");
    const ownerUserId = `user-seller-${merchantId}`;
    const businessName = text(process.env.SEED_SELLER_BUSINESS_NAME, "NWX Global Services");
    const ownerName = text(process.env.SEED_SELLER_NAME, businessName);
    const city = text(process.env.SEED_SELLER_CITY, "Jaipur");
    const bio = text(process.env.SEED_SELLER_BIO, "A SELVARQ seller storefront.");
    const logoId = `placeholder:${merchantId}`;

    ensureDemoAccount({
      id: ownerUserId,
      name: ownerName,
      email: sellerEmail,
      phone: text(process.env.SEED_SELLER_PHONE, "9000000002"),
      password: sellerPassword,
      role: "merchant",
      merchantId,
    });

    ensureMerchantApplication({
      merchantId,
      ownerUserId,
      ownerName,
      email: sellerEmail,
      phone: text(process.env.SEED_SELLER_PHONE, "9000000002"),
      businessName,
      displayName: businessName,
      city,
      bio,
      logoId,
    });

    ensureAdminMerchant({
      id: merchantId,
      ownerUserId,
      name: businessName,
      email: sellerEmail,
      city,
      bio,
      logoId,
      status: "approved",
    });
  }

  await flushPersistence();
}
