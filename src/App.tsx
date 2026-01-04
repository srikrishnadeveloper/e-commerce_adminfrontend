import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginPage from './pages/LoginPage';
import { Toaster } from 'react-hot-toast';
import { useFavicon } from './hooks/useFavicon';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load favicon from site config
  useFavicon();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
