import React, { useState } from 'react';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import {
  X,
  User,
  Package,
  MapPin,
  CreditCard,
  Clock,
  Edit,
  Save,
  MessageSquare,
  Truck,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy
} from 'lucide-react';

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
    selectedColor?: string;
    selectedSize?: string;
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
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    country?: string;
  } | null;
  shippingInfo?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    shippedAt?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    shippingMethod?: string;
  };
  orderNotes?: Array<{
    note: string;
    addedAt: string;
    type: 'internal' | 'customer';
  }>;
  timeline?: Array<{
    action: string;
    details: string;
    performedAt: string;
    oldValue?: string;
    newValue?: string;
  }>;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onOrderUpdate: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'notes'>('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [newPaymentStatus, setNewPaymentStatus] = useState(order.paymentStatus);
  const [newNote, setNewNote] = useState('');
  
  // Tracking modal state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({
    carrier: order.shippingInfo?.carrier || '',
    trackingNumber: order.shippingInfo?.trackingNumber || '',
    trackingUrl: order.shippingInfo?.trackingUrl || '',
    estimatedDelivery: order.shippingInfo?.estimatedDelivery?.split('T')[0] || '',
    shippingMethod: order.shippingInfo?.shippingMethod || 'standard'
  });
  
  // Refund modal state
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState(order.total?.toString() || '0');
  const [refundReason, setRefundReason] = useState('');

  if (!isOpen) return null;

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
      month: 'long',
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

  // Update order status
  const handleStatusUpdate = async () => {
    if (newStatus === order.status && newPaymentStatus === order.paymentStatus) {
      toast.error('No changes to update');
      return;
    }

    setIsUpdating(true);
    try {
      // Update status if changed
      if (newStatus !== order.status) {
        console.log('Updating order status:', order._id, 'from', order.status, 'to', newStatus);
        const response = await fetch(`http://localhost:5001/api/admin/orders/${order._id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            notes: `Status updated from ${order.status} to ${newStatus}`
          })
        });

        const data = await response.json();
        console.log('Status update response:', data);
        if (!data.success) {
          throw new Error(data.message || 'Failed to update status');
        }
        toast.success(`Order status updated to ${newStatus}`);
      }

      // Update payment status if changed
      if (newPaymentStatus !== order.paymentStatus) {
        console.log('Updating payment status:', order._id, 'from', order.paymentStatus, 'to', newPaymentStatus);
        const response = await fetch(`http://localhost:5001/api/admin/orders/${order._id}/payment`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentStatus: newPaymentStatus,
            notes: `Payment status updated from ${order.paymentStatus} to ${newPaymentStatus}`
          })
        });

        const data = await response.json();
        console.log('Payment status update response:', data);
        if (!data.success) {
          throw new Error(data.message || 'Failed to update payment status');
        }
        toast.success(`Payment status updated to ${newPaymentStatus}`);
      }

      onOrderUpdate();
      onClose();
    } catch (error: any) {
      console.error('Update order error:', error);
      toast.error(error.message || 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  // Add note
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/orders/${order._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: newNote.trim(),
          type: 'internal'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Note added successfully');
        setNewNote('');
        onOrderUpdate();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Add note error:', error);
      toast.error(error.message || 'Failed to add note');
    }
  };

  // Handle tracking info update
  const handleUpdateTracking = async () => {
    if (!trackingInfo.trackingNumber && !trackingInfo.carrier) {
      toast.error('Please enter tracking number or carrier');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/orders/${order._id}/shipping`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingInfo: {
            carrier: trackingInfo.carrier,
            trackingNumber: trackingInfo.trackingNumber,
            trackingUrl: trackingInfo.trackingUrl,
            estimatedDelivery: trackingInfo.estimatedDelivery ? new Date(trackingInfo.estimatedDelivery) : undefined,
            shippingMethod: trackingInfo.shippingMethod
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Tracking information updated successfully');
        setIsTrackingModalOpen(false);
        onOrderUpdate();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Update tracking error:', error);
      toast.error(error.message || 'Failed to update tracking info');
    }
  };

  // Handle refund processing
  const handleProcessRefund = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    if (parseFloat(refundAmount) > order.total) {
      toast.error('Refund amount cannot exceed order total');
      return;
    }

    try {
      // Update payment status to refunded
      const response = await fetch(`http://localhost:5001/api/admin/orders/${order._id}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: 'refunded',
          notes: `Refund processed: ₹${parseFloat(refundAmount).toFixed(2)}. Reason: ${refundReason || 'Not specified'}`
        })
      });

      const data = await response.json();
      if (data.success) {
        // Add a note about the refund
        await fetch(`http://localhost:5001/api/admin/orders/${order._id}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: `Refund processed: ₹${parseFloat(refundAmount).toFixed(2)}. Reason: ${refundReason || 'Not specified'}`,
            type: 'internal'
          })
        });

        toast.success('Refund processed successfully');
        setIsRefundModalOpen(false);
        setRefundAmount(order.total?.toString() || '0');
        setRefundReason('');
        onOrderUpdate();
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Refund error:', error);
      toast.error(error.message || 'Failed to process refund');
    }
  };

  // Copy tracking number to clipboard
  const copyTrackingNumber = () => {
    if (order.shippingInfo?.trackingNumber) {
      navigator.clipboard.writeText(order.shippingInfo.trackingNumber);
      toast.success('Tracking number copied to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Order #{order._id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Status and Payment Update */}
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Order Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Order Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    disabled={order.status === 'cancelled'}
                  >
                    <option value="pending">Pending {order.status === 'pending' ? '(current)' : ''}</option>
                    <option value="processing">Processing {order.status === 'processing' ? '(current)' : ''}</option>
                    <option value="shipped">Shipped {order.status === 'shipped' ? '(current)' : ''}</option>
                    <option value="delivered">Delivered {order.status === 'delivered' ? '(current)' : ''}</option>
                    <option value="cancelled">Cancelled {order.status === 'cancelled' ? '(current)' : ''}</option>
                  </select>
                  {order.status === 'cancelled' && (
                    <p className="text-xs text-yellow-500 mt-1">
                      ⚠️ Order is cancelled - status cannot be changed
                    </p>
                  )}
                  {order.status !== 'cancelled' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Transitions: {order.status === 'pending' ? 'Processing, Shipped, Cancelled' : 
                             order.status === 'processing' ? 'Shipped, Delivered, Cancelled' : 
                             order.status === 'shipped' ? 'Delivered, Cancelled' : 
                             order.status === 'delivered' ? 'Cancelled' : ''}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Payment Status
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating || (newStatus === order.status && newPaymentStatus === order.paymentStatus)}
                    className="w-full"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Status
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border mb-6">
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
                  onClick={() => setActiveTab('timeline')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'timeline'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'notes'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  Notes ({order.orderNotes?.length || 0})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-foreground font-medium">{order.user?.name || 'Unknown Customer'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-foreground font-medium">{order.user?.email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-background rounded-md">
                        <div className="flex items-center space-x-3">
                          {item.product?.images && item.product.images[0] && (
                            <img
                              src={`http://localhost:5001/api/images/${item.product.images[0]}`}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{item.name || 'Unknown Product'}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity || 0} × {formatPrice(item.price || 0)}
                            </p>
                            {(item.selectedColor || item.selectedSize) && (
                              <p className="text-sm text-muted-foreground">
                                {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                                {item.selectedColor && item.selectedSize && <span> • </span>}
                                {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-foreground">{formatPrice(item.itemTotal || 0)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </h4>
                  {order.shippingAddress ? (
                    <div className="text-foreground">
                      <p className="font-medium">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && (
                        <p>{order.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country || 'United States'}</p>
                      <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No shipping address available</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Order Timeline</h4>
                {order.timeline && order.timeline.length > 0 ? (
                  <div className="space-y-4">
                    {order.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{event.action}</p>
                          <p className="text-sm text-muted-foreground">{event.details}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(event.performedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No timeline events available</p>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-foreground">Order Notes</h4>
                </div>

                {/* Add Note */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h5 className="font-medium text-foreground mb-3">Add Internal Note</h5>
                  <div className="space-y-3">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Enter internal note..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground resize-none"
                      rows={3}
                    />
                    <Button onClick={handleAddNote} size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Existing Notes */}
                {order.orderNotes && order.orderNotes.length > 0 ? (
                  <div className="space-y-3">
                    {order.orderNotes.map((note, index) => (
                      <div key={index} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            note.type === 'internal'
                              ? 'bg-blue-400/10 text-blue-400'
                              : 'bg-green-400/10 text-green-400'
                          }`}>
                            {note.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.addedAt)}
                          </span>
                        </div>
                        <p className="text-foreground">{note.note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No notes available</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border p-6 bg-muted/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>

            {/* Current Status */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize">{order.status}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  <span className="capitalize">{order.paymentStatus}</span>
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm text-foreground">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Shipping</span>
                <span className="text-sm text-foreground">
                  {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Tracking Info (if available) */}
            {order.shippingInfo?.trackingNumber && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <h4 className="text-sm font-medium text-foreground">Tracking Information</h4>
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  {order.shippingInfo.carrier && (
                    <p className="text-sm"><span className="text-muted-foreground">Carrier:</span> {order.shippingInfo.carrier}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm"><span className="text-muted-foreground">Tracking #:</span> {order.shippingInfo.trackingNumber}</p>
                    <Button variant="ghost" size="sm" onClick={copyTrackingNumber} className="h-6 px-2">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  {order.shippingInfo.trackingUrl && (
                    <a 
                      href={order.shippingInfo.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center hover:underline"
                    >
                      Track Package <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                  {order.shippingInfo.estimatedDelivery && (
                    <p className="text-sm"><span className="text-muted-foreground">Est. Delivery:</span> {new Date(order.shippingInfo.estimatedDelivery).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => setIsRefundModalOpen(true)}
                disabled={order.paymentStatus === 'refunded' || order.paymentStatus === 'unpaid'}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {order.paymentStatus === 'refunded' ? 'Refund Processed' : 'Process Refund'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => setIsTrackingModalOpen(true)}
              >
                <Truck className="h-4 w-4 mr-2" />
                {order.shippingInfo?.trackingNumber ? 'Update Tracking' : 'Add Tracking'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {isTrackingModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {order.shippingInfo?.trackingNumber ? 'Update' : 'Add'} Tracking Information
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setIsTrackingModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Carrier</label>
                <select
                  value={trackingInfo.carrier}
                  onChange={(e) => setTrackingInfo({...trackingInfo, carrier: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="">Select Carrier</option>
                  <option value="UPS">UPS</option>
                  <option value="FedEx">FedEx</option>
                  <option value="USPS">USPS</option>
                  <option value="DHL">DHL</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Tracking Number *</label>
                <input
                  type="text"
                  value={trackingInfo.trackingNumber}
                  onChange={(e) => setTrackingInfo({...trackingInfo, trackingNumber: e.target.value})}
                  placeholder="Enter tracking number"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Tracking URL (optional)</label>
                <input
                  type="url"
                  value={trackingInfo.trackingUrl}
                  onChange={(e) => setTrackingInfo({...trackingInfo, trackingUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Estimated Delivery</label>
                <input
                  type="date"
                  value={trackingInfo.estimatedDelivery}
                  onChange={(e) => setTrackingInfo({...trackingInfo, estimatedDelivery: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Shipping Method</label>
                <select
                  value={trackingInfo.shippingMethod}
                  onChange={(e) => setTrackingInfo({...trackingInfo, shippingMethod: e.target.value})}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="overnight">Overnight</option>
                  <option value="international">International</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setIsTrackingModalOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleUpdateTracking}>
                <Save className="h-4 w-4 mr-2" />
                Save Tracking
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Process Refund</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsRefundModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-500">
                ⚠️ This action cannot be undone. The payment status will be changed to "Refunded".
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Order Total</label>
                <p className="text-lg font-semibold text-foreground">{formatPrice(order.total)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Refund Amount *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={order.total}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Maximum refund: {formatPrice(order.total)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Reason for Refund</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter reason for refund..."
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setIsRefundModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700" 
                onClick={handleProcessRefund}
                disabled={!refundAmount || parseFloat(refundAmount) <= 0}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Process Refund
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailModal;
