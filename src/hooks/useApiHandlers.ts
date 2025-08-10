import { productsAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';
import type { Product, Category } from '../types';
import type { UseDashboardState } from './useDashboardState';

type ApiHandlersProps = UseDashboardState;

export const useApiHandlers = (state: ApiHandlersProps) => {
  const {
    setProducts,
    setCategories,
    setTotalPages,
    setIsLoading,
    setIsLoadingCategoryProducts,
    setProductsForCategory,
    currentPage,
    searchTerm,
    products,
    categories,
    currentSection,
  } = state;

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const productsResponse = await productsAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
      });
      setProducts(productsResponse.products || []);
      setTotalPages(productsResponse.pagination?.totalPages || 1);

      const categoriesResponse = await categoriesAPI.getAll({
        limit: 100,
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      });
      setCategories(categoriesResponse.categories || []);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoriesData = async () => {
    try {
      setIsLoading(true);
      const categoriesResponse = await categoriesAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      });
      setCategories(categoriesResponse.categories || []);
      setTotalPages(categoriesResponse.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoryProducts = async (categoryId: string) => {
    try {
      setIsLoading(true);
      const response = await categoriesAPI.getProducts(categoryId, {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
      });
      setProducts(response.products || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error('Error loading category products:', error);
      toast.error('Failed to load category products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductsForCategory = async (categoryId: string) => {
    try {
      setIsLoadingCategoryProducts(true);
      const response = await categoriesAPI.getProducts(categoryId, { limit: 100 });
      setProductsForCategory(response.products || []);
    } catch (error) {
      console.error('Error loading products for category:', error);
      toast.error('Failed to load products for this category.');
      setProductsForCategory([]);
    } finally {
      setIsLoadingCategoryProducts(false);
    }
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    const isNew = !updatedProduct._id;
    const action = isNew ? 'Creating' : 'Updating';
    const loadingToast = toast.loading(`${action} product...`);

    try {
      let response: Product;
      if (isNew) {
        const { _id, ...productData } = updatedProduct;
        response = await productsAPI.create(productData);
        setProducts([response, ...products]);
      } else {
        response = await productsAPI.update(updatedProduct._id, updatedProduct);
        setProducts(products.map((p) => (p._id === updatedProduct._id ? response : p)));
      }

      toast.success(`Product ${isNew ? 'created' : 'updated'} successfully!`, { id: loadingToast });
      return true;
    } catch (error: any) {
      console.error(`Error saving product:`, error);
      const errorMessage = error.response?.data?.message || 'Failed to save product';
      toast.error(errorMessage, { id: loadingToast });
      return false;
    }
  };

  const confirmDeleteProduct = async (deletingProduct: Product | null) => {
    if (!deletingProduct) return false;

    const loadingToast = toast.loading(`Deleting ${deletingProduct.name}...`);
    try {
      await productsAPI.delete(deletingProduct._id);
      setProducts(products.filter((p) => p._id !== deletingProduct._id));
      toast.success(`${deletingProduct.name} deleted successfully!`, { id: loadingToast });
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete product';
      toast.error(errorMessage, { id: loadingToast });
      return false;
    }
  };

  const handleSaveCategory = async (updatedCategory: Omit<Category, '_id' | 'slug' | 'productCount' | 'createdAt' | 'updatedAt'> & { _id?: string }) => {
    const isNew = !updatedCategory._id;
    const action = isNew ? 'Creating' : 'Updating';
    const loadingToast = toast.loading(`${action} category...`);

    try {
      let response: Category;
      if (isNew) {
        response = await categoriesAPI.create(updatedCategory);
        setCategories([response, ...categories]);
      } else {
        response = await categoriesAPI.update(updatedCategory._id!, updatedCategory);
        setCategories(categories.map((c) => (c._id === updatedCategory._id ? { ...c, ...response } : c)));
      }

      toast.success(`Category ${isNew ? 'created' : 'updated'} successfully!`, { id: loadingToast });
      return true;
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save category';
      toast.error(errorMessage, { id: loadingToast });
      return false;
    }
  };

  const confirmDeleteCategory = async (deletingCategory: Category | null, reassignTo?: string) => {
    if (!deletingCategory) return false;

    const loadingToast = toast.loading(`Deleting ${deletingCategory.name}...`);
    try {
      await categoriesAPI.delete(deletingCategory._id, reassignTo);
      setCategories(categories.filter((c) => c._id !== deletingCategory._id));
      toast.success(`${deletingCategory.name} deleted successfully!`, { id: loadingToast });
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage, { id: loadingToast });
      return false;
    }
  };

  return {
    loadDashboardData,
    loadCategoriesData,
    loadCategoryProducts,
    loadProductsForCategory,
    handleSaveProduct,
    confirmDeleteProduct,
    handleSaveCategory,
    confirmDeleteCategory,
  };
};
