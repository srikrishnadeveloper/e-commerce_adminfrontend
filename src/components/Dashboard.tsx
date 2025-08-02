  import React, { useState, useEffect } from 'react';
import { productsAPI, imagesAPI, categoriesAPI } from '../services/api';
import { Button } from './ui/button';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Package, 
  Plus,
  Search,
  Filter,
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
  ChevronDown,
  Image as ImageIcon,
  Tags,
  FolderOpen,
  TrendingUp,
  Archive
} from 'lucide-react';

interface Product {
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
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
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
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('products');

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
      
      // Load products
      const productsResponse = await productsAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      });
      
      setProducts(productsResponse.products || []);
      setTotalPages(productsResponse.pagination?.totalPages || 1);

      // Load categories
      const categoriesResponse = await categoriesAPI.getAll({
        limit: 100, // Load all categories for dropdown
        sortBy: 'sortOrder',
        sortOrder: 'asc'
      });
      
      setCategories(categoriesResponse.categories || []);
      
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
        search: searchTerm || undefined
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
      name: '',
      slug: '',
      description: '',
      image: '',
      isActive: true,
      sortOrder: 0,
      productCount: 0,
      createdAt: '',
      updatedAt: ''
    };
    
    setEditingCategory(newCategory);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleViewCategory = (category: Category) => {
    setViewingCategory(category);
    setIsCategoryViewModalOpen(true);
  };

  const handleSaveCategory = async (updatedCategory: Category) => {
    try {
      setIsLoading(true);
      
      let response: Category;
      
      if (updatedCategory._id) {
        // Update existing category
        const loadingToast = toast.loading('Updating category...');
        response = await categoriesAPI.update(updatedCategory._id, updatedCategory);
        
        // Optimistic update - immediately update the UI
        setCategories(categories.map(c => 
          c._id === updatedCategory._id ? { ...response } : c
        ));
        
        toast.success('Category updated successfully!', { id: loadingToast });
      } else {
        // Create new category
        const loadingToast = toast.loading('Creating category...');
        const { _id, slug, createdAt, updatedAt, ...categoryData } = updatedCategory;
        response = await categoriesAPI.create(categoryData);
        
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
      
      await categoriesAPI.delete(deletingCategory._id, reassignTo);
      
      // Optimistic update - immediately remove from UI
      setCategories(categories.filter(c => c._id !== deletingCategory._id));
      
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
              onClick={() => setCurrentSection('dashboard')}
              className={`${currentSection === 'dashboard' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <Home className="text-foreground mr-3 h-5 w-5" />
              Dashboard
            </button>
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
              onClick={() => setCurrentSection('orders')}
              className={`${currentSection === 'orders' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <ShoppingCart className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Orders
            </button>
            <button 
              onClick={() => setCurrentSection('customers')}
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
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <button 
              onClick={() => setCurrentSection('settings')}
              className={`${currentSection === 'settings' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <Settings className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Settings
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
                {currentSection === 'dashboard' && 'Dashboard'}
                {currentSection === 'products' && 'Products'}
                {currentSection === 'categories' && 'Categories'}
                {currentSection === 'orders' && 'Orders'}
                {currentSection === 'customers' && 'Customers'}
                {currentSection === 'analytics' && 'Analytics'}
                {currentSection === 'settings' && 'Settings'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-80 bg-input border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {currentSection === 'dashboard' && (
            <div className="text-center py-20">
              <h2 className="text-xl text-muted-foreground">Welcome to Admin Dashboard</h2>
              <p className="text-muted-foreground mt-2">Select a section from the sidebar to get started</p>
            </div>
          )}

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
                        <ProductImage
                          src={product.images[0] ? `http://localhost:5000/api${product.images[0]}` : '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          style={{ 
                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                          }}
                        />
                        
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
                      key={category._id} 
                      className="relative bg-card border border-border rounded-md overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col p-6"
                    >
                      {/* Category Image */}
                      <div className="relative w-full h-32 bg-muted rounded-sm mb-4 overflow-hidden">
                        {category.image ? (
                          <img
                            src={category.image.startsWith('http') ? category.image : `http://localhost:5000/api${category.image}`}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
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

          {currentSection === 'orders' && (
            <div className="text-center py-20">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl text-muted-foreground">Orders Management</h2>
              <p className="text-muted-foreground mt-2">Order management functionality coming soon</p>
            </div>
          )}

          {currentSection === 'customers' && (
            <div className="text-center py-20">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl text-muted-foreground">Customer Management</h2>
              <p className="text-muted-foreground mt-2">Customer management functionality coming soon</p>
            </div>
          )}

          {currentSection === 'analytics' && (
            <div className="text-center py-20">
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl text-muted-foreground">Analytics Dashboard</h2>
              <p className="text-muted-foreground mt-2">Analytics and reports coming soon</p>
            </div>
          )}

          {currentSection === 'settings' && (
            <div className="text-center py-20">
              <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl text-muted-foreground">Settings</h2>
              <p className="text-muted-foreground mt-2">Application settings coming soon</p>
            </div>
          )}
        </main>
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-card border border-border rounded-md w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-semibold text-foreground">
                {editingProduct._id ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <EditProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {isViewModalOpen && viewingProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-card border border-border rounded-md w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-semibold text-foreground">
                Product Details: {viewingProduct.name}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingProduct(null);
                    handleEditProduct(viewingProduct);
                  }}
                  className="text-foreground hover:bg-muted border-border"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setViewingProduct(null);
                  }}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ProductDetailsView product={viewingProduct} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingProduct && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-md w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/10 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Delete Product
              </h3>
              
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{deletingProduct.name}"</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex space-x-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingProduct(null);
                  }}
                  className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteProduct}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Product
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Edit/Add Modal */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-card border border-border rounded-md w-full max-w-2xl h-[80vh] flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-semibold text-foreground">
                {editingCategory._id ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <CategoryEditForm
                category={editingCategory}
                onSave={handleSaveCategory}
                onCancel={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category View Modal */}
      {isCategoryViewModalOpen && viewingCategory && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="bg-card border border-border rounded-md w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-semibold text-foreground">
                Category Details: {viewingCategory.name}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCategoryViewModalOpen(false);
                    setViewingCategory(null);
                    handleEditCategory(viewingCategory);
                  }}
                  className="text-foreground hover:bg-muted border-border"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Category
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCategoryViewModalOpen(false);
                    setViewingCategory(null);
                  }}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <CategoryDetailsView category={viewingCategory} />
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirmation Modal */}
      {isCategoryDeleteModalOpen && deletingCategory && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-md w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/10 p-3 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Delete Category
              </h3>
              
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{deletingCategory.name}"</span>? 
                This action cannot be undone.
              </p>
              
              {deletingCategory.productCount > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-md mb-4">
                  <p className="text-sm text-yellow-400">
                    This category contains {deletingCategory.productCount} products. 
                    You can reassign them to another category or they will be left without a category.
                  </p>
                  <select className="mt-2 w-full bg-input border border-border rounded-sm p-2 text-foreground">
                    <option value="">No reassignment (products will be uncategorized)</option>
                    {categories
                      .filter(c => c._id !== deletingCategory._id)
                      .map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}
              
              <div className="flex space-x-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCategoryDeleteModalOpen(false);
                    setDeletingCategory(null);
                  }}
                  className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => confirmDeleteCategory()}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Category
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.375rem',
          },
          success: {
            iconTheme: {
              primary: 'hsl(142 76% 36%)',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(0 84% 60%)',
              secondary: 'white',
            },
          },
          loading: {
            iconTheme: {
              primary: 'hsl(var(--muted-foreground))',
              secondary: 'hsl(var(--card))',
            },
          },
        }}
      />
    </div>
  );
};

