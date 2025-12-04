import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard
} from 'lucide-react';

interface AnalyticsData {
  totals: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  period: {
    periodOrders: number;
    periodRevenue: number;
    periodAverageOrderValue: number;
  };
  statusDistribution: Record<string, number>;
  paymentDistribution: Record<string, number>;
  dailyTrends: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

const OrderAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5001/api/admin/orders/analytics/overview?period=${selectedPeriod}`);
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Calculate percentage change (mock for now)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-400';
      case 'processing': return 'bg-blue-400';
      case 'shipped': return 'bg-purple-400';
      case 'delivered': return 'bg-green-400';
      case 'cancelled': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-400';
      case 'unpaid': return 'bg-red-400';
      case 'refunded': return 'bg-orange-400';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
        <span className="text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load analytics data</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Analytics</h1>
          <p className="text-muted-foreground">Track order performance and revenue metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={fetchAnalytics} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{formatNumber(analyticsData.period.periodOrders)}</p>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">+12.5%</span>
                <span className="text-sm text-muted-foreground ml-1">vs last period</span>
              </div>
            </div>
            <ShoppingBag className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(analyticsData.period.periodRevenue)}</p>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">+8.2%</span>
                <span className="text-sm text-muted-foreground ml-1">vs last period</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Order Value</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(analyticsData.period.periodAverageOrderValue)}</p>
              <div className="flex items-center mt-2">
                <ArrowDown className="h-4 w-4 text-red-400 mr-1" />
                <span className="text-sm text-red-400">-2.1%</span>
                <span className="text-sm text-muted-foreground ml-1">vs last period</span>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-foreground">3.2%</p>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">+0.5%</span>
                <span className="text-sm text-muted-foreground ml-1">vs last period</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Order Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(analyticsData.statusDistribution).map(([status, count]) => {
              const total = Object.values(analyticsData.statusDistribution).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                    <span className="text-sm text-foreground capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusColor(status)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Status Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(analyticsData.paymentDistribution).map(([status, count]) => {
              const total = Object.values(analyticsData.paymentDistribution).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getPaymentStatusColor(status)}`}></div>
                    <span className="text-sm text-foreground capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getPaymentStatusColor(status)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Trends */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Daily Order Trends</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Orders</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.dailyTrends.slice(-10).map((day, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-3 px-4 text-sm text-foreground">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{day.orders}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{formatPrice(day.revenue)}</td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {day.orders > 0 ? formatPrice(day.revenue / day.orders) : '$0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics;
