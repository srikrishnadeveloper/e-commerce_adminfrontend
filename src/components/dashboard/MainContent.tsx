import React from 'react';
import { ShoppingCart, Users, BarChart3, Settings } from 'lucide-react';

interface PlaceholderProps {
  icon: React.ElementType;
  title: string;
  message: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ icon: Icon, title, message }) => (
  <div className="text-center py-20">
    <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
    <h2 className="text-xl text-muted-foreground">{title}</h2>
    <p className="text-muted-foreground mt-2">{message}</p>
  </div>
);

interface MainContentProps {
  currentSection: string;
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ currentSection, children }) => {
  const placeholders: { [key: string]: PlaceholderProps } = {
    dashboard: {
      icon: BarChart3,
      title: 'Welcome to Admin Dashboard',
      message: 'Select a section from the sidebar to get started',
    },
    orders: {
      icon: ShoppingCart,
      title: 'Orders Management',
      message: 'Order management functionality coming soon',
    },
    customers: {
      icon: Users,
      title: 'Customer Management',
      message: 'Customer management functionality coming soon',
    },
    analytics: {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      message: 'Analytics and reports coming soon',
    },
    settings: {
      icon: Settings,
      title: 'Settings',
      message: 'Application settings coming soon',
    },
  };

  const placeholder = placeholders[currentSection];

  return (
    <main className="flex-1 overflow-y-auto bg-background p-6">
      {placeholder && !['products', 'categories'].includes(currentSection) ? (
        <Placeholder {...placeholder} />
      ) : (
        children
      )}
    </main>
  );
};

export default MainContent;
