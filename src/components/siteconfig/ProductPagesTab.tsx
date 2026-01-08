import React from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface ProductPagesTabProps {
  config: any;
  updateConfig: (path: string, value: any) => void;
}

const ProductPagesTab: React.FC<ProductPagesTabProps> = ({ config, updateConfig }) => {
  const productPages = config.productPages || {};
  const listing = productPages.listing || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Product Listing Page</h3>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Page Title
            </label>
            <Input
              type="text"
              value={listing.title || ''}
              onChange={(e) => updateConfig('productPages.listing.title', e.target.value)}
              placeholder="Latest Electronics"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Main heading displayed on the product listing page
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Page Description
            </label>
            <Textarea
              value={listing.description || ''}
              onChange={(e) => updateConfig('productPages.listing.description', e.target.value)}
              placeholder="Discover cutting-edge technology and premium electronics at unbeatable prices"
              className="w-full"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Subtitle or description text shown below the page title
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium mb-3">Preview</h4>
        <div className="bg-white p-6 rounded-md">
          <h1 className="text-3xl font-bold mb-2">
            {listing.title || 'Latest Electronics'}
          </h1>
          <p className="text-gray-600">
            {listing.description || 'Discover cutting-edge technology and premium electronics at unbeatable prices'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPagesTab;
