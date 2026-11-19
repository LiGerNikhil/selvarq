import type { Category, Collection, Product } from "@/data";
import { getAdminCategories, getAdminCollections } from "@/lib/admin-store";
import { getPublicDemoProducts } from "@/lib/demo-merchant-store";

export interface CategoriesRepository {
  list(): Promise<Category[]>;
  getById(id: string): Promise<Category | undefined>;
  getBySlug(slug: string): Promise<Category | undefined>;
  getChildren(parentId: string): Promise<Category[]>;
}

export interface CollectionsRepository {
  list(): Promise<Collection[]>;
  getById(id: string): Promise<Collection | undefined>;
  getBySlug(slug: string): Promise<Collection | undefined>;
  getProducts(collectionId: string): Promise<Product[]>;
}

export const mockCategoriesRepository: CategoriesRepository = {
  async list() { return getAdminCategories(); },
  async getById(id) { return getAdminCategories().find((category) => category.id === id); },
  async getBySlug(slug) { return getAdminCategories().find((category) => category.slug === slug); },
  async getChildren(parentId) { return getAdminCategories().filter((category) => category.parentId === parentId); },
};

export const mockCollectionsRepository: CollectionsRepository = {
  async list() { return getAdminCollections(); },
  async getById(id) { return getAdminCollections().find((collection) => collection.id === id); },
  async getBySlug(slug) { return getAdminCollections().find((collection) => collection.slug === slug); },
  async getProducts(collectionId) {
    const ids = new Set(getAdminCollections().find((collection) => collection.id === collectionId)?.productIds ?? []);
    return getPublicDemoProducts().filter((product) => ids.has(product.id) && product.status === "active");
  },
};
