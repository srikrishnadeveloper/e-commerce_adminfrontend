import React from 'react';
import { Button } from '../ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
