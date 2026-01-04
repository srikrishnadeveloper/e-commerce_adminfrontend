import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Admin {
  id: string;
  username: string;
  name: string;
  email: string;
  priority: number;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    priority: 2
  });

  useEffect(() => {
    // Get current admin info
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      setCurrentAdmin(JSON.parse(adminInfo));
    }
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/siteconfig-api/admin-auth/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAdmins(data.admins);
      } else {
        toast.error(data.message || 'Failed to fetch admins');
      }
    } catch (error) {
      console.error('Fetch admins error:', error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error('Username and password are required');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/siteconfig-api/admin-auth/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Admin created successfully!');
        setShowCreateForm(false);
        setFormData({ username: '', password: '', priority: 2 });
        fetchAdmins();
      } else {
        toast.error(data.message || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Create admin error:', error);
      toast.error('Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  // Check if current user is super admin
  if (!currentAdmin || currentAdmin.priority !== 1) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Only super admins (Priority 1) can access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Management</h1>
            <p className="text-muted-foreground">Manage admin accounts and permissions</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Admin
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create New Admin</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Admin'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Admins List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{admin.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.priority === 1 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {admin.priority === 1 ? (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Super Admin
                        </>
                      ) : (
                        `Priority ${admin.priority}`
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {admins.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No admins found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
