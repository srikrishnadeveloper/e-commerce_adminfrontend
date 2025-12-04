import React, { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, ensureApiBase } from '../services/api';
import { Button } from './ui/button';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Package, 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  BarChart3,
  Settings,
  Users,
  ShoppingCart,
  Menu,
  X,
  Home,
  Package2,
  Bell,
  AlertTriangle,
  Tags,
  FolderOpen,
  TrendingUp,
  Mail,
  Download,
  LogOut,
} from 'lucide-react';
import ProductModal from './modals/ProductModal';
import CategoryModal from './modals/CategoryModal';
import ProductDetails from './modals/ProductDetails';
import CategoryDetailsModal from './modals/CategoryDetailsModal';
import CategoryManagement from '../pages/CategoryManagement';
import CustomerManagement from '../pages/CustomerManagement';
import OrderManagement from '../pages/OrderManagement';
import OrderAnalytics from '../pages/OrderAnalytics';
import Analytics from '../pages/Analytics';
import BulkEmailSender from '../pages/BulkEmailSender';
import ExportReports from '../pages/ExportReports';
import SiteConfigPanel from './SiteConfigPanel';
import type { Product, Category } from '../types';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
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
  const [currentSection, setCurrentSection] = useState<string>('analytics');

  useEffect(() => {
    if (currentSection === 'categories') {
      loadCategoriesData();
    } else if (currentSection === 'products') {
      if (selectedCategoryForProducts) {
        loadCategoryProducts(selectedCategoryForProducts);
      } else {
        loadDashboardData();
      }
    } else {
      loadDashboardData();
    }
  }, [currentPage, searchTerm, currentSection, selectedCategoryForProducts]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Ensure API base is reachable (auto-detect 5001/5000)
      await ensureApiBase();

      // Load products
      const productsResponse = await productsAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      });
      
      setProducts(productsResponse.data || []);
      setTotalPages(productsResponse.pagination?.totalPages || 1);

      // Load categories
      const categoriesResponse = await categoriesAPI.getAll({
        limit: 100, // Load all categories for dropdown
        sortBy: 'sortOrder',
        sortOrder: 'asc'
      });
      
      setCategories(categoriesResponse.data || []);
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      
      // Show error toast for loading issues
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        // Token might be expired, redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error('Failed to load data. Please try again.');
      }
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
        sortOrder: 'asc'
      });
      
      setCategories(categoriesResponse.data || []);
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
        search: searchTerm || undefined
      });
      
      setProducts(response.data || []);
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
      const response = await categoriesAPI.getProducts(categoryId, { limit: 100 }); // Fetch up to 100 products
      setProductsForCategory(response.data || []);
    } catch (error) {
      console.error('Error loading products for category:', error);
      toast.error('Failed to load products for this category.');
      setProductsForCategory([]);
    } finally {
      setIsLoadingCategoryProducts(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      setIsLoading(true);
      
      let response: Product;
      
      if (updatedProduct._id) {
        // Update existing product
        const loadingToast = toast.loading('Updating product...');
        response = await productsAPI.update(updatedProduct._id, updatedProduct);
        
        // Optimistic update - immediately update the UI
        setProducts(products.map(p => 
          p._id === updatedProduct._id ? { ...response } : p
        ));
        
        toast.success('Product updated successfully!', { id: loadingToast });
      } else {
        // Create new product
        const loadingToast = toast.loading('Creating product...');
        const { _id, ...productData } = updatedProduct;
        response = await productsAPI.create(productData);
        
        // Optimistic update - immediately add to UI
        setProducts([response, ...products]);
        
        toast.success('Product created successfully!', { id: loadingToast });
      }
      
      // Close the modal immediately for better UX
      setIsEditModalOpen(false);
      setEditingProduct(null);
      
      // Optional: Reload data in background to ensure consistency
      setTimeout(() => loadDashboardData(), 100);
      
    } catch (error: any) {
      console.error('Error saving product:', error);
      
      // Detailed error handling with toast
      let errorMessage = 'Failed to save product';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    
    try {
      setIsLoading(true);
      const loadingToast = toast.loading(`Deleting ${deletingProduct.name}...`);
      
      await productsAPI.delete(deletingProduct._id);
      
      // Optimistic update - immediately remove from UI
      setProducts(products.filter(p => p._id !== deletingProduct._id));
      
      toast.success(`${deletingProduct.name} deleted successfully!`, { id: loadingToast });
      
      // Close the modal
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
      
      // Optional: Reload data in background to ensure consistency
      setTimeout(() => loadDashboardData(), 100);
      
    } catch (error: any) {
      console.error('Error deleting product:', error);
      
      let errorMessage = 'Failed to delete product';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    // Create a new empty product template
    const newProduct: Product = {
      _id: '', // Will be set by the backend
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
      featured: false
    };
    
    setEditingProduct(newProduct);
    setIsEditModalOpen(true);
  };

  // Category Management Functions
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
      fullSlug: ''
    };
    
    setEditingCategory(newCategory);
    setProductsForCategory([]); // Clear products for new category
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = async (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
    const categoryId = String(category.id || category._id);
    if (categoryId) {
      await loadProductsForCategory(categoryId);
    }
  };

  const handleViewCategory = async (category: Category) => {
    setViewingCategory(category);
    const categoryId = String(category.id || category._id);
    if (categoryId) {
      await loadProductsForCategory(categoryId);
    }
    setIsCategoryViewModalOpen(true);
  };

  const handleSaveCategory = async (updatedCategory: Omit<Category, '_id' | 'slug' | 'productCount' | 'createdAt' | 'updatedAt'> & { _id?: string; id?: number }) => {
    try {
      setIsLoading(true);

      let response: Category;
      const categoryId = String(updatedCategory.id || updatedCategory._id);

      if (categoryId && categoryId !== 'undefined') {
        // Update existing category
        const loadingToast = toast.loading('Updating category...');
        response = await categoriesAPI.update(categoryId, updatedCategory);

        // Optimistic update - immediately update the UI
        setCategories(categories.map(c =>
          String(c.id || c._id) === categoryId ? { ...c, ...response } : c
        ));

        toast.success('Category updated successfully!', { id: loadingToast });
      } else {
        // Create new category
        const loadingToast = toast.loading('Creating category...');
        response = await categoriesAPI.create(updatedCategory);

        // Optimistic update - immediately add to UI
        setCategories([response, ...categories]);

        toast.success('Category created successfully!', { id: loadingToast });
      }
      
      // Close the modal immediately for better UX
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      
      // Reload data in background to ensure consistency
      setTimeout(() => {
        if (currentSection === 'categories') {
          loadCategoriesData();
        } else {
          loadDashboardData();
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Error saving category:', error);
      
      let errorMessage = 'Failed to save category';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setIsCategoryDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async (reassignTo?: string) => {
    if (!deletingCategory) return;
    
    try {
      setIsLoading(true);
      const loadingToast = toast.loading(`Deleting ${deletingCategory.name}...`);
      
      const categoryId = String(deletingCategory.id || deletingCategory._id);
      await categoriesAPI.delete(categoryId, reassignTo);

      // Optimistic update - immediately remove from UI
      setCategories(categories.filter(c => String(c.id || c._id) !== categoryId));
      
      toast.success(`${deletingCategory.name} deleted successfully!`, { id: loadingToast });
      
      // Close the modal
      setIsCategoryDeleteModalOpen(false);
      setDeletingCategory(null);
      
      // Reload data in background to ensure consistency
      setTimeout(() => {
        if (currentSection === 'categories') {
          loadCategoriesData();
        } else {
          loadDashboardData();
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Error deleting category:', error);
      
      let errorMessage = 'Failed to delete category';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-card backdrop-blur-xl border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Package2 className="h-8 w-8 text-foreground" />
            <span className="text-xl font-bold text-foreground">Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-foreground hover:bg-muted"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-1">
            <button 
              onClick={() => {
                setCurrentSection('products');
                setSelectedCategoryForProducts('');
                setCurrentPage(1);
              }}
              className={`${currentSection === 'products' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <Package className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Products
            </button>
            <button
              onClick={() => {
                setCurrentSection('categories');
                setCurrentPage(1);
              }}
              className={`${currentSection === 'categories' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <Tags className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Categories
            </button>
            <button
              onClick={() => setCurrentSection('category-management')}
              className={`${currentSection === 'category-management' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <FolderOpen className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Category Management
            </button>
            <button
              onClick={() => setCurrentSection('orders')}
              className={`${currentSection === 'orders' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <ShoppingCart className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Orders
            </button>
            <button
              onClick={() => {
                setCurrentSection('customers');
                setCurrentPage(1);
              }}
              className={`${currentSection === 'customers' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <Users className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Customers
            </button>
            <button
              onClick={() => setCurrentSection('analytics')}
              className={`${currentSection === 'analytics' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <BarChart3 className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Analytics
            </button>
            <button
              onClick={() => setCurrentSection('bulk-email')}
              className={`${currentSection === 'bulk-email' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <Mail className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Bulk Email
            </button>
            <button
              onClick={() => setCurrentSection('export')}
              className={`${currentSection === 'export' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <Download className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Export Reports
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <button 
              onClick={() => setCurrentSection('settings')}
              className={`${currentSection === 'settings' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <Settings className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Settings
            </button>
            <button 
              onClick={onLogout}
              className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left mt-1"
            >
              <LogOut className="text-muted-foreground group-hover:text-red-500 mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Header */}
        <header className="bg-card backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-foreground hover:bg-muted"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">
                {currentSection === 'products' && 'Products'}
                {currentSection === 'categories' && 'Categories'}
                {currentSection === 'category-management' && 'Category Management'}
                {currentSection === 'orders' && 'Orders'}
                {currentSection === 'customers' && 'Customers'}
                {currentSection === 'analytics' && 'Analytics'}
                {currentSection === 'settings' && 'Settings'}
              </h1>
            </div>
            

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {currentSection === 'products' && (
            <>
              {/* Products Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Products</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-80 bg-input border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                    onClick={handleAddProduct}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
                  <span className="ml-3 text-muted-foreground">Loading products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No products found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div 
                      key={product._id} 
                      className="relative bg-card border border-border rounded-md overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col"
                      style={{ 
                        height: 'clamp(450px, 40vw, 520px)'
                      }}
                    >
                      {/* Product Image */}
                      <div className="relative w-full bg-muted overflow-hidden" style={{ 
                        height: 'clamp(280px, 25vw, 320px)'
                      }}>
                        {(() => { const resolveImg = (p?: string) => p ? (p.startsWith('http') ? p : `http://localhost:5001${p}`) : 'http://localhost:5001/images/placeholder.svg'; return (
                        <img
                          src={resolveImg(product.images?.[0])}
                          alt={product.name}
                          className="w-full h-full max-w-full max-h-full object-cover"
                          style={{
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                            minHeight: '100%',
                            maxHeight: '100%',
                            minWidth: '100%',
                            maxWidth: '100%',
                            objectFit: 'cover'
                          }}
                        /> ); })()}
                        
                        {/* Discount Badge */}
                        {product.originalPrice > product.price && (
                          <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </div>
                        )}
                        
                        {/* Status Badges */}
                        <div className="absolute top-3 left-3 flex flex-col space-y-2">
                          {product.bestseller && (
                            <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 backdrop-blur-sm">
                              Best Seller
                            </span>
                          )}
                          {product.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 backdrop-blur-sm">
                              Featured
                            </span>
                          )}
                        </div>
                        
                        {/* Stock Status */}
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium backdrop-blur-sm ${
                            product.inStock 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 flex flex-col justify-between p-4 text-center" style={{ paddingTop: '10px' }}>
                        {/* Category */}
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                          {product.category}
                        </div>

                        {/* Product Name */}
                        <h3 
                          className="text-foreground leading-tight flex items-center justify-center mb-3" 
                          style={{ 
                            fontSize: '16px', 
                            fontWeight: 'normal',
                            height: 'clamp(40px, 8vw, 50px)',
                            minHeight: 'clamp(40px, 8vw, 50px)',
                            maxHeight: 'clamp(40px, 8vw, 50px)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}
                        >
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="mb-3">
                          <span className="text-foreground" style={{ fontSize: '16px', fontWeight: '600' }}>
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-muted-foreground line-through ml-2" style={{ fontSize: '16px', fontWeight: '600' }}>
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-foreground">{product.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {currentSection === 'categories' && (
            <>
              {/* Categories Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Categories</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-80 bg-input border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                  </div>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                    onClick={handleAddCategory}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </div>

              {/* Categories Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
                  <span className="ml-3 text-muted-foreground">Loading categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No categories found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categories.map((category) => (
                    <div
                      key={category.id || category._id}
                      className="relative bg-card border border-border rounded-md overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col p-6"
                    >
                      {/* Category Image */}
                      <div className="relative w-full h-32 bg-muted rounded-sm mb-4 overflow-hidden">
                        {category.image ? (
                          (() => { const resolveImg = (p?: string) => p ? (p.startsWith('http') ? p : `http://localhost:5001${p}`) : 'http://localhost:5001/images/placeholder.svg'; return (
                          <img
                            src={resolveImg(category.image)}
                            alt={category.name}
                            className="w-full h-full max-w-full max-h-full object-cover"
                            style={{
                              minHeight: '100%',
                              maxHeight: '100%',
                              minWidth: '100%',
                              maxWidth: '100%',
                              objectFit: 'cover'
                            }}
                          />); })()
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderOpen className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${
                            category.isActive 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Category Content */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{category.name}</h3>
                        
                        {category.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            {category.productCount} products
                          </span>
                          <span className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            #{category.sortOrder}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-auto">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                            onClick={() => handleViewCategory(category)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className="border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {currentSection === 'orders' && <OrderManagement />}

          {currentSection === 'customers' && (
            <div className="text-center py-20">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl text-muted-foreground">Customer Management</h2>
              <p className="text-muted-foreground mt-2">Customer management functionality coming soon</p>
            </div>
          )}

          {currentSection === 'analytics' && <Analytics />}

          {currentSection === 'bulk-email' && <BulkEmailSender />}

          {currentSection === 'export' && <ExportReports />}

          {currentSection === 'category-management' && (
            <CategoryManagement />
          )}

          {currentSection === 'customers' && (
            <CustomerManagement />
          )}

          {currentSection === 'settings' && (
            <SiteConfigPanel />
          )}
        </main>
      </div>

      {/* Modals */}
      <ProductModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
      />

      <ProductDetails
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={viewingProduct}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
        products={productsForCategory}
        isLoadingProducts={isLoadingCategoryProducts}
        onProductClick={(product: Product) => handleViewProduct(product)}
        formatPrice={formatPrice}
      />

      <CategoryDetailsModal
        isOpen={isCategoryViewModalOpen}
        onClose={() => setIsCategoryViewModalOpen(false)}
        category={viewingCategory}
        products={productsForCategory}
        isLoadingProducts={isLoadingCategoryProducts}
        onProductClick={(product) => handleViewProduct(product)}
        formatPrice={formatPrice}
      />

      {/* Delete Product Confirmation Modal */}
      {isDeleteModalOpen && deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
          <div className="bg-card rounded-lg shadow-xl p-8 w-full max-w-md">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Confirm Deletion</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete the product "{deletingProduct.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteProduct}
                className="w-full"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {isCategoryDeleteModalOpen && deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
          <div className="bg-card rounded-lg shadow-xl p-8 w-full max-w-md">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Confirm Deletion</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete the category "{deletingCategory.name}"? 
                {deletingCategory.productCount > 0 && " This category has products associated with it."}
                This action cannot be undone.
              </p>
              {deletingCategory.productCount > 0 && (
                <div className="text-left mb-4">
                  <p className="text-muted-foreground">
                    You must reassign products to another category before deleting.
                  </p>
                  {/* Here you could add a dropdown to select a new category */}
                </div>
              )}
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsCategoryDeleteModalOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmDeleteCategory()}
                disabled={deletingCategory.productCount > 0}
                className="w-full"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
};











export default Dashboard;

