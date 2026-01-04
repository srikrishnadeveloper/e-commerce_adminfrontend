import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import CustomerDetailModal from '../components/modals/CustomerDetailModal';
import toast from 'react-hot-toast';
import {
  Search,
  Download,
  Eye,
  Mail,
  Users,
  Heart,
  MessageSquare,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  RefreshCw
} from 'lucide-react';

// Types
interface Customer {
  _id: string;
  name: string;
  email: string;
  registrationDate: string;
  wishlistCount: number;
  cartCount: number;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
}

interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerPagination {
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

const CustomerManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customers' | 'inquiries'>('customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<CustomerPagination>({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    hasNext: false,
    hasPrev: false,
    limit: 20
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Contact Inquiries state
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquirySearchTerm, setInquirySearchTerm] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);

  // Load customers data
  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`http://localhost:5001/api/admin/customers?${params}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data.customers);
        setPagination(data.data.pagination);
      } else {
        toast.error('Failed to load customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  // Load contact inquiries
  const loadInquiries = async () => {
    try {
      setInquiriesLoading(true);
      const response = await fetch('http://localhost:5001/api/contact');
      const data = await response.json();

      if (data.success) {
        setInquiries(data.data);
        // Count new inquiries for badge
        const newCount = data.data.filter((inq: ContactInquiry) => inq.status === 'new').length;
        setNewInquiriesCount(newCount);
      } else {
        toast.error('Failed to load inquiries');
      }
    } catch (error) {
      console.error('Error loading inquiries:', error);
      toast.error('Failed to load contact inquiries');
    } finally {
      setInquiriesLoading(false);
    }
  };

  // Update inquiry status
  const updateInquiryStatus = async (inquiryId: string, status: string) => {
    try {
      const loadingToast = toast.loading('Updating status...');
      const response = await fetch(`http://localhost:5001/api/contact/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Status updated!', { id: loadingToast });
        loadInquiries(); // Refresh the list
      } else {
        toast.error('Failed to update status', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast.error('Failed to update status');
    }
  };

  // Delete inquiry
  const deleteInquiry = async (inquiryId: string) => {
    try {
      const loadingToast = toast.loading('Deleting inquiry...');
      const response = await fetch(`http://localhost:5001/api/contact/${inquiryId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Inquiry deleted!', { id: loadingToast });
        loadInquiries(); // Refresh the list
        setIsInquiryModalOpen(false);
      } else {
        toast.error('Failed to delete inquiry', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      toast.error('Failed to delete inquiry');
    }
  };

  // Mark as read when viewing
  const viewInquiry = async (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setIsInquiryModalOpen(true);
    
    if (inquiry.status === 'new') {
      try {
        await fetch(`http://localhost:5001/api/contact/${inquiry._id}/read`, {
          method: 'PATCH'
        });
        loadInquiries(); // Refresh to update status
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.name.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
                         inquiry.email.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
                         inquiry.message.toLowerCase().includes(inquirySearchTerm.toLowerCase());
    const matchesStatus = inquiryStatusFilter === 'all' || inquiry.status === inquiryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadCustomers();
  }, [pagination.currentPage, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    loadInquiries(); // Load inquiries on mount
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer._id);
    setIsCustomerModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const loadingToast = toast.loading('Exporting customers...');
      
      const response = await fetch('http://localhost:5001/api/admin/customers/export?format=csv');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Customers exported successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export customers');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'customers'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </div>
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'inquiries'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Contact Inquiries
            {newInquiriesCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {newInquiriesCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Customers Tab Content */}
      {activeTab === 'customers' && (
        <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl font-semibold text-foreground">Customer Management</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 bg-input border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-input border border-border rounded-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="createdAt">Registration Date</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="totalSpent">Total Spent</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-3 py-2 bg-input border border-border rounded-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Customer Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          <span className="ml-3 text-muted-foreground">Loading customers...</span>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No customers found
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Wishlist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(customer.registrationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{customer.orderCount}</div>
                      <div className="text-xs text-muted-foreground">
                        Avg: {formatPrice(customer.averageOrderValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {formatPrice(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-foreground">{customer.wishlistCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        onClick={() => handleViewCustomer(customer)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCustomers)} of{' '}
            {pagination.totalCustomers} customers
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={!pagination.hasPrev}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={!pagination.hasNext}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
        </>
      )}

      {/* Contact Inquiries Tab Content */}
      {activeTab === 'inquiries' && (
        <>
          {/* Inquiries Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-xl font-semibold text-foreground">Contact Inquiries</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={inquirySearchTerm}
                  onChange={(e) => setInquirySearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-input border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <select
                value={inquiryStatusFilter}
                onChange={(e) => setInquiryStatusFilter(e.target.value)}
                className="px-3 py-2 bg-input border border-border rounded-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
              <Button
                onClick={loadInquiries}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Inquiries Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Inquiries</p>
                  <p className="text-2xl font-bold text-foreground">{inquiries.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New</p>
                  <p className="text-2xl font-bold text-foreground">
                    {inquiries.filter(i => i.status === 'new').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Replied</p>
                  <p className="text-2xl font-bold text-foreground">
                    {inquiries.filter(i => i.status === 'replied').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Archived</p>
                  <p className="text-2xl font-bold text-foreground">
                    {inquiries.filter(i => i.status === 'archived').length}
                  </p>
                </div>
                <Archive className="h-8 w-8 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Inquiries Table */}
          {inquiriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              <span className="ml-3 text-muted-foreground">Loading inquiries...</span>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {inquiries.length === 0 ? 'No contact inquiries yet' : 'No inquiries match your search'}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Message Preview
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredInquiries.map((inquiry) => (
                      <tr key={inquiry._id} className={`hover:bg-muted/30 ${inquiry.status === 'new' ? 'bg-blue-500/5' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            inquiry.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                            inquiry.status === 'read' ? 'bg-blue-100 text-blue-800' :
                            inquiry.status === 'replied' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.status === 'new' && <Clock className="w-3 h-3 mr-1" />}
                            {inquiry.status === 'read' && <Eye className="w-3 h-3 mr-1" />}
                            {inquiry.status === 'replied' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {inquiry.status === 'archived' && <Archive className="w-3 h-3 mr-1" />}
                            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-foreground">{inquiry.name}</div>
                            <div className="text-sm text-muted-foreground">{inquiry.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {inquiry.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(inquiry.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => viewInquiry(inquiry)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => deleteInquiry(inquiry._id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setSelectedCustomerId(null);
        }}
        customerId={selectedCustomerId}
      />

      {/* Inquiry Detail Modal */}
      {isInquiryModalOpen && selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsInquiryModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Contact Inquiry</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Received on {formatDate(selectedInquiry.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setIsInquiryModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground mt-1">{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground mt-1">
                      <a href={`mailto:${selectedInquiry.email}`} className="text-blue-500 hover:underline">
                        {selectedInquiry.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <p className="text-foreground mt-1">
                    <a href={`tel:${selectedInquiry.phone}`} className="text-blue-500 hover:underline">
                      {selectedInquiry.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => {
                      updateInquiryStatus(selectedInquiry._id, e.target.value);
                      setSelectedInquiry({ ...selectedInquiry, status: e.target.value as any });
                    }}
                    className="mt-1 w-full px-3 py-2 bg-input border border-border rounded-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <div className="mt-1 p-4 bg-muted/30 rounded-lg text-foreground whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    onClick={() => deleteInquiry(selectedInquiry._id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=Re: Contact Inquiry&body=Hi ${selectedInquiry.name},%0D%0A%0D%0AThank you for reaching out to us.%0D%0A%0D%0A`}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors"
                      onClick={() => updateInquiryStatus(selectedInquiry._id, 'replied')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Reply via Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
