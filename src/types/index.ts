export interface Color {
  name: string;
  value: string;
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

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  categoryId: string;
  inStock: boolean;
  bestseller: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  images: string[];
  colors: Color[];
  sizes: string[];
  features: string[];
  specifications: Specifications;
  tags: string[];
  shipping?: Shipping;
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

