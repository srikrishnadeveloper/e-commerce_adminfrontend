import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { X } from 'lucide-react';

// Add Product interface
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

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, '_id' | 'slug' | 'productCount' | 'createdAt' | 'updatedAt'> & { _id?: string }) => void;
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
  const [formData, setFormData] = useState(
    category || {
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
    }
  );

  useEffect(() => {
    setFormData(
      category || {
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
      }
    );
  }, [category]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: 'isActive') => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { _id, slug, productCount, createdAt, updatedAt, ...rest } = formData;
    if (_id) {
        onSave({ ...rest, _id });
    } else {
        onSave(rest);
    }
  };

  const resolveImg = (p?: string) => {
    if (!p) return 'http://localhost:5000/api/images/placeholder.svg';
    return p.startsWith('http') ? p : `http://localhost:5000/api${p}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{category?._id ? 'Edit Category' : 'Create Category'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground">Basic Information</h4>
                
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium text-foreground">Settings</h4>
                
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input id="sortOrder" name="sortOrder" type="number" value={formData.sortOrder} onChange={handleChange} min="0" />
                  <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="isActive" checked={formData.isActive} onCheckedChange={() => handleCheckboxChange('isActive')} />
                  <Label htmlFor="isActive" className="ml-2">Active Category</Label>
                </div>
              </div>
            </div>

            {/* Associated Products */}
            {category?._id && (
              <div className="space-y-4 pt-6 border-t border-border">
                <h4 className="text-lg font-medium text-foreground">Associated Products ({products.length})</h4>
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
                    <span className="ml-3 text-muted-foreground">Loading products...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found in this category.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
                    {products.map(product => (
                      <div 
                        key={product._id}
                        onClick={() => onProductClick(product)}
                        className="bg-muted/50 border border-border rounded-md p-3 cursor-pointer hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img 
                            src={resolveImg(product.images?.[0])}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-sm"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">{formData._id ? 'Update Category' : 'Create Category'}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;

