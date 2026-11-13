export interface PageOptions {
  page?: number;
  pageSize?: number;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(items: readonly T[], options: PageOptions = {}): Page<T> {
  const pageSize = Math.max(1, Math.min(100, Math.floor(options.pageSize ?? 24)));
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const page = Math.max(1, Math.min(totalPages || 1, Math.floor(options.page ?? 1)));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageSize, total, totalPages };
}
