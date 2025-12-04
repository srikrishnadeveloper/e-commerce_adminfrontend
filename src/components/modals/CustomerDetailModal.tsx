import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { 
  X, 
  Calendar, 
  ShoppingBag, 
  Heart, 
  DollarSign,
  TrendingUp,
  User,
  Activity
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  registrationDate: string;
  lastActive: string;
  wishlistCount: number;
  cartCount: number;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
}

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    product: Product;
    quantity: number;
    price: number;
  }>;
}

interface CustomerDetailData {
  customer: Customer;
  wishlist: Product[];
  cart: Array<{
    product: Product;
    quantity: number;
  }>;
  recentOrders: Order[];
}

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customerId
}) => {
  const [customerData, setCustomerData] = useState<CustomerDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'wishlist' | 'orders'>('overview');

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomerData();
    }
  }, [isOpen, customerId]);

  const loadCustomerData = async () => {
    if (!customerId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5001/api/admin/customers/${customerId}`);
      const data = await response.json();

      if (data.success) {
        setCustomerData(data.data);
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-400';
      case 'shipped': return 'text-blue-400';
      case 'processing': return 'text-yellow-400';
      case 'pending': return 'text-orange-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Customer Details</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading customer data...</span>
            </div>
          ) : customerData ? (
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{customerData.customer.name}</h3>
                      <p className="text-muted-foreground">{customerData.customer.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Registered</p>
                        <p className="text-sm text-foreground">{formatDate(customerData.customer.registrationDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Last Active</p>
                        <p className="text-sm text-foreground">{formatDate(customerData.customer.lastActive)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total Spent</p>
                        <p className="text-lg font-semibold text-foreground">{formatPrice(customerData.customer.totalSpent)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="text-lg font-semibold text-foreground">{customerData.customer.orderCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Wishlist</p>
                        <p className="text-lg font-semibold text-foreground">{customerData.customer.wishlistCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Order</p>
                        <p className="text-lg font-semibold text-foreground">{formatPrice(customerData.customer.averageOrderValue)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-border">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'wishlist'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    Wishlist ({customerData.wishlist.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'orders'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                    }`}
                  >
                    Recent Orders ({customerData.recentOrders.length})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">Current Cart</h4>
                    {customerData.cart && customerData.cart.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customerData.cart.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                            {item.product?.images && item.product.images[0] && (
                              <img
                                src={`http://localhost:5001/api/images/${item.product.images[0]}`}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{item.product?.name || 'Unknown Product'}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              <p className="text-sm font-semibold text-green-400">{formatPrice(item.product?.price || 0)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No items in cart</p>
                    )}
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">Wishlist Items</h4>
                    {customerData.wishlist.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No items in wishlist</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customerData.wishlist.map((product) => (
                          <div key={product._id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                            {product.images && product.images[0] && (
                              <img
                                src={`http://localhost:5001/api/images/${product.images[0]}`}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                              <p className="text-sm font-semibold text-green-400">{formatPrice(product.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">Recent Orders</h4>
                    {customerData.recentOrders.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No orders found</p>
                    ) : (
                      <div className="space-y-3">
                        {customerData.recentOrders.map((order) => (
                          <div key={order._id} className="border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium text-foreground">Order #{order._id.slice(-8)}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-foreground">{formatPrice(order.total)}</p>
                                <p className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Failed to load customer data
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
