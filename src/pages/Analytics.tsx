import React, { useState, useEffect } from 'react';
import { 
  IndianRupee,
  ShoppingCart, 
  RefreshCw,
  AlertTriangle,
  Target
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { authFetch } from '../services/api';

// Types
interface AnalyticsMetrics {
  revenue: {
    totalRevenue: number;
    revenueGrowth: number;
    averageOrderValue: number;
    orderGrowth: number;
    projectedRevenue: number;
  };
  orders: {
    totalOrders: number;
    statusDistribution: Record<string, number>;
    conversionRate: number;
    abandonedCarts: number;
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerGrowth: number;
  };
  products: {
    totalProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    topSellingProducts: Array<{
      name: string;
      sales: number;
      revenue: number;
    }>;
  };
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
  }>;
  topCustomers: Array<{
    name: string;
    email: string;
    totalSpent: number;
    orders: number;
  }>;
  paymentMethods: Record<string, number>;
  ordersByHour: Array<{
    hour: number;
    orders: number;
  }>;
}

// Color palette
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Main Analytics Component
const Analytics: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('area');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [useCustomDates, setUseCustomDates] = useState(false);

  // Helper to get time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  // Fetch analytics data from multiple endpoints
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      let startDate = new Date();
      let endDate = new Date();
      
      if (useCustomDates && customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
      } else {
        switch (timeframe) {
          case '24h': startDate.setHours(startDate.getHours() - 24); break;
          case '7d': startDate.setDate(startDate.getDate() - 7); break;
          case '30d': startDate.setDate(startDate.getDate() - 30); break;
          case '90d': startDate.setDate(startDate.getDate() - 90); break;
          case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
        }
      }

      const dateParams = `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&originalRevenue=true`;

      // Fetch from all endpoints in parallel with authentication
      const [dashboardRes, revenueRes, ordersRes, customersRes, productsRes, recentOrdersRes] = await Promise.all([
        authFetch(`http://localhost:5001/api/analytics/dashboard?timeframe=${timeframe}`).catch(() => null),
        authFetch(`http://localhost:5001/api/analytics/revenue?${dateParams}`).catch(() => null),
        authFetch(`http://localhost:5001/api/analytics/orders?${dateParams}`).catch(() => null),
        authFetch(`http://localhost:5001/api/analytics/customers?${dateParams}`).catch(() => null),
        authFetch(`http://localhost:5001/api/products/stats`).catch(() => null),
        authFetch(`http://localhost:5001/api/admin/orders?limit=5&sort=-createdAt`).catch(() => null)
      ]);

      // Parse responses
      const dashboardData = dashboardRes?.ok ? (await dashboardRes.json()).data : null;
      const revenueData = revenueRes?.ok ? (await revenueRes.json()).data : null;
      let ordersData = ordersRes?.ok ? (await ordersRes.json()).data : {};
      const customersData = customersRes?.ok ? (await customersRes.json()).data : null;
      const productsData = productsRes?.ok ? (await productsRes.json()) : null;
      const recentOrdersData = recentOrdersRes?.ok ? (await recentOrdersRes.json()) : null;

      // Check if we got any real data
      if (dashboardData || revenueData) {
        // Merge recent orders into ordersData
        if (recentOrdersData) {
          if (!ordersData) ordersData = {};
          // Handle different API response structures - could be .data, .orders, or direct array
          const ordersArray = Array.isArray(recentOrdersData) 
            ? recentOrdersData 
            : Array.isArray(recentOrdersData.data) 
              ? recentOrdersData.data 
              : Array.isArray(recentOrdersData.orders) 
                ? recentOrdersData.orders 
                : [];
          
          ordersData.recentOrders = ordersArray.slice(0, 5).map((order: any) => ({
            orderId: order.orderId || order._id,
            customerName: order.shippingAddress?.fullName || order.user?.name || 'Unknown',
            total: order.total,
            status: order.status,
            createdAt: order.createdAt
          }));
        }

        // Transform and set data
        const transformedData = await transformApiDataSync(dashboardData, revenueData, ordersData, customersData, productsData);
        setMetrics(transformedData);
        setError(null);
      } else {
        // No data available from API
        console.warn('No analytics data available from API');
        setError('Unable to fetch analytics data. Please ensure the backend server is running.');
        setMetrics(getEmptyMetrics());
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data. Please try again.');
      setMetrics(getEmptyMetrics());
    } finally {
      setLoading(false);
    }
  };

  // Empty metrics for when no data is available
  const getEmptyMetrics = (): AnalyticsMetrics => ({
    revenue: { totalRevenue: 0, revenueGrowth: 0, averageOrderValue: 0, orderGrowth: 0, projectedRevenue: 0 },
    orders: { totalOrders: 0, statusDistribution: {}, conversionRate: 0, abandonedCarts: 0 },
    customers: { totalCustomers: 0, newCustomers: 0, returningCustomers: 0, customerGrowth: 0 },
    products: { totalProducts: 0, lowStockProducts: 0, outOfStockProducts: 0, topSellingProducts: [] },
    traffic: { pageViews: 0, uniqueVisitors: 0, bounceRate: 0, avgSessionDuration: 0 },
    revenueByDay: [],
    revenueByCategory: [],
    recentOrders: [],
    topCustomers: [],
    paymentMethods: {},
    ordersByHour: []
  });

  // Synchronous transform function
  const transformApiDataSync = async (dashboardData: any, revenueData: any, ordersData: any, customersData: any, productsData: any): Promise<AnalyticsMetrics> => {
    // Transform time series data from revenue endpoint
    const revenueByDay = revenueData?.timeSeries?.map((item: any) => {
      const date = new Date(item._id.year, (item._id.month || 1) - 1, item._id.day || 1);
      return {
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: item.revenue || 0,
        orders: item.orders || 0
      };
    }).slice(-30) || [];

    // Transform payment methods data
    const paymentMethods: Record<string, number> = {};
    if (revenueData?.paymentMethods && revenueData.paymentMethods.length > 0) {
      const totalPayments = revenueData.paymentMethods.reduce((sum: number, pm: any) => sum + (pm.orders || 0), 0);
      revenueData.paymentMethods.forEach((pm: any) => {
        const methodName = pm._id === 'razorpay' ? 'Online Payment' : pm._id === 'cod' ? 'COD' : pm._id || 'Other';
        paymentMethods[methodName] = totalPayments > 0 ? Math.round((pm.orders / totalPayments) * 100) : 0;
      });
    }

    // Get top products
    const topSellingProducts = dashboardData?.products?.topSellingProducts?.map((p: any) => ({
      name: p.name || 'Unknown',
      sales: p.quantitySold || 0,
      revenue: p.revenue || 0
    })) || [];

    // Get recent orders
    const recentOrders = ordersData?.recentOrders?.map((order: any) => ({
      id: `ORD-${(order.orderId || order._id || '').toString().slice(-8).toUpperCase()}`,
      customer: order.customerName || 'Unknown',
      amount: order.total || 0,
      status: order.status || 'pending',
      date: order.createdAt ? getTimeAgo(new Date(order.createdAt)) : 'Recently'
    })) || [];

    // Get top customers from customer analytics
    const topCustomers = customersData?.topCustomers?.map((c: any) => ({
      name: c.customerInfo?.name || c.name || 'Unknown',
      email: c.customerInfo?.email || c.email || '',
      totalSpent: c.totalSpent || 0,
      orders: c.orderCount || 0
    })) || [];

    // Get orders by hour from real data (if available from API) - no fake data
    const ordersByHour = ordersData?.ordersByHour?.map((item: any) => ({
      hour: item.hour || item._id || 0,
      orders: item.orders || item.count || 0
    })) || [];

    // Get total customers - check multiple sources
    let totalCustomers = 
      customersData?.totalCustomers || 
      customersData?.total || 
      dashboardData?.customers?.totalActiveCustomers || 
      dashboardData?.customers?.totalCustomers || 
      0;
    
    // Fallback to direct API call if still no data
    if (!totalCustomers) {
      try {
        const customersRes = await authFetch('http://localhost:5001/api/admin/customers');
        if (customersRes.ok) {
          const data = await customersRes.json();
          totalCustomers = data.totalCount || data.total || (Array.isArray(data.data) ? data.data.length : 0) || (Array.isArray(data) ? data.length : 0) || 0;
        }
      } catch (e) { /* ignore */ }
    }

    // Get product stats
    let totalProducts = 0, lowStockProducts = 0, outOfStockProducts = 0;
    if (productsData) {
      totalProducts = productsData.totalProducts || productsData.data?.total || 0;
      lowStockProducts = productsData.lowStockCount || 0;
      outOfStockProducts = productsData.outOfStockCount || 0;
    }

    return {
      revenue: {
        totalRevenue: dashboardData?.revenue?.totalRevenue || 0,
        revenueGrowth: Math.round((dashboardData?.revenue?.revenueGrowth || 0) * 10) / 10,
        averageOrderValue: dashboardData?.revenue?.averageOrderValue || 0,
        orderGrowth: Math.round((dashboardData?.revenue?.orderGrowth || 0) * 10) / 10,
        projectedRevenue: (dashboardData?.revenue?.totalRevenue || 0) * 1.1
      },
      orders: {
        totalOrders: dashboardData?.orders?.totalOrders || dashboardData?.revenue?.totalOrders || 0,
        statusDistribution: dashboardData?.orders?.statusDistribution || {},
        conversionRate: Math.round((dashboardData?.conversion?.conversionRate || 0) * 10) / 10,
        abandonedCarts: 0
      },
      customers: {
        totalCustomers,
        newCustomers: dashboardData?.customers?.newCustomers || 0,
        returningCustomers: dashboardData?.customers?.returningCustomers || 0,
        customerGrowth: 0
      },
      products: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        topSellingProducts
      },
      traffic: {
        pageViews: 0,
        uniqueVisitors: dashboardData?.conversion?.totalUsers || totalCustomers,
        bounceRate: 0,
        avgSessionDuration: 0
      },
      revenueByDay,
      revenueByCategory: [],
      recentOrders,
      topCustomers,
      paymentMethods: Object.keys(paymentMethods).length > 0 ? paymentMethods : {},
      ordersByHour
    };
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeframe, useCustomDates, customStartDate, customEndDate]);

  // Format currency
  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null) return '₹0';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatNumber = (num: number | undefined | null) => {
    if (num == null) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl">
          <p className="font-medium text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-400">{entry.name}:</span>
              <span className="text-white font-medium">
                {entry.dataKey === 'revenue' ? formatCurrency(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  // Safe defaults for all nested properties
  const revenue = metrics.revenue || { totalRevenue: 0, revenueGrowth: 0, averageOrderValue: 0, orderGrowth: 0, projectedRevenue: 0 };
  const orders = metrics.orders || { totalOrders: 0, statusDistribution: {}, conversionRate: 0, abandonedCarts: 0 };
  const products = metrics.products || { totalProducts: 0, lowStockProducts: 0, outOfStockProducts: 0, topSellingProducts: [] };
  const revenueByDay = metrics.revenueByDay || [];

  const statusDistribution = orders.statusDistribution || {};
  const totalOrders = Object.values(statusDistribution).reduce((a, b) => a + b, 0);
  const orderStatusData = Object.entries(statusDistribution).map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    percentage: totalOrders > 0 ? ((value / totalOrders) * 100).toFixed(1) : '0',
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Real-time business intelligence • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Buttons */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            {['24h', '7d', '30d', '90d', '1y'].map((tf) => (
              <button
                key={tf}
                onClick={() => { setTimeframe(tf); setUseCustomDates(false); setLoading(true); }}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  timeframe === tf && !useCustomDates ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-700">
            <span className="text-gray-400 text-sm font-medium">Date Range:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => { setCustomStartDate(e.target.value); setUseCustomDates(true); }}
              className="bg-gray-700 text-white text-sm rounded px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Start Date"
              style={{ colorScheme: 'dark' }}
            />
            <span className="text-gray-500 text-sm">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => { setCustomEndDate(e.target.value); setUseCustomDates(true); }}
              className="bg-gray-700 text-white text-sm rounded px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="End Date"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <button 
            onClick={() => fetchMetrics()}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <p className="text-red-200">{error}</p>
          <button 
            onClick={() => fetchMetrics()}
            className="ml-auto text-red-300 hover:text-white text-sm underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <IndianRupee className="h-5 w-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(revenue.totalRevenue)}</p>
          <p className="text-xs opacity-80 mt-1">Total Revenue</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="h-5 w-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{formatNumber(orders.totalOrders)}</p>
          <p className="text-xs opacity-80 mt-1">Total Orders</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(revenue.averageOrderValue)}</p>
          <p className="text-xs opacity-80 mt-1">Avg Order Value</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
              <p className="text-sm text-gray-400">Daily revenue and orders trend</p>
            </div>
            <div className="flex items-center gap-2">
              {(['area', 'line', 'bar'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1.5 text-xs rounded-md capitalize transition-colors ${
                    chartType === type ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {revenueByDay.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <IndianRupee className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No revenue data available</p>
                <p className="text-sm mt-1">Data will appear once orders are placed</p>
              </div>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'area' ? (
              <AreaChart data={revenueByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#10B981" fillOpacity={1} fill="url(#colorOrders)" name="Orders" />
              </AreaChart>
            ) : chartType === 'line' ? (
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={false} name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} dot={false} name="Orders" />
              </LineChart>
            ) : (
              <BarChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            )}
          </ResponsiveContainer>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Order Status</h3>
          <p className="text-sm text-gray-400 mb-4">Distribution by status</p>
          
          {orderStatusData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-500">
              <div className="text-center">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No order data</p>
              </div>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-gray-900 border border-gray-700 p-2 rounded-lg text-sm">
                      <p className="text-white font-medium">{data.name}</p>
                      <p className="text-gray-400">{data.value} orders ({data.percentage}%)</p>
                    </div>
                  );
                }
                return null;
              }} />
            </PieChart>
          </ResponsiveContainer>
          )}
          
          {orderStatusData.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {orderStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-gray-400">{item.name}</span>
                <span className="text-xs text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Inventory Alerts */}
      {(products.lowStockProducts > 0 || products.outOfStockProducts > 0) && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <div>
              <h4 className="text-yellow-400 font-medium">Inventory Alerts</h4>
              <p className="text-yellow-300/80 text-sm">
                {products.lowStockProducts} products low on stock • {products.outOfStockProducts} products out of stock
              </p>
            </div>
            <button className="ml-auto text-yellow-400 text-sm hover:text-yellow-300 font-medium">View Products →</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
