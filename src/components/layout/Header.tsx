import React from 'react';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

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
      </div>
    </header>
  );
};

export default Header;
