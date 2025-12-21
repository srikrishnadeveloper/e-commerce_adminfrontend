import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Search, Check } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  inStock: boolean;
}

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  onProductsSelected: (productIds: string[]) => void;
}

const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedProductIds,
  onProductsSelected
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selectedProductIds);

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedProductIds);
      loadProducts();
    }
  }, [isOpen, selectedProductIds]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/siteconfig-api/products?admin=true&limit=50');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduct = (productId: string) => {
    setTempSelected(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSave = () => {
    onProductsSelected(tempSelected);
    onClose();
  };

  const handleCancel = () => {
    setTempSelected(selectedProductIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Select Products for Hot Deals</h2>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {tempSelected.length} products selected
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const isSelected = tempSelected.includes(product._id);
                const hasDiscount = product.originalPrice && product.originalPrice > product.price;
                
                return (
                  <div
                    key={product._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleProduct(product._id)}
                  >
                    <div className="relative">
                      {product.images[0] && (
                        <img
                          src={`/siteconfig-api/images/${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          SALE
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">₹{product.price}</span>
                      {hasDiscount && (
                        <span className="text-gray-500 line-through text-sm">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.category} • {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <div className="text-sm text-gray-600">
            {tempSelected.length} of {filteredProducts.length} products selected
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Selection
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectorModal;
