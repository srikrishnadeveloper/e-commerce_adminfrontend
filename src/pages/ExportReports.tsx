import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import toast from 'react-hot-toast';
import {
  Download,
  FileSpreadsheet,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Loader2,
  CheckCircle,
  FileText,
  RefreshCw
} from 'lucide-react';

interface ExportType {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  filters: string[];
}

const API_BASE = 'http://localhost:5001';

const ExportReports: React.FC = () => {
  const [exportTypes, setExportTypes] = useState<ExportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [groupBy, setGroupBy] = useState('daily');
  const [category, setCategory] = useState('');
  const [inStock, setInStock] = useState('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  useEffect(() => {
    loadExportTypes();
    
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const loadExportTypes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE}/api/export/types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        setExportTypes(data.data);
      }
    } catch (error) {
      console.error('Failed to load export types:', error);
      // Set default types
      setExportTypes([
        { id: 'orders', name: 'Orders', description: 'Export all orders', endpoint: '/api/export/orders', filters: ['startDate', 'endDate', 'status'] },
        { id: 'customers', name: 'Customers', description: 'Export customers', endpoint: '/api/export/customers', filters: ['startDate', 'endDate'] },
        { id: 'products', name: 'Products', description: 'Export products', endpoint: '/api/export/products', filters: ['category', 'inStock'] },
        { id: 'sales', name: 'Sales Report', description: 'Export sales', endpoint: '/api/export/sales', filters: ['startDate', 'endDate', 'groupBy'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (exportType: ExportType) => {
    setExporting(exportType.id);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      // Build query params
      const params = new URLSearchParams();
      if (exportType.filters.includes('startDate') && startDate) {
        params.append('startDate', startDate);
      }
      if (exportType.filters.includes('endDate') && endDate) {
        params.append('endDate', endDate);
      }
      if (exportType.filters.includes('status') && status) {
        params.append('status', status);
      }
      if (exportType.filters.includes('groupBy') && groupBy) {
        params.append('groupBy', groupBy);
      }
      if (exportType.filters.includes('category') && category) {
        params.append('category', category);
      }
      if (exportType.filters.includes('inStock') && inStock) {
        params.append('inStock', inStock);
      }
      params.append('format', format);
      
      const url = `${API_BASE}${exportType.endpoint}?${params.toString()}`;
      
      if (format === 'json') {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        // Create JSON file download
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${exportType.id}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        toast.success(`Exported ${data.count || 0} records to JSON`);
      } else {
        // CSV download
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          throw new Error('Export failed');
        }
        
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${exportType.id}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        
        toast.success(`${exportType.name} exported successfully!`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(null);
    }
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'orders':
        return ShoppingCart;
      case 'customers':
        return Users;
      case 'products':
        return Package;
      case 'sales':
        return TrendingUp;
      default:
        return FileSpreadsheet;
    }
  };

  const getIconColor = (id: string) => {
    switch (id) {
      case 'orders':
        return 'text-blue-500';
      case 'customers':
        return 'text-green-500';
      case 'products':
        return 'text-purple-500';
      case 'sales':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Download className="h-6 w-6" />
            Export Reports
          </h2>
          <p className="text-muted-foreground mt-1">
            Export your data in CSV or JSON format for analysis and reporting
          </p>
        </div>
        <Button variant="outline" onClick={loadExportTypes}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Export Settings
            </h3>

            <div className="space-y-4">
              {/* Date Range */}
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Order Status Filter */}
              <div>
                <Label htmlFor="status">Order Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Group By (for sales report) */}
              <div>
                <Label htmlFor="groupBy">Group By (Sales)</Label>
                <select
                  id="groupBy"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {/* Stock Filter (for products) */}
              <div>
                <Label htmlFor="inStock">Stock Status</Label>
                <select
                  id="inStock"
                  value={inStock}
                  onChange={(e) => setInStock(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">All Products</option>
                  <option value="true">In Stock Only</option>
                  <option value="false">Out of Stock Only</option>
                </select>
              </div>

              {/* Format */}
              <div>
                <Label htmlFor="format">Export Format</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={format === 'csv' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormat('csv')}
                    className="flex-1"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant={format === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormat('json')}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-2">💡 Quick Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• CSV files can be opened in Excel</li>
              <li>• JSON format is ideal for developers</li>
              <li>• Date filters apply to order/customer exports</li>
              <li>• Sales reports include summary totals</li>
            </ul>
          </div>
        </div>

        {/* Export Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportTypes.map((exportType) => {
            const Icon = getIcon(exportType.id);
            const iconColor = getIconColor(exportType.id);
            const isExporting = exporting === exportType.id;

            return (
              <div
                key={exportType.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{exportType.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {exportType.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exportType.filters.map((filter) => (
                        <span
                          key={filter}
                          className="text-xs px-2 py-0.5 bg-muted rounded"
                        >
                          {filter}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleExport(exportType)}
                  disabled={isExporting}
                  className="w-full mt-4"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export {format.toUpperCase()}
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Exports (placeholder for future feature) */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Export History
        </h3>
        <p className="text-muted-foreground text-center py-8">
          Export history tracking coming soon...
        </p>
      </div>
    </div>
  );
};

export default ExportReports;
