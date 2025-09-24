import React, { useState, useEffect } from 'react';
import type { Category } from '../types/index';
import CategoryFormModal from '../components/modals/CategoryFormModal';
import { categoriesAPI, ensureApiBase } from '../services/api';

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      await ensureApiBase();
      const response = await categoriesAPI.getAll({ includeProductCount: true });

      if (response.success) {
        setCategories(response.data || []);
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

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categories..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disabled')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
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

      {/* Categories Table */}
      <div className="bg-card border border-border rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedCategories.length === filteredCategories.length && filteredCategories.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border text-primary focus:ring-ring bg-background"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Display Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {filteredCategories.map((category) => (
              <tr key={category._id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category._id)}
                    onChange={() => handleSelectCategory(category._id)}
                    className="rounded border-border text-primary focus:ring-ring bg-background"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-foreground">{category.name}</div>
                    <div className="text-sm text-muted-foreground">{category.slug}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{category.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.status === 'active'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {category.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {category.productCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {category.displayOrder}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(category.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-primary hover:text-primary/80"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(category._id)}
                      className={`${
                        category.status === 'active'
                          ? 'text-red-400 hover:text-red-300'
                          : 'text-green-400 hover:text-green-300'
                      }`}
                    >
                      {category.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
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
      />
    </div>
  );
};

export default CategoryManagement;
