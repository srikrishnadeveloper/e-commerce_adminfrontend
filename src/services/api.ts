import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    bestseller?: boolean;
    featured?: boolean;
    inStock?: boolean;
    search?: string;
  }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  create: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  update: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  updateStatus: async (id: string, status: { bestseller?: boolean; featured?: boolean; inStock?: boolean }) => {
    const response = await api.patch(`/products/${id}/status`, status);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/products/stats/overview');
    return response.data;
  }
};

// Site Config API
export const siteConfigAPI = {
  get: async () => {
    const response = await api.get('/siteconfig');
    return response.data;
  },
  
  update: async (configData: any) => {
    const response = await api.put('/siteconfig', configData);
    return response.data;
  },
  
  updateTheme: async (themeData: any) => {
    const response = await api.patch('/siteconfig/theme', themeData);
    return response.data;
  },
  
  updateFeatures: async (featuresData: any) => {
    const response = await api.patch('/siteconfig/features', featuresData);
    return response.data;
  },
  
  updateMaintenance: async (maintenanceData: any) => {
    const response = await api.patch('/siteconfig/maintenance', maintenanceData);
    return response.data;
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Images API
export const imagesAPI = {
  getAll: async () => {
    const response = await api.get('/images');
    return response.data;
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    isActive?: boolean;
  }) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  getProducts: async (id: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    inStock?: boolean;
    featured?: boolean;
    bestseller?: boolean;
  }) => {
    const response = await api.get(`/categories/${id}/products`, { params });
    return response.data;
  },
  
  create: async (categoryData: any) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },
  
  update: async (id: string, categoryData: any) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  
  delete: async (id: string, reassignTo?: string) => {
    const params = reassignTo ? { reassignTo } : {};
    const response = await api.delete(`/categories/${id}`, { params });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/categories/stats/overview');
    return response.data;
  }
};

export default api; 