// Product Image Component with Loading State
interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className, style }) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleImageLoad = () => {
    setImageStatus('loaded');
  };

  const handleImageError = () => {
    setImageStatus('error');
  };

  return (
    <div className="relative w-full h-full">
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={style}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {imageStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Image not found</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Image Selector Component with Dropdown
interface ImageSelectorProps {
  url: string;
  index: number;
  onChange: (url: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ url, index, onChange, onRemove, canRemove }) => {
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error' | 'empty'>('empty');

  // Load available images on component mount
  useEffect(() => {
    loadAvailableImages();
  }, []);

  // Update image status when URL changes
  useEffect(() => {
    if (!url || url.trim() === '') {
      setImageStatus('empty');
      return;
    }

    setImageStatus('loading');
    
    const img = new Image();
    const imageUrl = url.startsWith('http') ? url : `http://localhost:5000/api${url}`;
    
    img.onload = () => setImageStatus('loaded');
    img.onerror = () => setImageStatus('error');
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  const loadAvailableImages = async () => {
    try {
      setIsLoading(true);
      const response = await imagesAPI.getAll();
      setAvailableImages(response.images || []);
    } catch (error) {
      console.error('Failed to load available images:', error);
      toast.error('Failed to load available images');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredImages = availableImages.filter(image =>
    image.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageSelect = (imageName: string) => {
    const imagePath = `/images/${imageName}`;
    onChange(imagePath);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const getStatusColor = () => {
    switch (imageStatus) {
      case 'loading': return 'border-yellow-500';
      case 'loaded': return 'border-green-500';
      case 'error': return 'border-red-500';
      default: return 'border-border';
    }
  };

  const getStatusIcon = () => {
    switch (imageStatus) {
      case 'loading': 
        return <div className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full" />;
      case 'loaded': 
        return <div className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-full" />
        </div>;
      case 'error': 
        return <X className="h-4 w-4 text-red-500" />;
      default: 
        return <ImageIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start space-x-3">
        <div className="flex-1 space-y-2">
          <div className="relative">
            {/* Custom Input/Dropdown */}
            <div className={`relative w-full border rounded-sm bg-input transition-colors ${getStatusColor()}`}>
              <input
                type="text"
                value={url}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 pr-20 bg-transparent text-foreground focus:ring-2 focus:ring-ring focus:border-transparent focus:outline-none"
                placeholder={`Image ${index + 1} (type path or select from dropdown)`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {getStatusIcon()}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-sm shadow-lg max-h-64 overflow-hidden">
                {/* Search */}
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Search images..."
                    />
                  </div>
                </div>

                {/* Images List */}
                <div className="max-h-48 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full mr-2" />
                      <span className="text-sm text-muted-foreground">Loading images...</span>
                    </div>
                  ) : filteredImages.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      {searchTerm ? 'No images found matching your search' : 'No images available'}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredImages.map((imageName) => (
                        <button
                          key={imageName}
                          type="button"
                          className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-muted text-left transition-colors"
                          onClick={() => handleImageSelect(imageName)}
                        >
                          <img
                            src={`http://localhost:5000/api/images/${imageName}`}
                            alt={imageName}
                            className="w-10 h-10 object-cover rounded border border-border flex-shrink-0"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{imageName}</p>
                            <p className="text-xs text-muted-foreground">/images/{imageName}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Click outside to close dropdown */}
            {isDropdownOpen && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsDropdownOpen(false)}
              />
            )}
          </div>
          
          {imageStatus === 'error' && url && (
            <p className="text-red-400 text-xs">
              Failed to load image. Please check the path or select from dropdown.
            </p>
          )}
          
          {imageStatus === 'loading' && url && (
            <p className="text-yellow-400 text-xs">
              Loading image preview...
            </p>
          )}
        </div>

        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 border-border hover:bg-red-500/10 flex-shrink-0 mt-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Image Preview */}
      {imageStatus === 'loaded' && url && (
        <div className="relative">
          <div className="flex items-start space-x-4 p-4 bg-muted border border-border rounded-sm">
            <div className="flex-shrink-0">
              <img
                src={url.startsWith('http') ? url : `http://localhost:5000/api${url}`}
                alt={`Preview ${index + 1}`}
                className="w-20 h-20 object-cover rounded border border-border"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground mb-1">Image Preview {index + 1}</p>
              <p className="text-xs text-muted-foreground break-all">
                {url}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                  Image loaded successfully
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Product Form Component
interface EditProductFormProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Product>(product);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Ensure we always have at least one image field, but allow empty images
  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    const images = product.images || [];
    return images.length > 0 ? images : [''];
  });

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Product description is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.originalPrice < formData.price) newErrors.originalPrice = 'Original price must be greater than or equal to current price';
    if (formData.rating < 0 || formData.rating > 5) newErrors.rating = 'Rating must be between 0 and 5';
    if (formData.reviews < 0) newErrors.reviews = 'Reviews cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUrlChange = (index: number, url: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = url;
    setImageUrls(newImageUrls);
    
    // Filter out empty URLs for the actual form data
    const validImages = newImageUrls.filter(url => url.trim() !== '');
    handleChange('images', validImages);
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
    
    // If no images left, add one empty field
    const finalImageUrls = newImageUrls.length === 0 ? [''] : newImageUrls;
    setImageUrls(finalImageUrls);
    
    // Filter out empty URLs for the actual form data
    const validImages = finalImageUrls.filter(url => url.trim() !== '');
    handleChange('images', validImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with imageUrls:', imageUrls);
    
    // Ensure images array is properly updated before validation
    const validImages = imageUrls.filter(url => url.trim() !== '');
    const finalFormData = {
      ...formData,
      images: validImages
    };
    
    console.log('Final form data:', finalFormData);
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed, saving...');
    setIsSaving(true);
    try {
      await onSave(finalFormData);
      console.log('Save successful');
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getDiscountPercentage = () => {
    if (formData.originalPrice > formData.price) {
      return Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100);
    }
    return 0;
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Product Overview */}
        <div className="bg-card border border-border p-6 rounded-sm">
          <h4 className="text-lg font-semibold text-foreground mb-4">Product Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-sm bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-border'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const selectedCategory = e.target.value;
                  handleChange('category', selectedCategory);
                  // Auto-generate categoryId based on category name
                  handleChange('categoryId', selectedCategory.toLowerCase().replace(/\s+/g, '-'));
                }}
                className={`w-full px-3 py-2 border rounded-sm bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-border'
                }`}
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Audio">Audio</option>
                <option value="Chargers">Chargers</option>
                <option value="Cases">Cases</option>
                <option value="Cables">Cables</option>
                <option value="Watches">Watches</option>
                <option value="Gaming">Gaming</option>
              </select>
              {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-sm bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-border'
              }`}
              placeholder="Enter product description"
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-card border border-border p-6 rounded-sm">
          <h4 className="text-lg font-semibold text-foreground mb-4">Pricing Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-sm bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-border'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Original Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => handleChange('originalPrice', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-sm bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                  errors.originalPrice ? 'border-red-500' : 'border-border'
                }`}
                placeholder="0.00"
              />
              {errors.originalPrice && <p className="text-red-400 text-xs mt-1">{errors.originalPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Discount
              </label>
              <div className="px-3 py-2 border border-border rounded-sm bg-input text-muted-foreground">
                {getDiscountPercentage()}% off
              </div>
            </div>
          </div>
        </div>

        {/* Product Rating & Reviews */}
        <div className="bg-card border border-border p-6 rounded-sm">
          <h4 className="text-lg font-semibold text-foreground mb-4">Rating & Reviews</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rating (0-5) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => handleChange('rating', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-sm bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                  errors.rating ? 'border-red-500' : 'border-border'
                }`}
                placeholder="4.5"
              />
              {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Number of Reviews *
              </label>
              <input
                type="number"
                min="0"
                value={formData.reviews}
                onChange={(e) => handleChange('reviews', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-sm bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${
                  errors.reviews ? 'border-red-500' : 'border-border'
                }`}
                placeholder="150"
              />
              {errors.reviews && <p className="text-red-400 text-xs mt-1">{errors.reviews}</p>}
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-card border border-border p-6 rounded-sm">
          <h4 className="text-lg font-semibold text-foreground mb-4">Product Images</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Choose images from available files or type custom paths. Real-time preview will show as you select.
          </p>
          <div className="space-y-4">
            {imageUrls.map((url, index) => (
              <ImageSelector
                key={index}
                url={url}
                index={index}
                onChange={(newUrl: string) => handleImageUrlChange(index, newUrl)}
                onRemove={() => removeImageUrl(index)}
                canRemove={imageUrls.length > 1}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addImageUrl}
              className="w-full border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Image
            </Button>
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-card border border-border p-6 rounded-sm">
          <h4 className="text-lg font-semibold text-foreground mb-4">Product Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="flex items-center space-x-3 p-4 border border-border rounded-sm bg-input cursor-pointer hover:bg-muted transition-colors">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => handleChange('inStock', e.target.checked)}
                className="rounded-sm border-border text-green-400 focus:ring-green-500 h-5 w-5 bg-input"
              />
              <div>
                <span className="text-sm font-medium text-foreground">In Stock</span>
                <p className="text-xs text-muted-foreground">Product is available for sale</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-4 border border-border rounded-sm bg-input cursor-pointer hover:bg-muted transition-colors">
              <input
                type="checkbox"
                checked={formData.bestseller}
                onChange={(e) => handleChange('bestseller', e.target.checked)}
                className="rounded-sm border-border text-yellow-400 focus:ring-yellow-500 h-5 w-5 bg-input"
              />
              <div>
                <span className="text-sm font-medium text-foreground">Best Seller</span>
                <p className="text-xs text-muted-foreground">Mark as bestselling product</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-4 border border-border rounded-sm bg-input cursor-pointer hover:bg-muted transition-colors">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="rounded-sm border-border text-purple-400 focus:ring-purple-500 h-5 w-5 bg-input"
              />
              <div>
                <span className="text-sm font-medium text-foreground">Featured</span>
                <p className="text-xs text-muted-foreground">Display in featured section</p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Product Details View Component
interface ProductDetailsViewProps {
  product: Product;
}

const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Product Overview */}
        <div className="bg-card border border-border p-6 rounded-md">
          <h4 className="text-lg font-semibold text-foreground mb-4">Product Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Product ID</label>
                <p className="text-foreground font-mono text-sm bg-muted px-3 py-2 rounded-md border">{product._id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Product Name</label>
                <p className="text-foreground text-lg font-semibold">{product.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
                <div className="flex items-center space-x-2">
                  <span className="text-foreground">{product.category}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">ID: {product.categoryId}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Current Price</label>
                <p className="text-foreground text-2xl font-bold">{formatPrice(product.price)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Original Price</label>
                <div className="flex items-center space-x-2">
                  <p className="text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
                  {getDiscountPercentage() > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                      {getDiscountPercentage()}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
            <p className="text-foreground bg-muted p-4 rounded-md border">{product.description}</p>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-card border border-border p-6 rounded-md">
          <h4 className="text-lg font-semibold text-foreground mb-4">Product Images</h4>
          {product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.startsWith('http') ? image : `http://localhost:5000/api${image}`}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-md border border-border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.png';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No images uploaded for this product</p>
            </div>
          )}
        </div>

        {/* Rating & Reviews */}
        <div className="bg-card border border-border p-6 rounded-md">
          <h4 className="text-lg font-semibold text-foreground mb-4">Rating & Reviews</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Rating</label>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-foreground text-xl font-semibold">{product.rating}</span>
                <span className="text-muted-foreground">out of 5</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Total Reviews</label>
              <p className="text-foreground text-xl font-semibold">{product.reviews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-card border border-border p-6 rounded-md">
          <h4 className="text-lg font-semibold text-foreground mb-4">Product Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <div>
                <span className="text-sm font-medium text-foreground">Stock Status</span>
                <p className="text-xs text-muted-foreground">{product.inStock ? 'In Stock' : 'Out of Stock'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${product.bestseller ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
              <div>
                <span className="text-sm font-medium text-foreground">Best Seller</span>
                <p className="text-xs text-muted-foreground">{product.bestseller ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${product.featured ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
              <div>
                <span className="text-sm font-medium text-foreground">Featured</span>
                <p className="text-xs text-muted-foreground">{product.featured ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* MongoDB Raw Data */}
        <div className="bg-card border border-border p-6 rounded-md">
          <h4 className="text-lg font-semibold text-foreground mb-4">Raw MongoDB Data</h4>
          <div className="bg-muted p-4 rounded-md border overflow-x-auto">
            <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
              {JSON.stringify(product, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

// Category Edit Form Component
interface CategoryEditFormProps {
  category: Category;
  onSave: (category: Category) => void;
  onCancel: () => void;
}

const CategoryEditForm: React.FC<CategoryEditFormProps> = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Category>(category);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (field: keyof Category, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Temporarily disabled auto-generate slug from name
    /*
    if (field === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
    */
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    if (!formData.description.trim()) newErrors.description = 'Category description is required';
    if (formData.sortOrder < 0) newErrors.sortOrder = 'Sort order cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-foreground">Basic Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full bg-input border ${errors.name ? 'border-red-500' : 'border-border'} rounded-sm px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`}
                placeholder="Enter category name"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Temporarily disabled slug field */}
            {false && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  className="w-full bg-input border border-border rounded-sm px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="Auto-generated from name"
                />
                <p className="text-xs text-muted-foreground mt-1">URL-friendly version of the name</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className={`w-full bg-input border ${errors.description ? 'border-red-500' : 'border-border'} rounded-sm px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none`}
                placeholder="Enter category description"
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-foreground">Settings</h4>
            
            {/* Temporarily disabled image URL field */}
            {false && (
              <>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Category Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => handleChange('image', e.target.value)}
                    className="w-full bg-input border border-border rounded-sm px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="Enter image URL"
                  />
                </div>

                {formData.image && (
                  <div className="relative">
                    <div className="w-full h-32 bg-muted rounded-sm overflow-hidden">
                      <img
                        src={formData.image.startsWith('http') ? formData.image : `http://localhost:5000/api${formData.image}`}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => handleChange('sortOrder', parseInt(e.target.value) || 0)}
                className={`w-full bg-input border ${errors.sortOrder ? 'border-red-500' : 'border-border'} rounded-sm px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent`}
                placeholder="0"
                min="0"
              />
              {errors.sortOrder && <p className="text-red-400 text-xs mt-1">{errors.sortOrder}</p>}
              <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-ring focus:ring-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-foreground">
                Active Category
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                Saving...
              </>
            ) : (
              formData._id ? 'Update Category' : 'Create Category'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Category Details View Component
interface CategoryDetailsViewProps {
  category: Category;
}

const CategoryDetailsView: React.FC<CategoryDetailsViewProps> = ({ category }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temporarily disabled Category Image */}
          {false && (
            <div>
              <h4 className="text-lg font-medium text-foreground mb-4">Category Image</h4>
              <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden">
                {category.image ? (
                  <img
                    src={category.image.startsWith('http') ? category.image : `http://localhost:5000/api${category.image}`}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-foreground mb-4">Basic Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Category Name</label>
              <p className="text-foreground text-xl font-semibold">{category.name}</p>
            </div>

            {/* Temporarily disabled slug field */}
            {false && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Slug</label>
                <p className="text-foreground font-mono text-sm bg-muted px-2 py-1 rounded">{category.slug}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium ${
                category.isActive 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Sort Order</label>
              <p className="text-foreground text-lg font-medium">#{category.sortOrder}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-lg font-medium text-foreground mb-4">Description</h4>
          <div className="bg-muted p-4 rounded-md border">
            <p className="text-foreground leading-relaxed">{category.description}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-4 rounded-md text-center">
            <Package className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{category.productCount}</p>
            <p className="text-sm text-muted-foreground">Products</p>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-md text-center">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">#{category.sortOrder}</p>
            <p className="text-sm text-muted-foreground">Sort Order</p>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-md text-center">
            <Archive className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{category.isActive ? 'Active' : 'Inactive'}</p>
            <p className="text-sm text-muted-foreground">Status</p>
          </div>
        </div>

        {/* Metadata */}
        <div>
          <h4 className="text-lg font-medium text-foreground mb-4">Metadata</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Created At</label>
              <p className="text-foreground">{new Date(category.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Last Updated</label>
              <p className="text-foreground">{new Date(category.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* MongoDB Raw Data */}
        <div className="bg-card border border-border p-6 rounded-md">
          <h4 className="text-lg font-semibold text-foreground mb-4">Raw MongoDB Data</h4>
          <div className="bg-muted p-4 rounded-md border overflow-x-auto">
            <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
              {JSON.stringify(category, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 