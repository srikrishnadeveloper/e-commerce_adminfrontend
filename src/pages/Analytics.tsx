import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  RefreshCw,
  AlertTriangle,
  PieChart,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react';

// Types
interface AnalyticsMetrics {
  revenue: {
    totalRevenue: number;
    revenueGrowth: number;
    averageOrderValue: number;
    orderGrowth: number;
  };
  orders: {
    totalOrders: number;
    statusDistribution: Record<string, number>;
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
  };
  products: {
    totalProducts: number;
    topSellingProducts: Array<{
      name: string;
      sales: number;
      revenue: number;
    }>;
  };
}

// Main Analytics Component
const Analytics: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics data
  const fetchMetrics = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/analytics/dashboard?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      
      // Set mock data for development
      setMetrics({
        revenue: {
          totalRevenue: 125430.50,
          revenueGrowth: 12.5,
          averageOrderValue: 89.25,
          orderGrowth: 8.3
        },
        orders: {
          totalOrders: 1405,
          statusDistribution: {
            pending: 45,
            processing: 123,
            shipped: 234,
            delivered: 987,
            cancelled: 16
          }
        },
        customers: {
          totalCustomers: 2847,
          newCustomers: 156
        },
        products: {
          totalProducts: 342,
          topSellingProducts: [
            { name: 'Wireless Headphones', sales: 234, revenue: 23400 },
            { name: 'Smart Watch', sales: 189, revenue: 37800 },
            { name: 'Laptop Stand', sales: 156, revenue: 7800 },
            { name: 'USB-C Cable', sales: 145, revenue: 2900 },
            { name: 'Phone Case', sales: 134, revenue: 4020 }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchMetrics();
    
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchMetrics();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeframe, autoRefresh]);

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    setLoading(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Get trend display
  const getTrendDisplay = (value: number) => {
    const isPositive = value >= 0;
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-400' : 'text-red-400',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50'
    };
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => fetchMetrics()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-300 mt-1">
            Real-time business intelligence and performance metrics
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Auto Refresh Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-300">Auto Refresh</span>
          </label>

          {/* Refresh Button */}
          <button 
            onClick={() => fetchMetrics()}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh analytics"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => handleTimeframeChange(e.target.value)}
            className="bg-gray-800 text-white border border-gray-600 rounded-md px-3 py-2 text-sm"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* Auto-refresh Toggle */}
          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800"
            />
            <span>Auto-refresh</span>
          </label>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchMetrics()}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export Button */}
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Total Revenue</dt>
                <dd className="text-lg font-medium text-white">{formatCurrency(metrics.revenue.totalRevenue)}</dd>
              </dl>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {(() => {
              const trend = getTrendDisplay(metrics.revenue.revenueGrowth);
              const TrendIcon = trend.icon;
              return (
                <div className={`flex items-center ${trend.color}`}>
                  <TrendIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {formatPercentage(metrics.revenue.revenueGrowth)}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-400 truncate">Total Orders</dt>
                <dd className="text-lg font-medium text-white">{metrics.orders.totalOrders.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {(() => {
              const trend = getTrendDisplay(metrics.revenue.orderGrowth);
              const TrendIcon = trend.icon;
              return (
                <div className={`flex items-center ${trend.color}`}>
                  <TrendIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {formatPercentage(metrics.revenue.orderGrowth)}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
