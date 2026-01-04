import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { X, Plus, Trash2, Image as ImageIcon, Code, Eye, Upload, CloudUpload } from 'lucide-react';
import { imagesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import type { Product, Category, ImageFile } from '../../types';

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
      hotDeal: false,
      rating: 0,
      reviews: 0,
      images: [],
      colors: [],
      sizes: [],
      sizeVariants: [],
      features: [],
      specifications: {},
      tags: [],
      stockQuantity: 0,
      trackInventory: true,
    }
  );

  const [availableImages, setAvailableImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draggedImage, setDraggedImage] = useState<{ colorIndex: number; imageIndex: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rawJsonData, setRawJsonData] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'images' | 'json'>('basic');
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [newSpecKey, setNewSpecKey] = useState('');

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
        hotDeal: false,
        rating: 0,
        reviews: 0,
        images: [],
        colors: [],
        sizes: [],
        sizeVariants: [],
        features: [],
        specifications: {},
        tags: [],
        stockQuantity: 0,
        trackInventory: true,
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

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
    });

    if (validFiles.length === 0) {
      toast.error('Please select valid image files (PNG, JPG, JPEG, GIF, WebP, SVG)');
      return;
    }

    if (validFiles.length > 10) {
      toast.error('Maximum 10 files can be uploaded at once');
      return;
    }

    const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are too large. Maximum file size is 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await imagesAPI.upload(formData);
      toast.success(`Successfully uploaded ${response.count} image(s)`);

      // Reload images list
      await loadAvailableImages();

      // Auto-select the uploaded images
      if (response.data && response.data.length > 0) {
        const newImagePaths = response.data.map((img: any) => img.path);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImagePaths]
        }));
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error?.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  if (!isOpen) return null;

  // Helper function to display number values - show empty string for 0 to allow easier typing
  const displayNumber = (value: number | undefined, allowZero: boolean = false): string => {
    if (value === undefined || value === null) return '';
    if (value === 0 && !allowZero) return '';
    return String(value);
  };

  // Better number change handler that handles empty input and leading zeros
  const handleNumberChange = (name: string, value: string, min?: number, max?: number) => {
    // Allow empty input (will be treated as 0 on save)
    if (value === '' || value === '-') {
      setFormData((prev) => ({ ...prev, [name]: 0 }));
      return;
    }
    
    // Parse the number
    let numValue = parseFloat(value);
    
    // If not a valid number, don't update
    if (isNaN(numValue)) return;
    
    // Apply min/max constraints
    if (min !== undefined && numValue < min) numValue = min;
    if (max !== undefined && numValue > max) numValue = max;
    
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      handleNumberChange(name, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (name: 'inStock' | 'bestseller' | 'hotDeal') => {
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

  const handleColorImagesChange = (colorIndex: number, images: string[]) => {
    const newColors = [...formData.colors];
    (newColors[colorIndex] as any).images = images;
    setFormData((prev) => ({ ...prev, colors: newColors }));
  };

  const addImageToColor = (colorIndex: number, imagePath: string) => {
    const newColors = [...formData.colors];
    const currentImages = (newColors[colorIndex] as any).images || [];
    if (!currentImages.includes(imagePath)) {
      (newColors[colorIndex] as any).images = [...currentImages, imagePath];
      setFormData((prev) => ({ ...prev, colors: newColors }));
    }
  };

  const removeImageFromColor = (colorIndex: number, imageIndex: number) => {
    const newColors = [...formData.colors];
    const currentImages = (newColors[colorIndex] as any).images || [];
    (newColors[colorIndex] as any).images = currentImages.filter((_: any, i: number) => i !== imageIndex);
    setFormData((prev) => ({ ...prev, colors: newColors }));
  };

  const handleDragStartColorImage = (colorIndex: number, imageIndex: number) => {
    setDraggedImage({ colorIndex, imageIndex });
  };

  const handleDragOverColorImage = (e: React.DragEvent, colorIndex: number, targetIndex: number) => {
    e.preventDefault();
    if (!draggedImage || draggedImage.colorIndex !== colorIndex) return;
    
    if (draggedImage.imageIndex !== targetIndex) {
      const newColors = [...formData.colors];
      const images = [...((newColors[colorIndex] as any).images || [])];
      const [removed] = images.splice(draggedImage.imageIndex, 1);
      images.splice(targetIndex, 0, removed);
      (newColors[colorIndex] as any).images = images;
      setFormData((prev) => ({ ...prev, colors: newColors }));
      setDraggedImage({ colorIndex, imageIndex: targetIndex });
    }
  };

  const handleDragEndColorImage = () => {
    setDraggedImage(null);
  };

  const addColor = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: '', value: '', images: [] }]
    }));
  };

  const removeColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  // Size Variant Handlers
  const handleSizeVariantChange = (index: number, field: string, value: any) => {
    const newSizeVariants = [...(formData.sizeVariants || [])];
    newSizeVariants[index] = { ...newSizeVariants[index], [field]: value };
    setFormData((prev) => ({ ...prev, sizeVariants: newSizeVariants }));
  };

  const addSizeVariant = () => {
    setFormData((prev) => ({
      ...prev,
      sizeVariants: [...(prev.sizeVariants || []), { 
        size: '', 
        price: prev.price || 0, 
        originalPrice: prev.originalPrice || 0, 
        inStock: true, 
        stockQuantity: 0 
      }]
    }));
  };

  const removeSizeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizeVariants: (prev.sizeVariants || []).filter((_, i) => i !== index)
    }));
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value }
    }));
  };

  const addSpecification = () => {
    setShowSpecModal(true);
    setNewSpecKey('');
  };

  const handleAddSpecificationSubmit = () => {
    if (newSpecKey && newSpecKey.trim()) {
      handleSpecificationChange(newSpecKey.trim(), '');
      setShowSpecModal(false);
      setNewSpecKey('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const handleImageSelect = (imagePath: string) => {
    if (!(formData.images || []).includes(imagePath)) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), imagePath]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
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
        // Ensure all array fields are properly initialized
        const normalizedData = {
          ...parsed,
          images: Array.isArray(parsed.images) ? parsed.images : [],
          colors: Array.isArray(parsed.colors) ? parsed.colors : [],
          sizes: Array.isArray(parsed.sizes) ? parsed.sizes : [],
          features: Array.isArray(parsed.features) ? parsed.features : [],
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          specifications: parsed.specifications || {},
        };
        setFormData(normalizedData);
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
      // Remove MongoDB-generated IDs from colors array, include images array
      colors: (formData.colors || []).map(color => ({
        name: color.name || '',
        value: color.value || '',
        images: ((color as any).images || []).filter((img: string) => img && img.trim())
      })).filter(color => color.name && color.value),
      // Clean size variants with proper number types
      sizeVariants: (formData.sizeVariants || []).map(variant => ({
        size: variant.size || '',
        price: Number(variant.price) || 0,
        originalPrice: Number(variant.originalPrice) || 0,
        inStock: variant.inStock !== false,
        stockQuantity: Number(variant.stockQuantity) || 0
      })).filter(variant => variant.size),
      // Ensure required fields are present and properly typed
      price: Number(formData.price) || 0,
      originalPrice: Number(formData.originalPrice) || 0,
      rating: Number(formData.rating) || 0,
      reviews: Number(formData.reviews) || 0,
      // Remove any undefined or null values
      images: (formData.images || []).filter(img => img && img.trim()),
      features: (formData.features || []).filter(feature => feature && feature.trim()),
      tags: (formData.tags || []).filter(tag => tag && tag.trim()),
      sizes: (formData.sizes || []).filter(size => size && size.trim()),
      // Ensure specifications is an object
      specifications: formData.specifications || {},
    };

    // Remove virtual fields that shouldn't be sent to API
    const { discountPercentage, onSale, id, __v, createdAt, updatedAt, ...dataToSend } = cleanedData as any;

    console.log('Sending product data:', dataToSend);
    onSave(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      <div className="bg-white dark:bg-gray-800 flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-8 py-5 border-b bg-gray-50 dark:bg-gray-900">
          <h2 className="text-2xl font-bold">{product ? 'Edit Product' : 'Create Product'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 px-8 pt-4 border-b overflow-x-auto bg-white dark:bg-gray-800">
          {[
            { key: 'basic', label: 'Basic Info', icon: null },
            { key: 'advanced', label: 'Advanced', icon: null },
            { key: 'images', label: 'Images', icon: ImageIcon },
            { key: 'json', label: 'Raw JSON', icon: Code }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 rounded-t-lg flex items-center space-x-2 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
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
                      min="0"
                      value={displayNumber(formData.price)}
                      onChange={(e) => handleNumberChange('price', e.target.value, 0)}
                      placeholder="Enter price"
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
                      min="0"
                      value={displayNumber(formData.originalPrice)}
                      onChange={(e) => handleNumberChange('originalPrice', e.target.value, 0)}
                      placeholder="Enter original price"
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
                      value={displayNumber(formData.rating, true)}
                      onChange={(e) => handleNumberChange('rating', e.target.value, 0, 5)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviews">Number of Reviews</Label>
                    <Input
                      id="reviews"
                      name="reviews"
                      type="number"
                      min="0"
                      value={displayNumber(formData.reviews, true)}
                      onChange={(e) => handleNumberChange('reviews', e.target.value, 0)}
                      placeholder="0"
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
                      id="hotDeal"
                      checked={formData.hotDeal}
                      onCheckedChange={() => handleCheckboxChange('hotDeal')}
                    />
                    <Label htmlFor="hotDeal">Hot Deals</Label>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-8">
                {/* Color Variants with Images */}
                <div className="border rounded-xl p-5 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Color Variants</h3>
                      <p className="text-sm text-gray-500 mt-1">Click images to select/deselect • Drag selected images to reorder</p>
                    </div>
                    <Button type="button" onClick={addColor} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Color
                    </Button>
                  </div>
                  
                  {(formData.colors || []).length > 0 ? (
                    <div className="space-y-6">
                      {(formData.colors || []).map((color, colorIndex) => (
                        <div key={colorIndex} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                          {/* Color Header */}
                          <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b">
                            <div
                              className="w-14 h-14 rounded-xl border-2 border-white shadow-lg flex-shrink-0"
                              style={{ backgroundColor: color.value || '#cccccc' }}
                            />
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Color Name</Label>
                                <Input
                                  placeholder="e.g., Navy Blue"
                                  value={color.name}
                                  onChange={(e) => handleColorChange(colorIndex, 'name', e.target.value)}
                                  className="h-10 text-base"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Hex Code</Label>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="#000000"
                                    value={color.value}
                                    onChange={(e) => handleColorChange(colorIndex, 'value', e.target.value)}
                                    className="h-10 flex-1 font-mono text-base"
                                  />
                                  <input
                                    type="color"
                                    value={color.value || '#000000'}
                                    onChange={(e) => handleColorChange(colorIndex, 'value', e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                                    title="Pick color"
                                  />
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => removeColor(colorIndex)}
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          
                          
                          {/* Images for this color - Combined view */}
                          <div className="p-5">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
                              Images for <span className="text-blue-600">{color.name || 'this color'}</span>
                              <span className="text-gray-400 font-normal ml-2">
                                ({((color as any).images || []).length} selected)
                              </span>
                              {((color as any).images || []).length > 1 && (
                                <span className="text-blue-500 font-normal ml-2">• Drag selected images to reorder</span>
                              )}
                            </Label>
                            
                            {(formData.images || []).length > 0 ? (
                              <div className="grid grid-cols-8 gap-2">
                                {/* First show selected images in order - draggable */}
                                {((color as any).images || []).map((imgPath: string, imgIdx: number) => (
                                  <div
                                    key={`selected-${imgPath}`}
                                    draggable
                                    onDragStart={() => handleDragStartColorImage(colorIndex, imgIdx)}
                                    onDragOver={(e) => handleDragOverColorImage(e, colorIndex, imgIdx)}
                                    onDragEnd={handleDragEndColorImage}
                                    onClick={() => removeImageFromColor(colorIndex, imgIdx)}
                                    className={`relative cursor-grab active:cursor-grabbing rounded-lg overflow-hidden transition-all duration-150 ${
                                      imgIdx === 0 
                                        ? 'ring-2 ring-blue-500 ring-offset-2' 
                                        : 'ring-2 ring-green-500 ring-offset-1'
                                    } ${draggedImage?.colorIndex === colorIndex && draggedImage?.imageIndex === imgIdx ? 'opacity-50 scale-90' : ''}`}
                                    title="Drag to reorder • Click to remove"
                                  >
                                    <img
                                      src={`http://localhost:5001${imgPath}`}
                                      alt={`${color.name} image ${imgIdx + 1}`}
                                      className="w-full aspect-square object-cover"
                                    />
                                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                                      {imgIdx + 1}
                                    </div>
                                    {imgIdx === 0 && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs py-0.5 text-center font-medium">
                                        Main
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Then show unselected images */}
                                {(formData.images || []).filter(img => !((color as any).images || []).includes(img)).map((img, imgIdx) => (
                                  <div
                                    key={`unselected-${imgIdx}`}
                                    onClick={() => addImageToColor(colorIndex, img)}
                                    className="relative cursor-pointer rounded-lg overflow-hidden transition-all duration-150 border-2 border-gray-200 hover:border-blue-400 hover:shadow-md hover:scale-105"
                                    title="Click to select"
                                  >
                                    <img
                                      src={`http://localhost:5001${img}`}
                                      alt={`Available image ${imgIdx + 1}`}
                                      className="w-full aspect-square object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300">
                                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 font-medium">No product images available</p>
                                <p className="text-xs text-gray-400">Go to Images tab to upload images first</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-semibold text-lg">No color variants yet</p>
                      <p className="text-sm text-gray-400 mb-5">Add colors to let customers choose product variations</p>
                      <Button type="button" onClick={addColor} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Color
                      </Button>
                    </div>
                  )}
                </div>

                {/* Size Variants with Prices */}
                <div className="border rounded-xl p-5 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Size Variants</h3>
                      <p className="text-sm text-gray-500 mt-1">Set different prices for each size. Leave empty to use default price.</p>
                    </div>
                    <Button type="button" onClick={addSizeVariant} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Size
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(formData.sizeVariants || []).map((variant, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="flex-1 grid grid-cols-5 gap-4">
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Size</Label>
                            <Input
                              placeholder="S, M, L..."
                              value={variant.size}
                              onChange={(e) => handleSizeVariantChange(index, 'size', e.target.value)}
                              className="h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Price (₹)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Enter price"
                              value={variant.price || ''}
                              onChange={(e) => handleSizeVariantChange(index, 'price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Original Price</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Enter price"
                              value={variant.originalPrice || ''}
                              onChange={(e) => handleSizeVariantChange(index, 'originalPrice', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                              className="h-10"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Stock Qty</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Enter qty"
                              value={variant.stockQuantity || ''}
                              onChange={(e) => handleSizeVariantChange(index, 'stockQuantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
                              className="h-10"
                            />
                          </div>
                          <div className="flex items-end pb-1">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`sizeInStock-${index}`}
                                checked={variant.inStock !== false}
                                onCheckedChange={(checked) => handleSizeVariantChange(index, 'inStock', checked)}
                              />
                              <Label htmlFor={`sizeInStock-${index}`} className="text-xs">In Stock</Label>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeSizeVariant(index)}
                          size="sm"
                          variant="destructive"
                          className="mt-5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {(formData.sizeVariants || []).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No size variants. Product will use the default price for all sizes.</p>
                    )}
                  </div>
                </div>

                {/* Simple Sizes (fallback) */}
                <div>
                  <Label htmlFor="sizes">Simple Sizes (comma-separated, used if no Size Variants)</Label>
                  <Input
                    id="sizes"
                    placeholder="S, M, L, XL"
                    value={(formData.sizes || []).join(', ')}
                    onChange={(e) => handleArrayChange('sizes', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Use this for simple size options without price variations</p>
                </div>

                {/* Features */}
                <div>
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Textarea
                    id="features"
                    placeholder="Wireless charging, Water resistant, Fast charging"
                    value={(formData.features || []).join(', ')}
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
                    value={(formData.tags || []).join(', ')}
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
                    {Object.entries(formData.specifications || {}).map(([key, value]) => (
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
              <div className="space-y-6">
                {/* Selected Images */}
                {(formData.images || []).length > 0 && (
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Selected Images ({(formData.images || []).length})
                    </Label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                      {(formData.images || []).map((imagePath, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-blue-500 bg-gray-100">
                            <img
                              src={`http://localhost:5001${imagePath}`}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <CloudUpload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Drag & drop images here
                  </p>
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Select Images'}
                  </Button>
                  <p className="text-xs text-gray-400 mt-3">
                    PNG, JPG, JPEG, GIF, WebP, SVG • Max 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Available Images */}
                {availableImages.length > 0 && (
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      Available Images ({availableImages.length}) — Click to add
                    </Label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                      {availableImages.map((image, index) => {
                        const isSelected = (formData.images || []).includes(image.path);
                        return (
                          <div
                            key={index}
                            onClick={() => handleImageSelect(image.path)}
                            className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                              isSelected
                                ? 'ring-2 ring-blue-500 opacity-50'
                                : 'hover:ring-2 hover:ring-blue-300'
                            }`}
                          >
                            <div className="aspect-square bg-gray-200">
                              <img
                                src={`http://localhost:5001${image.path}`}
                                alt={image.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center bg-blue-500/30">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
          <div className="flex justify-end space-x-3 px-8 py-5 border-t bg-gray-50 dark:bg-gray-900">
            <Button type="button" variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button type="submit" disabled={activeTab === 'json' && !!jsonError} className="px-6 bg-blue-600 hover:bg-blue-700">
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>

      {/* Add Specification Modal */}
      {showSpecModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Specification</h3>
            <Label htmlFor="specKey" className="mb-2 block">Specification Key</Label>
            <Input
              id="specKey"
              placeholder="e.g., Material, Weight, Dimensions"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSpecificationSubmit();
                }
              }}
              autoFocus
              className="mb-4"
            />
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSpecModal(false);
                  setNewSpecKey('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddSpecificationSubmit}
                disabled={!newSpecKey.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModal;
