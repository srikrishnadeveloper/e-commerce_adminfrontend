import React from 'react';
import { X } from 'lucide-react';
import type { Product, Category } from '../../types';




const resolveImg = (p?: string) => {
  if (!p) return 'http://localhost:5001/images/placeholder.svg';
  return p.startsWith('http') ? p : `http://localhost:5001${p}`;
};

const CategoryDetailsView: React.FC<{
  category: Category;
  products: Product[];
  isLoadingProducts: boolean;
  onProductClick: (product: Product) => void;
  formatPrice: (price: number) => string;
}> = ({ category, products, isLoadingProducts, onProductClick, formatPrice }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-2xl font-bold text-foreground">{category.name}</h3>
          <p className="text-muted-foreground">{category.description || 'No description provided.'}</p>
        </div>
        <div className="space-y-4 bg-muted/50 p-4 rounded-md border border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                category.isActive
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Sort Order</span>
              <p className="text-sm text-foreground">{category.sortOrder}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Product Count</span>
              <p className="text-sm text-foreground">{category.productCount}</p>
            </div>
        </div>
      </div>

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
    </div>
  );
};


const CategoryDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  products: Product[];
  isLoadingProducts: boolean;
  onProductClick: (product: Product) => void;
  formatPrice: (price: number) => string;
}> = ({ isOpen, onClose, category, products, isLoadingProducts, onProductClick, formatPrice }) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Category Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <CategoryDetailsView
            category={category}
            products={products}
            isLoadingProducts={isLoadingProducts}
            onProductClick={onProductClick}
            formatPrice={formatPrice}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsModal;
