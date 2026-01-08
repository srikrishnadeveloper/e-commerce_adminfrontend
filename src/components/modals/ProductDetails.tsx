import React from 'react';
import { Button } from '../ui/button';
import { X, Star, Package, Tag, Info } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

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

interface ProductDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const resolveImg = (p?: string) => getImageUrl(p);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Images</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.images.map((img, index) => (
                <img key={index} src={resolveImg(img)} alt={product.name} className="rounded-md object-cover w-full h-32" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Details</h3>
            <div className="space-y-2 text-sm">
              <p><Tag className="inline-block w-4 h-4 mr-2" /> <strong>Category:</strong> {product.category}</p>
              <p><Info className="inline-block w-4 h-4 mr-2" /> <strong>Description:</strong> {product.description}</p>
              <p><strong>Price:</strong> {formatPrice(product.price)}</p>
              {product.originalPrice > product.price && (
                <p><strong>Original Price:</strong> <span className="line-through">{formatPrice(product.originalPrice)}</span></p>
              )}
              <p><Package className="inline-block w-4 h-4 mr-2" /> <strong>In Stock:</strong> {product.inStock ? 'Yes' : 'No'}</p>
              <p><Star className="inline-block w-4 h-4 mr-2" /> <strong>Rating:</strong> {product.rating} ({product.reviews} reviews)</p>
              <div className="flex space-x-2 mt-2">
                {product.bestseller && <span className="bg-yellow-500 text-white px-2 py-1 text-xs rounded-full">Bestseller</span>}
                {product.featured && <span className="bg-green-500 text-white px-2 py-1 text-xs rounded-full">Featured</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
