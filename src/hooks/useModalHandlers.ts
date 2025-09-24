import type { Product, Category } from '../types';
import type { UseDashboardState } from './useDashboardState';

type ModalHandlersProps = UseDashboardState & {
  loadProductsForCategory?: (categoryId: string) => Promise<void> | void;
};

export const useModalHandlers = (state: ModalHandlersProps) => {
  const {
    setEditingProduct,
    setIsEditModalOpen,
    setViewingProduct,
    setIsViewModalOpen,
    setDeletingProduct,
    setIsDeleteModalOpen,
    setEditingCategory,
    setIsCategoryModalOpen,
    setProductsForCategory,
    setViewingCategory,
    setIsCategoryViewModalOpen,
    setDeletingCategory,
    setIsCategoryDeleteModalOpen,
  loadProductsForCategory,
  } = state;

  const handleAddProduct = () => {
    const newProduct: Product = {
      _id: '',
      name: '',
      description: '',
      category: '',
      categoryId: '',
      price: 0,
      originalPrice: 0,
      rating: 0,
      reviews: 0,
      images: [],
      colors: [],
      sizes: [],
      features: [],
      specifications: {},
      tags: [],
      inStock: true,
      bestseller: false,
      featured: false,
    };
    setEditingProduct(newProduct);
    setIsEditModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      _id: '',
      id: undefined,
      name: '',
      slug: '',
      description: '',
      status: 'active',
      metaTitle: '',
      metaDescription: '',
      image: '',
      displayOrder: 0,
      sortOrder: 0,
      productCount: 0,
      parentCategory: undefined,
      adminNotes: '',
      createdAt: '',
      updatedAt: '',
      isActive: true,
      fullSlug: '',
    };
    setEditingCategory(newCategory);
    setProductsForCategory([]);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = async (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
    if (category._id && loadProductsForCategory) {
      await loadProductsForCategory(category._id);
    }
  };

  const handleViewCategory = async (category: Category) => {
    setViewingCategory(category);
    if (category._id && loadProductsForCategory) {
      await loadProductsForCategory(category._id);
    }
    setIsCategoryViewModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setIsCategoryDeleteModalOpen(true);
  };

  return {
    handleAddProduct,
    handleEditProduct,
    handleViewProduct,
    handleDeleteProduct,
    handleAddCategory,
    handleEditCategory,
    handleViewCategory,
    handleDeleteCategory,
  };
};
