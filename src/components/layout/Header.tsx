import React from 'react';
import { Button } from '../ui/button';
import { Menu, Search, Bell } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  currentSection: string;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, currentSection }) => {
  const sectionTitles: { [key: string]: string } = {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    orders: 'Orders',
    customers: 'Customers',
    analytics: 'Analytics',
    settings: 'Settings',
  };

  return (
    <header className="bg-card backdrop-blur-xl border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-foreground hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {sectionTitles[currentSection] || 'Dashboard'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-80 bg-input border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
