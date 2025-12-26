import axios from 'axios';

// API Base URLs - Use environment variables for production
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081/api';
const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:8082/api';
const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:8083/api';
const PAYMENT_SERVICE_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:8084/api';
const SEARCH_SERVICE_URL = import.meta.env.VITE_SEARCH_SERVICE_URL || 'http://localhost:8090/api';
const EMAIL_SERVICE_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:8087/api';
const ADMIN_SERVICE_URL = import.meta.env.VITE_ADMIN_SERVICE_URL || 'http://localhost:8088/api';

// Create axios instance for each service
const userAPI = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const productAPIInstance = axios.create({
  baseURL: PRODUCT_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const orderAPIInstance = axios.create({
  baseURL: ORDER_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const paymentAPIInstance = axios.create({
  baseURL: PAYMENT_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const searchAPIInstance = axios.create({
  baseURL: SEARCH_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const emailAPIInstance = axios.create({
  baseURL: EMAIL_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const adminAPIInstance = axios.create({
  baseURL: ADMIN_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
[userAPI, productAPIInstance, orderAPIInstance, paymentAPIInstance, searchAPIInstance, emailAPIInstance].forEach(api => {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle response errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
});

// ==================== Auth APIs ====================
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await userAPI.post('/auth/login', credentials);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data || 'Login failed',
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await userAPI.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data || 'Registration failed',
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// ==================== Product APIs ====================
export const productAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await productAPIInstance.get('/products', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, data: [] };
    }
  },

  getById: async (id) => {
    try {
      const response = await productAPIInstance.get(`/products/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { success: false, data: null };
    }
  },

  getFeatured: async () => {
    try {
      const response = await productAPIInstance.get('/products/featured');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return { success: false, data: [] };
    }
  },

  getTopRated: async () => {
    try {
      const response = await productAPIInstance.get('/products/top-rated');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching top rated products:', error);
      return { success: false, data: [] };
    }
  },

  getBySupplier: async (supplierId) => {
    try {
      const response = await productAPIInstance.get(`/products/supplier/${supplierId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      return { success: false, data: [] };
    }
  },

  getByCategory: async (categoryId) => {
    try {
      const response = await productAPIInstance.get(`/products/category/${categoryId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching category products:', error);
      return { success: false, data: [] };
    }
  },

  search: async (params) => {
    try {
      const response = await productAPIInstance.get('/products/search', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error searching products:', error);
      return { success: false, data: [] };
    }
  },

  getPriceRange: async (minPrice, maxPrice) => {
    try {
      const response = await productAPIInstance.get('/products/price-range', {
        params: { minPrice, maxPrice }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching products by price range:', error);
      return { success: false, data: [] };
    }
  },

  create: async (productData) => {
    try {
      const response = await productAPIInstance.post('/products', productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create product',
      };
    }
  },

  update: async (id, productData) => {
    try {
      const response = await productAPIInstance.put(`/products/${id}`, productData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update product',
      };
    }
  },

  delete: async (id) => {
    try {
      await productAPIInstance.delete(`/products/${id}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete product',
      };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await productAPIInstance.put(`/products/${id}/status`, { status });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update product status',
      };
    }
  },
};

// ==================== Category APIs ====================
export const categoryAPI = {
  getAll: async () => {
    try {
      const response = await productAPIInstance.get('/categories');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, data: [] };
    }
  },
};

// ==================== Bundle APIs ====================
export const bundleAPI = {
  getAll: async () => {
    try {
      const response = await productAPIInstance.get('/bundles');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching bundles:', error);
      return { success: false, data: [] };
    }
  },

  getFeatured: async () => {
    try {
      const response = await productAPIInstance.get('/bundles/featured');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching featured bundles:', error);
      return { success: false, data: [] };
    }
  },

  getById: async (id) => {
    try {
      const response = await productAPIInstance.get(`/bundles/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching bundle:', error);
      return { success: false, data: null };
    }
  },

  getBySupplier: async (supplierId) => {
    try {
      const response = await productAPIInstance.get(`/bundles/supplier/${supplierId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching supplier bundles:', error);
      return { success: false, data: [] };
    }
  },

  search: async (keyword) => {
    try {
      const response = await productAPIInstance.get('/bundles/search', { params: { keyword } });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error searching bundles:', error);
      return { success: false, data: [] };
    }
  },

  getByProduct: async (productId) => {
    try {
      const response = await productAPIInstance.get(`/bundles/product/${productId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching product bundles:', error);
      return { success: false, data: [] };
    }
  },

  create: async (bundleData) => {
    try {
      const response = await productAPIInstance.post('/bundles', bundleData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating bundle:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create bundle' };
    }
  },

  update: async (id, bundleData) => {
    try {
      const response = await productAPIInstance.put(`/bundles/${id}`, bundleData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating bundle:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update bundle' };
    }
  },

  delete: async (id) => {
    try {
      await productAPIInstance.delete(`/bundles/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting bundle:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete bundle' };
    }
  },

  deactivate: async (id) => {
    try {
      await productAPIInstance.put(`/bundles/${id}/deactivate`);
      return { success: true };
    } catch (error) {
      console.error('Error deactivating bundle:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to deactivate bundle' };
    }
  },
};

// ==================== Order APIs ====================
export const orderAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await orderAPIInstance.get('/orders', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, data: [] };
    }
  },

  getById: async (id) => {
    try {
      const response = await orderAPIInstance.get(`/orders/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, data: null };
    }
  },

  getByOrderNumber: async (orderNumber) => {
    try {
      const response = await orderAPIInstance.get(`/orders/number/${orderNumber}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, data: null };
    }
  },

  getByBuyer: async (buyerId, status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await orderAPIInstance.get(`/orders/buyer/${buyerId}`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching buyer orders:', error);
      return { success: false, data: [] };
    }
  },

  getBySupplier: async (supplierId, status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await orderAPIInstance.get(`/orders/supplier/${supplierId}`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching supplier orders:', error);
      return { success: false, data: [] };
    }
  },

  create: async (orderData) => {
    try {
      const response = await orderAPIInstance.post('/orders', orderData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data || 'Failed to create order',
      };
    }
  },

  updateStatus: async (orderId, statusData) => {
    try {
      // First get the order to find its database ID
      const orderResponse = await orderAPIInstance.get(`/orders/number/${orderId}`);
      const dbId = orderResponse.data.id;
      
      // Update status using the database ID
      const response = await orderAPIInstance.put(`/orders/${dbId}/status`, statusData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status',
      };
    }
  },

  cancel: async (orderId, reason = '') => {
    try {
      const response = await orderAPIInstance.post(`/orders/${orderId}/cancel`, null, {
        params: { reason }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || 'Failed to cancel order',
      };
    }
  },

  refund: async (orderId, reason = '') => {
    try {
      const response = await orderAPIInstance.post(`/orders/${orderId}/refund`, null, {
        params: { reason }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || 'Failed to process refund',
      };
    }
  },

  confirmPayment: async (orderNumber) => {
    try {
      const response = await orderAPIInstance.put(`/orders/number/${orderNumber}/confirm-payment`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to confirm payment',
      };
    }
  },
};

// ==================== Cart APIs ====================
export const cartAPI = {
  getCart: async () => {
    try {
      const response = await userAPI.get('/cart');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { success: false, data: [] };
    }
  },

  addItem: async (productId, quantity) => {
    try {
      const response = await userAPI.post('/cart/add', { productId, quantity });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item to cart',
      };
    }
  },

  updateItem: async (productId, quantity) => {
    try {
      const response = await userAPI.put('/cart/update', { productId, quantity });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart item',
      };
    }
  },

  removeItem: async (productId) => {
    try {
      await userAPI.delete(`/cart/${productId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item from cart',
      };
    }
  },

  clearCart: async () => {
    try {
      await userAPI.delete('/cart/clear');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart',
      };
    }
  },
};

// ==================== Supplier APIs ====================
export const supplierAPI = {
  getById: async (id) => {
    try {
      const response = await userAPI.get(`/suppliers/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching supplier:', error);
      return { success: false, data: null };
    }
  },

  getByUserId: async (userId) => {
    try {
      const response = await userAPI.get(`/suppliers/user/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching supplier by user ID:', error);
      return { success: false, data: null };
    }
  },

  getProducts: async (supplierId) => {
    try {
      const response = await productAPIInstance.get(`/products/supplier/${supplierId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      return { success: false, data: [] };
    }
  },
};

// ==================== Payment APIs ====================
export const paymentAPI = {
  processPayment: async (paymentData) => {
    try {
      const response = await paymentAPIInstance.post('/payments/process', paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Payment processing failed',
      };
    }
  },

  getPaymentsByOrder: async (orderId) => {
    try {
      const response = await paymentAPIInstance.get(`/payments/order/${orderId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return { success: false, data: [] };
    }
  },

  getPaymentByTransactionId: async (transactionId) => {
    try {
      const response = await paymentAPIInstance.get(`/payments/transaction/${transactionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching payment:', error);
      return { success: false, data: null };
    }
  },

  refundPayment: async (transactionId, reason) => {
    try {
      const response = await paymentAPIInstance.post('/payments/refund', {
        transactionId,
        reason,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Refund failed',
      };
    }
  },
};

// ==================== Analytics APIs ====================
export const analyticsAPI = {
  getSupplierStats: async (period = 'month') => {
    try {
      const response = await orderAPIInstance.get('/analytics/supplier/stats', { params: { period } });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { success: false, data: null };
    }
  },

  getRevenueTrend: async (period = 'month') => {
    try {
      const response = await orderAPIInstance.get('/analytics/revenue', { params: { period } });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching revenue trend:', error);
      return { success: false, data: [] };
    }
  },
};

// ==================== Search APIs (Solr) ====================
export const searchAPI = {
  // Basic search with query parameters
  search: async (params = {}) => {
    try {
      const response = await searchAPIInstance.get('/search', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error performing search:', error);
      return {
        success: false,
        data: {
          results: [],
          totalResults: 0,
          page: 0,
          size: 20,
          totalPages: 0,
          searchTime: 0
        }
      };
    }
  },

  // Advanced search with request body (POST)
  advancedSearch: async (searchRequest) => {
    try {
      const response = await searchAPIInstance.post('/search/advanced', searchRequest);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error performing advanced search:', error);
      return {
        success: false,
        data: {
          results: [],
          totalResults: 0,
          page: 0,
          size: 20,
          totalPages: 0,
          searchTime: 0,
          facets: [],
          highlighting: {}
        }
      };
    }
  },

  // Autocomplete for search-as-you-type
  autocomplete: async (query, limit = 10, field = 'name') => {
    try {
      const response = await searchAPIInstance.get('/search/advanced/autocomplete', {
        params: { q: query, limit, field }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error getting autocomplete suggestions:', error);
      return { success: false, data: { suggestions: [] } };
    }
  },

  // Get similar products (More Like This)
  getSimilarProducts: async (productId, limit = 5) => {
    try {
      const response = await searchAPIInstance.get(`/search/advanced/similar-products/${productId}`, {
        params: { limit }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error getting similar products:', error);
      return { success: false, data: [] };
    }
  },

  // Get trending products
  getTrendingProducts: async (limit = 10, category = null) => {
    try {
      const params = { limit };
      if (category) params.category = category;
      const response = await searchAPIInstance.get('/search/advanced/trending', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error getting trending products:', error);
      return { success: false, data: [] };
    }
  },

  // Get facets for filtering
  getFacets: async (query = '') => {
    try {
      const response = await searchAPIInstance.get('/search/advanced/facets', {
        params: { q: query }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error getting facets:', error);
      return { success: false, data: {} };
    }
  },

  // Search by category
  searchByCategory: async (categoryId, options = {}) => {
    try {
      const { q, sortBy = 'relevance', page = 0, size = 20 } = options;
      const response = await searchAPIInstance.get(`/search/advanced/category/${categoryId}`, {
        params: { q, sortBy, page, size }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error searching by category:', error);
      return { success: false, data: { results: [], totalResults: 0 } };
    }
  },

  // Search by supplier
  searchBySupplier: async (supplierId, options = {}) => {
    try {
      const { q, sortBy = 'relevance', page = 0, size = 20 } = options;
      const response = await searchAPIInstance.get(`/search/advanced/supplier/${supplierId}`, {
        params: { q, sortBy, page, size }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error searching by supplier:', error);
      return { success: false, data: { results: [], totalResults: 0 } };
    }
  },

  // Get featured products
  getFeaturedProducts: async (page = 0, size = 20) => {
    try {
      const response = await searchAPIInstance.get('/search/advanced/featured', {
        params: { page, size }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error getting featured products:', error);
      return { success: false, data: { results: [], totalResults: 0 } };
    }
  },

  // Trigger manual index synchronization
  syncIndex: async () => {
    try {
      const response = await searchAPIInstance.post('/search/sync');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error syncing index:', error);
      return { success: false, message: error.response?.data?.message || 'Sync failed' };
    }
  },

  // Health check
  health: async () => {
    try {
      const response = await searchAPIInstance.get('/search/health');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Search service health check failed:', error);
      return { success: false, data: null };
    }
  },

  // Get index stats (admin)
  getStats: async () => {
    try {
      const response = await searchAPIInstance.get('/search/admin/stats');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error getting search stats:', error);
      return { success: false, data: null };
    }
  },
};

// ==================== Email APIs ====================
export const emailAPI = {
  // Send generic email
  sendEmail: async (emailRequest) => {
    try {
      const response = await emailAPIInstance.post('/email/send', emailRequest);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: error.response?.data?.message || 'Email sending failed' };
    }
  },

  // Send registration email
  sendRegistrationEmail: async (email, name, activationLink) => {
    try {
      const response = await emailAPIInstance.post('/email/registration', null, {
        params: { email, name, activationLink }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending registration email:', error);
      return { success: false, message: error.response?.data?.message || 'Email sending failed' };
    }
  },

  // Send order confirmation email
  sendOrderConfirmation: async (orderData) => {
    try {
      const response = await emailAPIInstance.post('/email/order/confirmation', orderData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      return { success: false, message: error.response?.data?.message || 'Email sending failed' };
    }
  },

  // Send order status update email
  sendOrderStatusUpdate: async (orderData, previousStatus) => {
    try {
      const response = await emailAPIInstance.post('/email/order/status', orderData, {
        params: { previousStatus }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending order status update:', error);
      return { success: false, message: error.response?.data?.message || 'Email sending failed' };
    }
  },

  // Send password reset email
  sendPasswordReset: async (email, name, resetLink) => {
    try {
      const response = await emailAPIInstance.post('/email/password-reset', null, {
        params: { email, name, resetLink }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, message: error.response?.data?.message || 'Email sending failed' };
    }
  },

  // Get email logs
  getEmailLogs: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await emailAPIInstance.get('/email/logs', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching email logs:', error);
      return { success: false, data: [] };
    }
  },

  // Get email statistics
  getEmailStats: async () => {
    try {
      const response = await emailAPIInstance.get('/email/stats');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching email stats:', error);
      return { success: false, data: null };
    }
  },

  // Health check
  health: async () => {
    try {
      const response = await emailAPIInstance.get('/email/health');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Email service health check failed:', error);
      return { success: false, data: null };
    }
  },
};

// ==================== Admin APIs ====================
export const adminAPI = {
  getDashboardStats: async () => {
    try {
      const response = await adminAPIInstance.get('/admin/dashboard/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch dashboard stats' };
    }
  },

  getAllUsers: async () => {
    try {
      const response = await adminAPIInstance.get('/admin/users');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch users' };
    }
  },

  getUsersByType: async (type) => {
    try {
      const response = await adminAPIInstance.get(`/admin/users/type/${type}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch users' };
    }
  },

  updateUserStatus: async (userId, isActive) => {
    try {
      const response = await adminAPIInstance.put(`/admin/users/${userId}/status?isActive=${isActive}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update user status' };
    }
  },

  deleteUser: async (userId) => {
    try {
      await adminAPIInstance.delete(`/admin/users/${userId}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete user' };
    }
  },

  getRecentOrders: async (limit = 10) => {
    try {
      const response = await adminAPIInstance.get(`/admin/orders/recent?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch recent orders' };
    }
  },

  getTopProducts: async (limit = 10) => {
    try {
      const response = await adminAPIInstance.get(`/admin/products/top?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch top products' };
    }
  },

  getTopSuppliers: async (limit = 10) => {
    try {
      const response = await adminAPIInstance.get(`/admin/suppliers/top?limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch top suppliers' };
    }
  },
};

export default {
  auth: authAPI,
  product: productAPI,
  category: categoryAPI,
  bundle: bundleAPI,
  order: orderAPI,
  cart: cartAPI,
  supplier: supplierAPI,
  payment: paymentAPI,
  analytics: analyticsAPI,
  search: searchAPI,
  email: emailAPI,
  admin: adminAPI,
};
