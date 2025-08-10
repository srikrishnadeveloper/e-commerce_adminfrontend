import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { X } from 'lucide-react';

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
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product: Product | null;
  categories: Category[];
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, categories }) => {
  const [formData, setFormData] = useState<Product>(
    product || {
      _id: '',
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      categoryId: '',
      inStock: true,
      bestseller: false,
      featured: false,
      rating: 0,
      reviews: 0,
      images: [],
    }
  );

  useEffect(() => {
    setFormData(
      product || {
        _id: '',
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        category: '',
        categoryId: '',
        inStock: true,
        bestseller: false,
        featured: false,
        rating: 0,
        reviews: 0,
        images: [],
      }
    );
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: 'inStock' | 'bestseller' | 'featured') => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{product ? 'Edit Product' : 'Create Product'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input id="originalPrice" name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} />
            </div>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Checkbox id="inStock" checked={formData.inStock} onCheckedChange={() => handleCheckboxChange('inStock')} />
              <Label htmlFor="inStock" className="ml-2">In Stock</Label>
            </div>
            <div className="flex items-center">
              <Checkbox id="bestseller" checked={formData.bestseller} onCheckedChange={() => handleCheckboxChange('bestseller')} />
              <Label htmlFor="bestseller" className="ml-2">Bestseller</Label>
            </div>
            <div className="flex items-center">
              <Checkbox id="featured" checked={formData.featured} onCheckedChange={() => handleCheckboxChange('featured')} />
              <Label htmlFor="featured" className="ml-2">Featured</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
