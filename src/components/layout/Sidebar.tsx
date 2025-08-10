import React from 'react';
import { Button } from '../ui/button';
import { 
  Package2, 
  X, 
  Home, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentSection: string;
  setCurrentSection: (section: string) => void;
  setSelectedCategoryForProducts: (id: string) => void;
  setCurrentPage: (page: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  currentSection,
  setCurrentSection,
  setSelectedCategoryForProducts,
  setCurrentPage,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    setCurrentPage(1);
    if (section === 'products') {
      setSelectedCategoryForProducts('');
    }
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <>
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-card backdrop-blur-xl border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Package2 className="h-8 w-8 text-foreground" />
            <span className="text-xl font-bold text-foreground">Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-foreground hover:bg-muted"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-1">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`${currentSection === item.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
              >
                <item.icon className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <button 
              onClick={() => handleSectionChange('settings')}
              className={`${currentSection === 'settings' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'} group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left`}
            >
              <Settings className="text-muted-foreground group-hover:text-foreground mr-3 h-5 w-5" />
              Settings
            </button>
          </div>
        </nav>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;
