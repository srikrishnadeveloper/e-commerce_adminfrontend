import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { X, Plus, Trash2, Image as ImageIcon, Code, Eye } from 'lucide-react';
import { imagesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import type { Product, Category, ImageFile, Color, Specifications } from '../../types';

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
      colors: [],
      sizes: [],
      features: [],
      specifications: {},
      tags: [],
      shipping: {
        standard: { days: "5-7 business days", price: "FREE on orders over $50" },
        express: { days: "2-3 business days", price: "$9.99" },
        overnight: { days: "1 business day", price: "$19.99" },
        international: { days: "12-25 business days depending on location", processing: "Orders are processed within 1-2 business days" }
      },
    }
  );

  const [availableImages, setAvailableImages] = useState<ImageFile[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawJsonData, setRawJsonData] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'images' | 'shipping' | 'json'>('basic');

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
        colors: [],
        sizes: [],
        features: [],
        specifications: {},
        tags: [],
      }
    );

    if (product) {
      setRawJsonData(JSON.stringify(product, null, 2));
    }
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      loadAvailableImages();
    }
  }, [isOpen]);

  const loadAvailableImages = async () => {
    try {
      const response = await imagesAPI.getAll();
      setAvailableImages(response.data || []);
    } catch (error) {
      console.error('Failed to load images:', error);
      toast.error('Failed to load available images');
      setAvailableImages([]); // Set empty array as fallback
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: 'inStock' | 'bestseller' | 'featured') => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleArrayChange = (field: 'features' | 'tags' | 'sizes', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData((prev) => ({ ...prev, [field]: items }));
  };

  const handleColorChange = (index: number, field: 'name' | 'value', value: string) => {
    const newColors = [...formData.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setFormData((prev) => ({ ...prev, colors: newColors }));
  };

  const addColor = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: '', value: '' }]
    }));
  };

  const removeColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value }
    }));
  };

  const addSpecification = () => {
    const key = prompt('Enter specification key:');
    if (key && key.trim()) {
      handleSpecificationChange(key.trim(), '');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const handleImageSelect = (imagePath: string) => {
    if (!formData.images.includes(imagePath)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imagePath]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRawJsonChange = (value: string) => {
    setRawJsonData(value);
    setJsonError('');

    try {
      const parsed = JSON.parse(value);
      // Validate that it has required fields
      if (parsed && typeof parsed === 'object') {
        // Validate required fields
        if (!parsed.name || !parsed.description || typeof parsed.price !== 'number') {
          setJsonError('Missing required fields: name, description, and price are required');
          return;
        }
        setFormData(parsed);
      } else {
        setJsonError('JSON must be an object');
      }
    } catch (error) {
      setJsonError('Invalid JSON format: ' + (error as Error).message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'json' && jsonError) {
      toast.error('Please fix JSON errors before saving');
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.description || !formData.categoryId) {
      toast.error('Please fill in all required fields (name, description, category)');
      return;
    }

    if (Number(formData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    // Clean the data before sending
    const cleanedData = {
      ...formData,
      // Remove MongoDB-generated IDs from colors array
      colors: formData.colors.map(color => ({
        name: color.name || '',
        value: color.value || ''
      })).filter(color => color.name && color.value),
      // Ensure required fields are present and properly typed
      price: Number(formData.price) || 0,
      originalPrice: Number(formData.originalPrice) || 0,
      rating: Number(formData.rating) || 0,
      reviews: Number(formData.reviews) || 0,
      // Remove any undefined or null values
      images: formData.images.filter(img => img && img.trim()),
      features: formData.features.filter(feature => feature && feature.trim()),
      tags: formData.tags.filter(tag => tag && tag.trim()),
      sizes: formData.sizes.filter(size => size && size.trim()),
      // Ensure specifications is an object
      specifications: formData.specifications || {}
    };

    // Remove virtual fields that shouldn't be sent to API
    const { discountPercentage, onSale, id, __v, createdAt, updatedAt, ...dataToSend } = cleanedData as any;

    console.log('Sending product data:', dataToSend);
    onSave(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{product ? 'Edit Product' : 'Create Product'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-4 border-b">
          {[
            { key: 'basic', label: 'Basic Info', icon: null },
            { key: 'advanced', label: 'Advanced', icon: null },
            { key: 'images', label: 'Images', icon: ImageIcon },
            { key: 'shipping', label: 'Shipping', icon: null },
            { key: 'json', label: 'Raw JSON', icon: Code }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-t-lg flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => {
                        const selectedCategory = categories.find(cat =>
                          String(cat.id) === e.target.value || cat._id === e.target.value
                        );
                        setFormData(prev => ({
                          ...prev,
                          categoryId: e.target.value,
                          category: selectedCategory?.name || ''
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories && categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category.id || category._id} value={String(category.id || category._id)}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading categories...</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price</Label>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      name="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviews">Number of Reviews</Label>
                    <Input
                      id="reviews"
                      name="reviews"
                      type="number"
                      min="0"
                      value={formData.reviews}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={formData.inStock}
                      onCheckedChange={() => handleCheckboxChange('inStock')}
                    />
                    <Label htmlFor="inStock">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bestseller"
                      checked={formData.bestseller}
                      onCheckedChange={() => handleCheckboxChange('bestseller')}
                    />
                    <Label htmlFor="bestseller">Bestseller</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={() => handleCheckboxChange('featured')}
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                {/* Colors */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Colors</Label>
                    <Button type="button" onClick={addColor} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Color
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.colors.map((color, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="Color name"
                          value={color.name}
                          onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Color value (#hex)"
                          value={color.value}
                          onChange={(e) => handleColorChange(index, 'value', e.target.value)}
                          className="flex-1"
                        />
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: color.value }}
                        />
                        <Button
                          type="button"
                          onClick={() => removeColor(index)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                  <Input
                    id="sizes"
                    placeholder="S, M, L, XL"
                    value={formData.sizes.join(', ')}
                    onChange={(e) => handleArrayChange('sizes', e.target.value)}
                  />
                </div>

                {/* Features */}
                <div>
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Textarea
                    id="features"
                    placeholder="Wireless charging, Water resistant, Fast charging"
                    value={formData.features.join(', ')}
                    onChange={(e) => handleArrayChange('features', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="electronics, accessories, wireless"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleArrayChange('tags', e.target.value)}
                  />
                </div>

                {/* Specifications */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Specifications</Label>
                    <Button type="button" onClick={addSpecification} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Specification
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Input
                          value={key}
                          readOnly
                          className="flex-1 bg-gray-100 dark:bg-gray-700"
                        />
                        <Input
                          placeholder="Value"
                          value={String(value)}
                          onChange={(e) => handleSpecificationChange(key, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => removeSpecification(key)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                {/* Selected Images */}
                <div>
                  <Label>Selected Images ({formData.images.length})</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {formData.images.map((imagePath, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={`http://localhost:5001${imagePath}`}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          onClick={() => removeImage(index)}
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {imagePath.split('/').pop()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Images */}
                <div>
                  <Label>Available Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-2 max-h-64 overflow-y-auto border rounded p-2">
                    {availableImages.map((image, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img
                          src={`http://localhost:5001${image.path}`}
                          alt={image.name}
                          className={`w-full h-16 object-cover rounded border-2 transition-all ${
                            formData.images.includes(image.path)
                              ? 'border-blue-500 opacity-50'
                              : 'border-gray-300 hover:border-blue-300'
                          }`}
                          onClick={() => handleImageSelect(image.path)}
                        />
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {image.name}
                        </div>
                        {formData.images.includes(image.path) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20 rounded">
                            <div className="bg-blue-500 text-white rounded-full p-1">
                              ✓
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Standard Shipping */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Standard Shipping</h3>
                    <div className="space-y-2">
                      <Label>Delivery Time</Label>
                      <Input
                        value={formData.shipping?.standard?.days || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping!,
                            standard: { ...prev.shipping!.standard, days: e.target.value }
                          }
                        }))}
                        placeholder="e.g., 5-7 business days"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input
                        value={formData.shipping?.standard?.price || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping!,
                            standard: { ...prev.shipping!.standard, price: e.target.value }
                          }
                        }))}
                        placeholder="e.g., FREE on orders over $50"
                      />
                    </div>
                  </div>

                  {/* Express Shipping */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Express Shipping</h3>
                    <div className="space-y-2">
                      <Label>Delivery Time</Label>
                      <Input
                        value={formData.shipping?.express?.days || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping!,
                            express: { ...prev.shipping!.express, days: e.target.value }
                          }
                        }))}
                        placeholder="e.g., 2-3 business days"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input
                        value={formData.shipping?.express?.price || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping!,
                            express: { ...prev.shipping!.express, price: e.target.value }
                          }
                        }))}
                        placeholder="e.g., $9.99"
                      />
                    </div>
                  </div>

                  {/* Overnight Shipping */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Overnight Shipping</h3>
                    <div className="space-y-2">
                      <Label>Delivery Time</Label>
                      <Input
                        value={formData.shipping?.overnight?.days || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping!,
                            overnight: { ...prev.shipping!.overnight, days: e.target.value }
                          }
                        }))}
                        placeholder="e.g., 1 business day"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input
                        value={formData.shipping?.overnight?.price || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping!,
                            overnight: { ...prev.shipping!.overnight, price: e.target.value }
                          }
                        }))}
                        placeholder="e.g., $19.99"
                      />
                    </div>
                  </div>

                  {/* International Shipping */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">International Shipping</h3>
                    <div className="space-y-2">
                      <Label>Delivery Time</Label>
                      <Input
                        value={formData.shipping?.international?.days || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping!,
                            international: { ...prev.shipping!.international, days: e.target.value }
                          }
                        }))}
                        placeholder="e.g., 12-25 business days depending on location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Processing Time</Label>
                      <Input
                        value={formData.shipping?.international?.processing || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          shipping: {
                            ...prev.shipping!,
                            international: { ...prev.shipping!.international, processing: e.target.value }
                          }
                        }))}
                        placeholder="e.g., Orders are processed within 1-2 business days"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Raw JSON Tab */}
            {activeTab === 'json' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Raw JSON Data</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={() => setRawJsonData(JSON.stringify(formData, null, 2))}
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Sync from Form
                    </Button>
                  </div>
                </div>

                {jsonError && (
                  <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    {jsonError}
                  </div>
                )}

                <textarea
                  value={rawJsonData}
                  onChange={(e) => handleRawJsonChange(e.target.value)}
                  className="w-full h-96 font-mono text-sm p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter valid JSON..."
                />

                <div className="text-sm text-gray-500">
                  Edit the JSON directly to modify all product properties. Changes will be reflected in the form.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={activeTab === 'json' && !!jsonError}>
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
