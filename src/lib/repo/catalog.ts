import { categories, collections, products } from "@/data";
import type { Category, Collection } from "@/data";

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
  getProducts(collectionId: string): Promise<typeof products>;
}

export const mockCategoriesRepository: CategoriesRepository = {
  async list() { return [...categories]; },
  async getById(id) { return categories.find((category) => category.id === id); },
  async getBySlug(slug) { return categories.find((category) => category.slug === slug); },
  async getChildren(parentId) { return categories.filter((category) => category.parentId === parentId); },
};

export const mockCollectionsRepository: CollectionsRepository = {
  async list() { return [...collections]; },
  async getById(id) { return collections.find((collection) => collection.id === id); },
  async getBySlug(slug) { return collections.find((collection) => collection.slug === slug); },
  async getProducts(collectionId) {
    const ids = new Set(collections.find((collection) => collection.id === collectionId)?.productIds ?? []);
    return products.filter((product) => ids.has(product.id) && product.status === "active");
  },
};
