import React, { useState, useEffect } from 'react';
import type { Category } from '../../types/index';

import ImageSelectorModal from './ImageSelectorModal';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
  category?: Category | null;
  mode: 'create' | 'edit';
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  mode
}) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    metaTitle: '',
    metaDescription: '',
    image: '',
    displayOrder: 0,
    adminNotes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        status: category.status || 'active',
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
        image: category.image || '',
        displayOrder: category.displayOrder || 0,
        adminNotes: category.adminNotes || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        status: 'active',
        metaTitle: '',
        metaDescription: '',
        image: '',
        displayOrder: 0,
        adminNotes: ''
      });
    }
    setErrors({});
  }, [category, mode, isOpen]);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, ''),
      metaTitle: prev.metaTitle || name
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (formData.metaTitle && formData.metaTitle.length > 60) {
      newErrors.metaTitle = 'Meta title cannot exceed 60 characters';
    }

    if (formData.metaDescription && formData.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description cannot exceed 160 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {mode === 'create' ? 'Create New Category' : 'Edit Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={handleNameChange}
                className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.name ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Enter category name"
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.slug ? 'border-destructive' : 'border-border'
                }`}
                placeholder="category-slug"
              />
              {errors.slug && <p className="text-destructive text-sm mt-1">{errors.slug}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors.description ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Enter category description"
            />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
            <p className="text-muted-foreground text-sm mt-1">
              {(formData.description || '').length}/500 characters
            </p>
          </div>


          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="/images/category.jpg"
              />
              <button
                type="button"
                onClick={() => setImagePickerOpen(true)}
                className="px-3 py-2 border border-border rounded-md hover:bg-muted text-foreground"
              >
                Select
              </button>
            </div>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={(formData.image || '').startsWith('http') ? (formData.image as string) : `http://localhost:5001${formData.image}`}
                  alt="Category"
                  className="w-24 h-24 max-w-24 max-h-24 object-cover rounded border border-border"
                  style={{
                    minHeight: '96px',
                    maxHeight: '96px',
                    minWidth: '96px',
                    maxWidth: '96px',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
          </div>

          {/* Status and Display Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Status
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'disabled' }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="0"
              />
            </div>
          </div>

          {/* SEO Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">SEO Information</h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.metaTitle || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.metaTitle ? 'border-destructive' : 'border-border'
                }`}
                placeholder="SEO title for this category"
              />
              {errors.metaTitle && <p className="text-destructive text-sm mt-1">{errors.metaTitle}</p>}
              <p className="text-muted-foreground text-sm mt-1">
                {(formData.metaTitle || '').length}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={2}
                className={`w-full px-3 py-2 bg-background border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.metaDescription ? 'border-destructive' : 'border-border'
                }`}
                placeholder="SEO description for this category"
              />
              {errors.metaDescription && <p className="text-destructive text-sm mt-1">{errors.metaDescription}</p>}
              <p className="text-muted-foreground text-sm mt-1">
                {(formData.metaDescription || '').length}/160 characters
              </p>
            </div>
          </div>

      {imagePickerOpen && (
        <ImageSelectorModal
          isOpen={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelect={(p) => {
            setFormData(prev => ({ ...prev, image: p }));
            setImagePickerOpen(false);
          }}
        />
      )}


          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Admin Notes
            </label>
            <textarea
              value={formData.adminNotes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Internal notes for this category"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Category' : 'Update Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
