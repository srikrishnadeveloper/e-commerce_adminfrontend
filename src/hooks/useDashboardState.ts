import { useState } from 'react';
import type { Product, Category } from '../types';

export const useDashboardState = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Category states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [isCategoryViewModalOpen, setIsCategoryViewModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
  const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState<string>('');
  const [productsForCategory, setProductsForCategory] = useState<Product[]>([]);
  const [isLoadingCategoryProducts, setIsLoadingCategoryProducts] = useState(false);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('products');

  return {
    products,
    setProducts,
    categories,
    setCategories,
    isLoading,
    setIsLoading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    editingProduct,
    setEditingProduct,
    isEditModalOpen,
    setIsEditModalOpen,
    viewingProduct,
    setViewingProduct,
    isViewModalOpen,
    setIsViewModalOpen,
    deletingProduct,
    setDeletingProduct,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    editingCategory,
    setEditingCategory,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    viewingCategory,
    setViewingCategory,
    isCategoryViewModalOpen,
    setIsCategoryViewModalOpen,
    deletingCategory,
    setDeletingCategory,
    isCategoryDeleteModalOpen,
    setIsCategoryDeleteModalOpen,
    selectedCategoryForProducts,
    setSelectedCategoryForProducts,
    productsForCategory,
    setProductsForCategory,
    isLoadingCategoryProducts,
    setIsLoadingCategoryProducts,
    sidebarOpen,
    setSidebarOpen,
    currentSection,
    setCurrentSection,
      // Expose functions consumed by other hooks via type-level declaration
  };
};

export type UseDashboardState = ReturnType<typeof useDashboardState>;
