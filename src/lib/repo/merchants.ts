import type { Merchant, MerchantStatus } from "@/data";
import { getAdminMerchants } from "@/lib/admin-store";
import { getMerchantProfile } from "@/lib/demo-merchant-store";
import { paginate, type Page, type PageOptions } from "./types";

export interface MerchantQuery extends PageOptions {
  status?: MerchantStatus;
  city?: string;
  search?: string;
}

export interface MerchantsRepository {
  getById(id: string): Promise<Merchant | undefined>;
  getBySlug(slug: string): Promise<Merchant | undefined>;
  list(query?: MerchantQuery): Promise<Page<Merchant>>;
}

function currentProfile(merchant: Merchant): Merchant {
  const profile = getMerchantProfile(merchant.id);
  if (!profile) return merchant;
  return { ...merchant, name: profile.name, bio: profile.bio, city: profile.city, logoId: profile.logoId, slug: profile.slug, status: profile.status };
}

export const mockMerchantsRepository: MerchantsRepository = {
  async getById(id) {
    const merchant = getAdminMerchants().find((item) => item.id === id);
    return merchant ? currentProfile(merchant) : undefined;
  },
  async getBySlug(slug) {
    const merchant = getAdminMerchants().find((item) => item.slug === slug);
    return merchant ? currentProfile(merchant) : undefined;
  },
  async list(query = {}) {
    const search = query.search?.trim().toLocaleLowerCase("en-IN");
    const results = getAdminMerchants().map(currentProfile).filter((merchant) =>
      (!query.status || merchant.status === query.status) &&
      (!query.city || merchant.city.toLocaleLowerCase("en-IN") === query.city.toLocaleLowerCase("en-IN")) &&
      (!search || `${merchant.name} ${merchant.bio} ${merchant.city}`.toLocaleLowerCase("en-IN").includes(search)),
    );
    return paginate(results, query);
  },
};
