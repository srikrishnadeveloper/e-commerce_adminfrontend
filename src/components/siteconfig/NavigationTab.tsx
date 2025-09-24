import React, { useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, Trash2 } from 'lucide-react';

interface SiteConfig {
  navigation?: {
    mainMenu?: Array<{ name: string; link: string }>;
  };
}

interface NavigationTabProps {
  config: SiteConfig;
  updateConfig: (path: string, value: any) => void;
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
}

const NavigationTab: React.FC<NavigationTabProps> = ({
  config,
  updateConfig,
  addArrayItem,
  removeArrayItem
}) => {
  // Use useCallback to prevent double execution in React StrictMode
  const handleAddMenuItem = useCallback(() => {
    addArrayItem('navigation.mainMenu', { name: '', link: '' });
  }, [addArrayItem]);

  const handleRemoveMenuItem = useCallback((index: number) => {
    removeArrayItem('navigation.mainMenu', index);
  }, [removeArrayItem]);

  return (
    <div className="space-y-6">
      {/* Main Menu */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Main Navigation Menu</h3>
          <Button
            onClick={handleAddMenuItem}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Menu Item
          </Button>
        </div>
        <div className="space-y-3">
          {config.navigation?.mainMenu?.map((item, index) => (
            <div key={`menu-item-${index}`} className="flex gap-3 items-center p-3 border border-border rounded-lg">
              <div className="flex-1">
                <Input
                  value={item.name}
                  onChange={(e) => updateConfig(`navigation.mainMenu.${index}.name`, e.target.value)}
                  placeholder="Menu Name"
                  className="mb-2"
                />
                <Input
                  value={item.link}
                  onChange={(e) => updateConfig(`navigation.mainMenu.${index}.link`, e.target.value)}
                  placeholder="/link"
                />
              </div>
              <Button
                onClick={() => handleRemoveMenuItem(index)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Info message */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> These navigation items will appear in the main menu on your website.
            Footer navigation is managed separately in the Footer tab.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NavigationTab;
