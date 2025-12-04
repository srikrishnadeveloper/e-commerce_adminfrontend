import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { X } from 'lucide-react';
import ImageSelectorModal from './ImageSelectorModal';

import type { Product, Category } from '../../types';




interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, '_id' | 'slug' | 'productCount' | 'createdAt' | 'updatedAt'> & { _id?: string; id?: number }) => void | Promise<void>;
  category: Category | null;
  products: Product[];
  isLoadingProducts: boolean;
  onProductClick: (product: Product) => void;
  formatPrice: (price: number) => string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  products,
  isLoadingProducts,
  onProductClick,
  formatPrice
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
    sortOrder: 0
  });

  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        isActive: category.isActive,
        sortOrder: category.sortOrder
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        isActive: true,
        sortOrder: 0
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      status: category?.status ?? 'active',
      displayOrder: category?.displayOrder ?? 0,
      fullSlug: category?.fullSlug ?? '',
      _id: category?._id
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {category ? 'Edit Category' : 'Create Category'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Enter image URL"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => setImagePickerOpen(true)}>
                    Select
                  </Button>
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image.startsWith('http') ? formData.image : `http://localhost:5001${formData.image}`}
                      alt="Category"
                      className="w-24 h-24 max-w-24 max-h-24 object-cover rounded border"
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

              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked: any) => setFormData({ ...formData, isActive: Boolean(checked) })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {category ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </div>

          {/* Products in Category */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Products in Category ({products.length})
            </h3>

            {isLoadingProducts ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {products.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No products in this category</p>
                ) : (
                  products.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => onProductClick(product)}
                      className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 max-w-12 max-h-12 object-cover rounded"
                            style={{
                              minHeight: '48px',
                              maxHeight: '48px',
                              minWidth: '48px',
                              maxWidth: '48px',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm font-semibold text-green-400">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {product.inStock ? (
                              <span className="text-xs text-green-400">In Stock</span>
                            ) : (
                              <span className="text-xs text-red-400">Out of Stock</span>
                            )}
                            {product.featured && (
                              <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                            {product.bestseller && (
                              <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded">
                                Bestseller
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
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

    </div>
  );
};

export default CategoryModal;

