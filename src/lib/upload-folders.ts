/** Shared between the upload route (server) and the uploader UI (client). */
export const UPLOAD_FOLDERS = {
  products: "selvarq/products",
  categories: "selvarq/categories",
  collections: "selvarq/collections",
  banners: "selvarq/banners",
  stories: "selvarq/stories",
  merchants: "selvarq/merchants",
  "seller-applications": "selvarq/seller-applications",
} as const;

export type UploadFolderKey = keyof typeof UPLOAD_FOLDERS;

export const UPLOAD_FOLDER_KEYS = Object.keys(UPLOAD_FOLDERS) as UploadFolderKey[];

/** Folders a signed-in merchant may write to. */
export const MERCHANT_UPLOAD_FOLDERS: UploadFolderKey[] = ["products", "merchants"];

/** Folder guests may write to while completing a seller application. */
export const GUEST_UPLOAD_FOLDER: UploadFolderKey = "seller-applications";
