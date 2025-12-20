import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import {
  CreditCard,
  QrCode,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  AlertTriangle,
  IndianRupee,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';

const API_BASE = 'http://localhost:5001';

interface PaymentSettings {
  paymentMode: 'razorpay' | 'manual_upi';
  upiSettings: {
    qrCodeImage: string;
    upiId: string;
    merchantName: string;
    instructions: string;
  };
  razorpayConfigured: boolean;
}

interface PendingOrder {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  total: number;
  paymentInfo: {
    upiTransactionId: string;
    upiSubmittedAt: string;
    amount: number;
  };
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    itemTotal: number;
  }>;
}

const PaymentManagement: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings>({
    paymentMode: 'razorpay',
    upiSettings: {
      qrCodeImage: '',
      upiId: '',
      merchantName: 'TechCart Store',
      instructions: 'Scan the QR code using any UPI app (Google Pay, PhonePe, Paytm, etc.) to make payment.'
    },
    razorpayConfigured: false
  });
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Load payment settings
      const settingsRes = await fetch(`${API_BASE}/api/payment-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const settingsData = await settingsRes.json();
      if (settingsData.success) {
        setSettings(settingsData.data);
      }

      // Load pending verifications
      const pendingRes = await fetch(`${API_BASE}/api/payment-settings/pending-verifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pendingData = await pendingRes.json();
      if (pendingData.success) {
        setPendingOrders(pendingData.data);
      }
    } catch (error) {
      console.error('Error loading payment settings:', error);
      toast.error('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      const res = await fetch(`${API_BASE}/api/payment-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMode: settings.paymentMode,
          upiSettings: settings.upiSettings
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Payment settings saved successfully!');
        setSettings(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      setUploadingQR(true);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;
        
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE}/api/payment-settings/upload-qr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ qrCodeImage: base64Image })
        });
        
        const data = await res.json();
        if (data.success) {
          toast.success('QR code uploaded successfully!');
          setSettings(prev => ({
            ...prev,
            upiSettings: {
              ...prev.upiSettings,
              qrCodeImage: data.data.qrCodeImage
            }
          }));
        } else {
          throw new Error(data.message);
        }
        setUploadingQR(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload QR code');
      setUploadingQR(false);
    }
  };

  const handleVerifyPayment = async (orderId: string, verified: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const res = await fetch(`${API_BASE}/api/payment-settings/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          verified,
          notes: verificationNotes
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(verified ? 'Payment verified! Customer notified.' : 'Payment rejected. Customer notified.');
        setSelectedOrder(null);
        setVerificationNotes('');
        loadData(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify payment');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading payment settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payment Management</h2>
          <p className="text-muted-foreground mt-1">Configure payment methods and verify UPI payments</p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Payment Mode Toggle */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Mode
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Razorpay Option */}
          <div
            onClick={() => setSettings(prev => ({ ...prev, paymentMode: 'razorpay' }))}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              settings.paymentMode === 'razorpay'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Razorpay</h4>
                  <p className="text-sm text-muted-foreground">Automated payments</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                settings.paymentMode === 'razorpay' ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`}>
                {settings.paymentMode === 'razorpay' && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Accept cards, UPI, net banking via Razorpay gateway. Payments are verified automatically.
            </p>
          </div>

          {/* Manual UPI Option */}
          <div
            onClick={() => setSettings(prev => ({ ...prev, paymentMode: 'manual_upi' }))}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              settings.paymentMode === 'manual_upi'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Manual UPI (QR Code)</h4>
                  <p className="text-sm text-muted-foreground">Manual verification</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                settings.paymentMode === 'manual_upi' ? 'border-primary bg-primary' : 'border-muted-foreground'
              }`}>
                {settings.paymentMode === 'manual_upi' && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Show QR code to customers. They pay via UPI and enter transaction ID for manual verification.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSaveSettings}
          className="mt-4"
          disabled={saving}
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Payment Mode'
          )}
        </Button>
      </div>

      {/* UPI QR Settings (only shown when manual_upi is selected) */}
      {settings.paymentMode === 'manual_upi' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            UPI QR Code Settings
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                QR Code Image
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {settings.upiSettings.qrCodeImage ? (
                  <div className="space-y-4">
                    <img
                      src={settings.upiSettings.qrCodeImage}
                      alt="UPI QR Code"
                      className="max-w-[200px] mx-auto rounded-lg"
                    />
                    <label className="cursor-pointer">
                      <span className="text-primary hover:underline text-sm">Change QR Code</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQRUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      {uploadingQR ? (
                        <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
                      ) : (
                        <Upload className="h-12 w-12 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-foreground font-medium">Upload QR Code</p>
                        <p className="text-sm text-muted-foreground">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRUpload}
                      className="hidden"
                      disabled={uploadingQR}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* UPI Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  UPI ID (Display Only)
                </label>
                <input
                  type="text"
                  value={settings.upiSettings.upiId}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    upiSettings: { ...prev.upiSettings, upiId: e.target.value }
                  }))}
                  placeholder="yourname@upi"
                  className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Shown to customers as reference (optional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Merchant Name
                </label>
                <input
                  type="text"
                  value={settings.upiSettings.merchantName}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    upiSettings: { ...prev.upiSettings, merchantName: e.target.value }
                  }))}
                  placeholder="Your Store Name"
                  className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Instructions
                </label>
                <textarea
                  value={settings.upiSettings.instructions}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    upiSettings: { ...prev.upiSettings, instructions: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground resize-none"
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'Saving...' : 'Save UPI Settings'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Verifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Payment Verifications
            {pendingOrders.length > 0 && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </h3>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-muted-foreground">No pending verifications</p>
            <p className="text-sm text-muted-foreground">All UPI payments have been verified</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div
                key={order._id}
                className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500 text-sm">
                        <Clock className="h-4 w-4" />
                        Pending
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-foreground font-medium">{order.user.name}</p>
                        <p className="text-sm text-muted-foreground">{order.user.email}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">Transaction ID:</span>
                          <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono text-foreground">
                            {order.paymentInfo.upiTransactionId}
                          </code>
                          <button
                            onClick={() => copyToClipboard(order.paymentInfo.upiTransactionId, order._id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === order._id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {formatDate(order.paymentInfo.upiSubmittedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-2xl font-bold text-foreground flex items-center">
                        <IndianRupee className="h-5 w-5" />
                        {order.total.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {order.items.length} item(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {selectedOrder?._id === order._id ? 'Hide Details' : 'View Details'}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerifyPayment(order._id, true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setVerificationNotes('');
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedOrder?._id === order._id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground mb-3">Order Items</h4>
                    <div className="bg-muted/50 rounded-lg p-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2 border-b border-border last:border-0">
                          <span className="text-foreground">{item.name} × {item.quantity}</span>
                          <span className="text-foreground font-medium">₹{item.itemTotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Verification Notes (for rejection)
                      </label>
                      <textarea
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Enter reason if rejecting payment..."
                        rows={2}
                        className="w-full px-4 py-2 bg-input border border-border rounded-md text-foreground resize-none"
                      />
                    </div>

                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-foreground font-medium">Verification Steps</p>
                          <ol className="text-sm text-muted-foreground mt-1 space-y-1 list-decimal list-inside">
                            <li>Open your Google Pay/PhonePe/Paytm app</li>
                            <li>Go to transaction history</li>
                            <li>Search for transaction ID: <code className="bg-muted px-1 rounded">{order.paymentInfo.upiTransactionId}</code></li>
                            <li>Verify amount matches: ₹{order.total.toFixed(2)}</li>
                            <li>Click "Verify" if payment is confirmed, or "Reject" with reason</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
