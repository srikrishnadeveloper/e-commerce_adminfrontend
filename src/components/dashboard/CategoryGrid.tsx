import React from 'react';
import type { Category } from '../../types';
import { Button } from '../ui/button';
import { Eye, Edit, Trash2, FolderOpen, Package, TrendingUp } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const resolveImg = (p?: string) => {
  if (!p) return 'http://localhost:5001/images/placeholder.svg';
  return p.startsWith('http') ? p : `http://localhost:5001${p}`;
};

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onView, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <div 
          key={category._id} 
          className="relative bg-card border border-border rounded-md overflow-hidden hover:scale-[1.02] hover:shadow-lg transition-all duration-300 flex flex-col p-6"
        >
          {/* Category Image */}
          <div className="relative w-full h-32 bg-muted rounded-sm mb-4 overflow-hidden">
            {category.image ? (
              <img
                src={resolveImg(category.image)}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium ${
                category.isActive 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Category Content */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-semibold text-foreground mb-2">{category.name}</h3>
            
            {category.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {category.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                {category.productCount} products
              </span>
              <span className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                #{category.sortOrder}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                onClick={() => onView(category)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                onClick={() => onEdit(category)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                onClick={() => onDelete(category)}
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

export default CategoryGrid;
