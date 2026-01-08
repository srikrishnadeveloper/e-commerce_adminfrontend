import React from 'react';
import type { Product } from '../../types';
import { Button } from '../ui/button';
import { Eye, Edit, Trash2, Star } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

interface ProductGridProps {
  products: Product[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  formatPrice: (price: number) => string;
}

const resolveImg = (p?: string) => getImageUrl(p);

const ProductGrid: React.FC<ProductGridProps> = ({ products, onView, onEdit, onDelete, formatPrice }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div 
          key={product._id} 
          className="relative bg-card border border-border rounded-md overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col"
          style={{ 
            height: 'clamp(450px, 40vw, 520px)'
          }}
        >
          {/* Product Image */}
          <div className="relative w-full bg-muted overflow-hidden" style={{ 
            height: 'clamp(280px, 25vw, 320px)'
          }}>
            <img
              src={resolveImg(product.images?.[0])}
              alt={product.name}
              className="w-full h-full object-cover"
              style={{ 
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
              }}
            />
            
            {/* Discount Badge */}
            {product.originalPrice > product.price && (
              <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </div>
            )}
            
            {/* Status Badges */}
            <div className="absolute top-3 left-3 flex flex-col space-y-2">
              {product.bestseller && (
                <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 backdrop-blur-sm">
                  Best Seller
                </span>
              )}
              {product.featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 backdrop-blur-sm">
                  Featured
                </span>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="absolute top-3 right-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium backdrop-blur-sm ${
                product.inStock 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col justify-between p-4 text-center" style={{ paddingTop: '10px' }}>
            {/* Category */}
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
              {product.category}
            </div>

            {/* Product Name */}
            <h3 
              className="text-foreground leading-tight flex items-center justify-center mb-3" 
              style={{ 
                fontSize: '16px', 
                fontWeight: 'normal',
                height: 'clamp(40px, 8vw, 50px)',
                minHeight: 'clamp(40px, 8vw, 50px)',
                maxHeight: 'clamp(40px, 8vw, 50px)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {product.name}
            </h3>

            {/* Price */}
            <div className="mb-3">
              <span className="text-foreground" style={{ fontSize: '16px', fontWeight: '600' }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-muted-foreground line-through ml-2" style={{ fontSize: '16px', fontWeight: '600' }}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium text-foreground">{product.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                onClick={() => onView(product)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                onClick={() => onEdit(product)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                onClick={() => onDelete(product)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
