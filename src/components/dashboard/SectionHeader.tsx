import React from 'react';
import { Button } from '../ui/button';
import { Plus, Search } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAdd: () => void;
  searchPlaceholder: string;
  addButtonText: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  searchTerm,
  onSearchChange,
  onAdd,
  searchPlaceholder,
  addButtonText,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-80 bg-input border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <Button 
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          {addButtonText}
        </Button>
      </div>
    </div>
  );
};

export default SectionHeader;
