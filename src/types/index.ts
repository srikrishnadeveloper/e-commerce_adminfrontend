export interface Color {
  name: string;
  value: string;
  images?: string[]; // Array of image URLs for this color variant
}

export interface ProductVariant {
  _id?: string;
  sku?: string;
  size?: string;
  color?: Color;
  price?: number;
  originalPrice?: number;
  stockQuantity: number;
  reservedQuantity?: number;
  inStock: boolean;
  images?: string[];
  isActive: boolean;
}

export interface Specifications {
  [key: string]: string | number | boolean;
}

export interface ShippingOption {
  days: string;
  price: string;
}

export interface Shipping {
  standard: ShippingOption;
  express: ShippingOption;
  overnight: ShippingOption;
  international: {
    days: string;
    processing: string;
  };
}

export interface Category {
  _id: string;
  id?: string | number;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'disabled';
  metaTitle?: string;
  metaDescription?: string;
  image?: string;
  displayOrder: number;
  sortOrder: number;
  productCount: number;
  parentCategory?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  fullSlug: string;
}

export interface SizeOption {
  name: string;
  price: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  categoryId: string;
  inStock: boolean;
  hotDeal: boolean;
  rating: number;
  reviews: number;
  images: string[];
  colors: Color[];
  sizes: SizeOption[];
  specifications: Specifications;
  shipping?: Shipping;
  stockQuantity?: number;
  reservedQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  allowBackorder?: boolean;
  createdAt?: string;
  updatedAt?: string;
}



export interface ImageFile {
  name: string;
  path: string;
  size: number;
  modified: string;
  extension: string;
  directory?: string;
}

// Explicit re-exports to ensure proper module resolution

