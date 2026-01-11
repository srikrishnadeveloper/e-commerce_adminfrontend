import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import OrderDetailModal from '../components/modals/OrderDetailModal';
import toast from 'react-hot-toast';
import { authFetch } from '../services/api';
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  RefreshCw,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  ChevronDown,
  CreditCard,
  Ban,
  RotateCcw
} from 'lucide-react';

// Types
interface Order {
  _id: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  items: Array<{
    product?: {
      _id: string;
      name: string;
      images?: string[];
    } | null;
    name: string;
    price: number;
    quantity: number;
    itemTotal: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  createdAt: string;
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };
  returnRequest?: {
    requested: boolean;
    message?: string;
    requestedAt?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'completed';
    adminResponse?: string;
    respondedAt?: string;
  };
}

interface OrderSummary {
  statusCounts: Record<string, number>;
  paymentCounts: Record<string, number>;
  totalRevenue?: number;
  totalAllOrders?: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  });
  const [summary, setSummary] = useState<OrderSummary>({
    statusCounts: {},
    paymentCounts: {}
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching orders...');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentFilter) params.append('paymentStatus', paymentFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const url = `/api/admin/orders?${params}`;
      console.log('Fetching from URL:', url);

      const response = await authFetch(url);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setOrders(data.data.orders || []);
        setPagination(data.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalOrders: 0,
          hasNext: false,
          hasPrev: false
        });
        setSummary(data.data.summary || {
          statusCounts: {},
          paymentCounts: {}
        });
        console.log('Orders loaded successfully:', data.data.orders?.length || 0);
      } else {
        console.error('API returned error:', data.message);
        toast.error(data.message || 'Failed to fetch orders');
      }
    } catch (error: any) {
      console.error('Fetch orders error:', error);
      toast.error(`Failed to fetch orders: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearch, statusFilter, paymentFilter, dateFrom, dateTo]);

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'processing': return 'text-blue-400 bg-blue-400/10';
      case 'shipped': return 'text-purple-400 bg-purple-400/10';
      case 'delivered': return 'text-green-400 bg-green-400/10';
      case 'cancelled': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return 'text-green-400 bg-green-400/10';
      case 'unpaid': return 'text-red-400 bg-red-400/10';
      case 'refunded': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <RefreshCw className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Handle order selection
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order._id));
    }
  };

  // Handle view order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Handle search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // Immediately trigger search without waiting for debounce
    setDebouncedSearch(searchTerm);
  };

  // Handle filter change
  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'payment') {
      setPaymentFilter(value);
    }
    setCurrentPage(1);
  };

  // Export orders to CSV
  const handleExportOrders = async (exportSelected = false) => {
    try {
      setIsExporting(true);
      const ordersToExport = exportSelected ? orders.filter(o => selectedOrders.includes(o._id)) : orders;
      
      if (ordersToExport.length === 0) {
        toast.error('No orders to export');
        return;
      }

      // Create CSV content
      const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Items', 'Subtotal', 'Shipping', 'Total', 'Status', 'Payment Status', 'Order Date', 'Shipping Address'];
      const csvRows = [headers.join(',')];

      ordersToExport.forEach(order => {
        const row = [
          `"#${order._id.slice(-8).toUpperCase()}"`,
          `"${order.user?.name || 'Unknown'}"`,
          `"${order.user?.email || 'N/A'}"`,
          order.items?.length || 0,
          order.subtotal?.toFixed(2) || '0.00',
          order.shipping?.toFixed(2) || '0.00',
          order.total?.toFixed(2) || '0.00',
          order.status || 'pending',
          order.paymentStatus || 'unpaid',
          order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
          order.shippingAddress ? `"${order.shippingAddress.fullName}, ${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}"` : 'N/A'
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${ordersToExport.length} orders successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export orders');
    } finally {
      setIsExporting(false);
    }
  };

  // Bulk update order status
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      toast.error('Please select a status');
      return;
    }

    if (selectedOrders.length === 0) {
      toast.error('Please select orders to update');
      return;
    }

    try {
      const response = await authFetch('http://localhost:5001/api/admin/orders/bulk/status', {
        method: 'POST',
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: bulkStatus,
          notes: `Bulk status update to ${bulkStatus}`
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Successfully updated ${data.data.updatedCount} orders`);
        setSelectedOrders([]);
        setBulkStatus('');
        setIsBulkStatusModalOpen(false);
        fetchOrders();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Bulk update error:', error);
      toast.error(error.message || 'Failed to update orders');
    }
  };

  // Quick status update for single order
  const handleQuickStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await authFetch(`http://localhost:5001/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          notes: `Quick status update to ${newStatus}`
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Quick status update error:', error);
      toast.error(error.message || 'Failed to update order status');
    }
  };

  // Quick payment status update
  const handleQuickPaymentUpdate = async (orderId: string, newPaymentStatus: string) => {
    try {
      const response = await authFetch(`http://localhost:5001/api/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({
          paymentStatus: newPaymentStatus,
          notes: `Quick payment status update to ${newPaymentStatus}`
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Payment status updated to ${newPaymentStatus}`);
        fetchOrders();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Quick payment update error:', error);
      toast.error(error.message || 'Failed to update payment status');
    }
  };

  // Handle return request response
  const handleReturnResponse = async (orderId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await authFetch(`http://localhost:5001/api/admin/orders/${orderId}/return`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Return request ${status}`);
        fetchOrders();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Return response error:', error);
      toast.error(error.message || 'Failed to respond to return request');
    }
  };

  // Get next valid status options for an order
  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return [{ value: 'processing', label: 'Processing' }, { value: 'cancelled', label: 'Cancel' }];
      case 'processing': return [{ value: 'shipped', label: 'Shipped' }, { value: 'cancelled', label: 'Cancel' }];
      case 'shipped': return [{ value: 'delivered', label: 'Delivered' }];
      case 'delivered': return [];
      case 'cancelled': return [];
      default: return [];
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('');
    setPaymentFilter('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // Use summary values from backend (total of ALL orders, not just current page)
  const totalRevenue = summary.totalRevenue || 0;
  const totalAllOrders = summary.totalAllOrders || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleExportOrders(false)}
            disabled={isExporting || orders.length === 0}
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export All
          </Button>
          <Button onClick={() => fetchOrders()} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold text-foreground">{totalAllOrders.toLocaleString()}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Orders</p>
              <p className="text-2xl font-bold text-foreground">{summary.statusCounts.pending || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Delivered Orders</p>
              <p className="text-2xl font-bold text-foreground">{summary.statusCounts.delivered || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                />
              </div>
            </form>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => handleFilterChange('payment', e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
            >
              <option value="">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Date Range:</span>
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
              placeholder="From"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
              placeholder="To"
            />
            {(searchTerm || statusFilter || paymentFilter || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Table Header with Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-primary/10 border-b border-border px-6 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsBulkStatusModalOpen(true)}
                >
                  Update Status
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportOrders(true)}
                  disabled={isExporting}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedOrders([])}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-6">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Order ID</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Customer</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Items</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Payment</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                      <span className="text-muted-foreground">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={order._id} 
                    className={`border-b border-border hover:bg-muted/30 ${
                      order.returnRequest?.requested && order.returnRequest?.status === 'pending' 
                        ? 'bg-gray-200/50 dark:bg-gray-700/30' 
                        : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => handleOrderSelect(order._id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        {order.returnRequest?.requested && order.returnRequest?.status === 'pending' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Return
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-foreground">{order.user?.name || 'Unknown Customer'}</p>
                        <p className="text-sm text-muted-foreground">{order.user?.email || 'No email'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-foreground">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-foreground">{formatPrice(order.total || 0)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                        {getStatusIcon(order.status || 'pending')}
                        <span className="ml-1 capitalize">{order.status || 'pending'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus || 'unpaid')}`}>
                        <span className="capitalize">{order.paymentStatus || 'unpaid'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-muted-foreground">{order.createdAt ? formatDate(order.createdAt) : 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        {/* View Details Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          title="View Details"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {/* Quick Actions Dropdown */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpenActionMenu(openActionMenu === order._id ? null : order._id)}
                            className="h-8 w-8 p-0"
                            title="Quick Actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          
                          {openActionMenu === order._id && (
                            <>
                              {/* Backdrop to close menu */}
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setOpenActionMenu(null)}
                              />
                              
                              {/* Dropdown Menu */}
                              <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                                {/* Quick Status Updates */}
                                {getNextStatusOptions(order.status).length > 0 && (
                                  <>
                                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Update Status
                                    </div>
                                    {getNextStatusOptions(order.status).map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() => {
                                          handleQuickStatusUpdate(order._id, option.value);
                                          setOpenActionMenu(null);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                                      >
                                        {option.value === 'processing' && <RefreshCw className="h-4 w-4 text-blue-400" />}
                                        {option.value === 'shipped' && <Truck className="h-4 w-4 text-purple-400" />}
                                        {option.value === 'delivered' && <CheckCircle className="h-4 w-4 text-green-400" />}
                                        {option.value === 'cancelled' && <Ban className="h-4 w-4 text-red-400" />}
                                        <span>Mark as {option.label}</span>
                                      </button>
                                    ))}
                                    <div className="border-t border-border my-1" />
                                  </>
                                )}
                                
                                {/* Payment Status */}
                                <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Payment
                                </div>
                                {order.paymentStatus !== 'paid' && (
                                  <button
                                    onClick={() => {
                                      handleQuickPaymentUpdate(order._id, 'paid');
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                                  >
                                    <CreditCard className="h-4 w-4 text-green-400" />
                                    <span>Mark as Paid</span>
                                  </button>
                                )}
                                {order.paymentStatus === 'paid' && (
                                  <button
                                    onClick={() => {
                                      handleQuickPaymentUpdate(order._id, 'refunded');
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                                  >
                                    <DollarSign className="h-4 w-4 text-orange-400" />
                                    <span>Process Refund</span>
                                  </button>
                                )}
                                
                                {/* Return Request Actions */}
                                {order.returnRequest?.requested && order.returnRequest?.status === 'pending' && (
                                  <>
                                    <div className="border-t border-border my-1" />
                                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Return Request
                                    </div>
                                    <div className="px-3 py-1 text-xs text-muted-foreground italic">
                                      "{order.returnRequest.message?.slice(0, 50)}..."
                                    </div>
                                    <button
                                      onClick={() => {
                                        handleReturnResponse(order._id, 'approved');
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-400" />
                                      <span>Approve Return</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleReturnResponse(order._id, 'rejected');
                                        setOpenActionMenu(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                                    >
                                      <XCircle className="h-4 w-4 text-red-400" />
                                      <span>Reject Return</span>
                                    </button>
                                  </>
                                )}
                                
                                <div className="border-t border-border my-1" />
                                
                                {/* View Full Details */}
                                <button
                                  onClick={() => {
                                    handleViewOrder(order);
                                    setOpenActionMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View Full Details</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalOrders)} of {pagination.totalOrders} orders
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onOrderUpdate={fetchOrders}
        />
      )}

      {/* Bulk Status Update Modal */}
      {isBulkStatusModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Update Order Status</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsBulkStatusModalOpen(false);
                  setBulkStatus('');
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Update status for {selectedOrders.length} selected order{selectedOrders.length !== 1 ? 's' : ''}
            </p>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="w-full px-3 py-2 mb-4 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsBulkStatusModalOpen(false);
                  setBulkStatus('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus}
              >
                Update Status
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
