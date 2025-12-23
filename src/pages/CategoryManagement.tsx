import React, { useState, useEffect } from 'react';
import type { Category, Product } from '../types/index';
import CategoryFormModal from '../components/modals/CategoryFormModal';
import CategoryDetailsModal from '../components/modals/CategoryDetailsModal';
import { categoriesAPI, ensureApiBase } from '../services/api';
import { GripVertical, Search, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // View details modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [productsForCategory, setProductsForCategory] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      await ensureApiBase();
      const response = await categoriesAPI.getAll({ includeProductCount: true });

      if (response.success) {
        const fetchedCategories = response.data || [];
        
        // Check if categories need order initialization (all have displayOrder 0 or undefined)
        const needsOrderInit = fetchedCategories.length > 0 && 
          fetchedCategories.every((cat: Category) => !cat.displayOrder && !cat.sortOrder);
        
        if (needsOrderInit) {
          // Initialize order for all categories (1 to n)
          const sortedByCreated = [...fetchedCategories].sort((a: Category, b: Category) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          const updatePromises = sortedByCreated.map((cat: Category, index: number) => 
            categoriesAPI.update(cat._id, { displayOrder: index + 1, sortOrder: index + 1 })
          );
          
          await Promise.all(updatePromises);
          
          // Re-fetch with updated orders
          const updatedResponse = await categoriesAPI.getAll({ includeProductCount: true });
          if (updatedResponse.success) {
            setCategories(updatedResponse.data || []);
          }
        } else {
          setCategories(fetchedCategories);
        }
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      setError('Error fetching categories');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewCategory = async (category: Category) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
    
    // Load products for this category
    try {
      setIsLoadingProducts(true);
      await ensureApiBase();
      const response = await categoriesAPI.getProducts(category._id, { limit: 100 });
      setProductsForCategory(response.data || []);
    } catch (err) {
      console.error('Error loading products for category:', err);
      setProductsForCategory([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      await ensureApiBase();

      let response;
      if (modalMode === 'create') {
        response = await categoriesAPI.create(categoryData);
      } else {
        response = await categoriesAPI.update(selectedCategory?._id || '', categoryData);
      }

      if (response.success) {
        await fetchCategories();
        setIsModalOpen(false);
        setError(null);
      } else {
        setError(response.message || 'Failed to save category');
      }
    } catch (err) {
      setError('Error saving category');
      console.error('Error:', err);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await ensureApiBase();
      const response = await categoriesAPI.delete(categoryId);

      if (response.success) {
        await fetchCategories();
        setError(null);
      } else {
        setError(response.message || 'Failed to delete category');
      }
    } catch (err) {
      setError('Error deleting category');
      console.error('Error:', err);
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      await ensureApiBase();
      // Find the category to toggle its status
      const category = categories.find(cat => cat._id === categoryId);
      if (!category) return;

      const newStatus = category.status === 'active' ? 'disabled' : 'active';
      const response = await categoriesAPI.update(categoryId, { status: newStatus });

      if (response.success) {
        await fetchCategories();
        setError(null);
      } else {
        setError(response.message || 'Failed to toggle category status');
      }
    } catch (err) {
      setError('Error toggling category status');
      console.error('Error:', err);
    }
  };

  const handleBulkStatusUpdate = async (status: 'active' | 'disabled') => {
    if (selectedCategories.length === 0) {
      alert('Please select categories to update');
      return;
    }

    try {
      await ensureApiBase();

      // Update each category individually since we don't have a bulk API
      const updatePromises = selectedCategories.map(categoryId =>
        categoriesAPI.update(categoryId, { status })
      );

      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter(result => !result.success);

      if (failedUpdates.length === 0) {
        await fetchCategories();
        setSelectedCategories([]);
        setError(null);
      } else {
        setError(`Failed to update ${failedUpdates.length} categories`);
      }
    } catch (err) {
      setError('Error updating categories');
      console.error('Error:', err);
    }
  };

  // Drag and drop state
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, category: Category) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(categoryId);
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = async (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault();
    setDragOverCategory(null);
    
    if (!draggedCategory || draggedCategory._id === targetCategory._id) {
      setDraggedCategory(null);
      return;
    }

    // Get current sorted list
    const sortedCategories = [...categories].sort((a, b) => 
      (a.displayOrder || a.sortOrder || 0) - (b.displayOrder || b.sortOrder || 0)
    );

    // Find indices
    const draggedIndex = sortedCategories.findIndex(c => c._id === draggedCategory._id);
    const targetIndex = sortedCategories.findIndex(c => c._id === targetCategory._id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedCategory(null);
      return;
    }

    // Remove dragged item and insert at target position
    const reordered = [...sortedCategories];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    try {
      // Update all categories with new sequential order (1 to n)
      const updatePromises = reordered.map((cat, index) => 
        categoriesAPI.update(cat._id, { displayOrder: index + 1, sortOrder: index + 1 })
      );

      await Promise.all(updatePromises);

      toast.success('Category order updated!');
      await fetchCategories();
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Failed to update order');
    }

    setDraggedCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description?.toLowerCase().includes(searchTerm.toLowerCase());
      // Check both status and isActive for compatibility
      const isActive = category.status === 'active' || category.isActive === true;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && isActive) ||
                           (statusFilter === 'disabled' && !isActive);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => (a.displayOrder || a.sortOrder || 0) - (b.displayOrder || b.sortOrder || 0));

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map(cat => cat._id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Category Management</h1>
        <button
          onClick={handleCreateCategory}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Create Category
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-destructive hover:text-destructive/80"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disabled')}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all" className="bg-background text-foreground">All Categories</option>
              <option value="active" className="bg-background text-foreground">Active</option>
              <option value="disabled" className="bg-background text-foreground">Disabled</option>
            </select>
          </div>

          <div className="flex items-end">
            {selectedCategories.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate('active')}
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  Enable Selected
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('disabled')}
                  className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Disable Selected
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drag and Drop Hint */}
      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
        <GripVertical className="h-4 w-4" />
        <span>Drag and drop categories to reorder their display order</span>
      </div>

      {/* Categories Table */}
      <div className="bg-card border border-border rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">
                {/* Drag Handle */}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border text-primary focus:ring-ring bg-background"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Products
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredCategories.map((category) => (
              <tr 
                key={category._id} 
                className={`hover:bg-muted/50 transition-all duration-200 ${
                  draggedCategory?._id === category._id ? 'opacity-50' : ''
                } ${
                  dragOverCategory?._id === category._id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, category)}
                onDragOver={(e) => handleDragOver(e, category)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, category)}
                onDragEnd={handleDragEnd}
              >
                <td className="px-3 py-4 whitespace-nowrap cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category._id)}
                    onChange={() => handleSelectCategory(category._id)}
                    className="rounded border-border text-primary focus:ring-ring bg-background"
                  />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">{category.name}</div>
                    <div className="text-sm text-muted-foreground">{category.slug}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{category.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                    category.status === 'active'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {category.status === 'active' ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {category.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-foreground">
                  {category.productCount}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium text-foreground">
                    {filteredCategories.findIndex(c => c._id === category._id) + 1}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(category.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewCategory(category)}
                      className="p-1.5 rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                      title="View Products"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-1.5 rounded-md text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors"
                      title="Edit Category"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(category._id)}
                      className={`p-1.5 rounded-md transition-colors ${
                        category.status === 'active'
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                          : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                      }`}
                      title={category.status === 'active' ? 'Disable' : 'Enable'}
                    >
                      {category.status === 'active' ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No categories found matching your criteria.
          </div>
        )}
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        category={selectedCategory}
        mode={modalMode}
        totalCategories={categories.length}
      />

      <CategoryDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingCategory(null);
          setProductsForCategory([]);
        }}
        category={viewingCategory}
        products={productsForCategory}
        isLoadingProducts={isLoadingProducts}
        onProductClick={() => {}} // No action needed for now
        formatPrice={formatPrice}
      />
    </div>
  );
};

export default CategoryManagement;
