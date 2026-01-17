import axios from 'axios';

// API Base URLs - Use environment variables for production
const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8081/api';
const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || 'http://localhost:8082/api';
const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL || 'http://localhost:8083/api';
const PAYMENT_SERVICE_URL = import.meta.env.VITE_PAYMENT_SERVICE_URL || 'http://localhost:8084/api';
const SEARCH_SERVICE_URL = import.meta.env.VITE_SEARCH_SERVICE_URL || 'http://localhost:8090/api';
const EMAIL_SERVICE_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:8087/api';
const ADMIN_SERVICE_URL = import.meta.env.VITE_ADMIN_SERVICE_URL || 'http://localhost:8088/api';
const NOTIFICATION_SERVICE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:8086/api';

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

const notificationAPIInstance = axios.create({
  baseURL: NOTIFICATION_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
[userAPI, productAPIInstance, orderAPIInstance, paymentAPIInstance, searchAPIInstance, emailAPIInstance, notificationAPIInstance].forEach(api => {
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

  // Search using Solr (Search Service)
  searchProducts: async (params) => {
    try {
      console.log('Calling search service with params:', params);
      const response = await searchAPIInstance.post('/search', params);
      console.log('Search service response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error searching products via Solr:', error);
      return { success: false, data: { results: [] } };
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

  getTopLevel: async () => {
    try {
      const response = await productAPIInstance.get('/categories/top-level');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching top-level categories:', error);
      return { success: false, data: [] };
    }
  },

  getSubcategories: async (parentId) => {
    try {
      const response = await productAPIInstance.get(`/categories/${parentId}/subcategories`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return { success: false, data: [] };
    }
  },

  getById: async (id) => {
    try {
      const response = await productAPIInstance.get(`/categories/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching category:', error);
      return { success: false, data: null };
    }
  },

  create: async (categoryData) => {
    try {
      const response = await productAPIInstance.post('/categories', categoryData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to create category' };
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

  updateStatus: async (orderId, status) => {
    try {
      // First get the order to find its database ID
      const orderResponse = await orderAPIInstance.get(`/orders/number/${orderId}`);
      const dbId = orderResponse.data.id;
      
      // Prepare the request body - handle both string and object
      const requestBody = typeof status === 'string' ? { status } : status;
      
      // Update status using the database ID
      const response = await orderAPIInstance.put(`/orders/${dbId}/status`, requestBody);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.response?.data || 'Failed to update order status',
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

  confirmPayment: async (orderNumber, approved = true) => {
    try {
      const response = await orderAPIInstance.post(`/orders/${orderNumber}/verify-payment`, {
        approved: approved,
        notes: 'Payment confirmed by supplier'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to confirm payment',
      };
    }
  },

  // B2B Payment Methods
  getSupplierBankDetails: async (supplierId) => {
    try {
      const response = await orderAPIInstance.get(`/orders/supplier/${supplierId}/bank-details`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching bank details:', error);
      // Return default bank details if API fails
      return { 
        success: true, 
        data: {
          bankName: 'HDFC Bank',
          accountHolderName: 'Supplier Account',
          accountNumber: '50200012345678',
          ifscCode: 'HDFC0001234',
          upiId: 'supplier@hdfcbank'
        }
      };
    }
  },

  saveSupplierBankDetails: async (supplierId, bankDetails) => {
    try {
      const response = await orderAPIInstance.post(`/orders/supplier/${supplierId}/bank-details`, bankDetails);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      console.error('Error saving bank details:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save bank details',
      };
    }
  },

  uploadPaymentProof: async (formData) => {
    try {
      const response = await orderAPIInstance.post('/orders/upload/payment-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, ...response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file',
      };
    }
  },

  submitPaymentProof: async (orderNumber, proofData) => {
    try {
      const response = await orderAPIInstance.post(`/orders/${orderNumber}/payment-proof`, proofData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit payment proof',
      };
    }
  },

  getAwaitingVerification: async (supplierId) => {
    try {
      const response = await orderAPIInstance.get(`/orders/supplier/${supplierId}/awaiting-verification`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching orders awaiting verification:', error);
      return { success: false, data: [] };
    }
  },

  verifyPayment: async (orderNumber, verificationData) => {
    try {
      const response = await orderAPIInstance.post(`/orders/${orderNumber}/verify-payment`, verificationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify payment',
      };
    }
  },
};

// ==================== Quote APIs ====================
export const quoteAPI = {
  // Create a new quote request (buyer action)
  create: async (quoteData) => {
    try {
      const response = await orderAPIInstance.post('/quotes', quoteData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create quote request',
      };
    }
  },

  // Get quote by quote number
  getByNumber: async (quoteNumber) => {
    try {
      const response = await orderAPIInstance.get(`/quotes/${quoteNumber}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quote',
      };
    }
  },

  // Get all quotes for authenticated buyer
  getBuyerQuotes: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await orderAPIInstance.get('/quotes/buyer', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quotes',
      };
    }
  },

  // Get quotes for a specific buyer
  getBuyerQuotesById: async (buyerId, status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await orderAPIInstance.get(`/quotes/buyer/${buyerId}`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quotes',
      };
    }
  },

  // Get all quotes for authenticated supplier
  getSupplierQuotes: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await orderAPIInstance.get('/quotes/supplier', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quotes',
      };
    }
  },

  // Get quotes for a specific supplier
  getSupplierQuotesById: async (supplierId, status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await orderAPIInstance.get(`/quotes/supplier/${supplierId}`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quotes',
      };
    }
  },

  // Get supplier quote statistics
  getSupplierStats: async (supplierId) => {
    try {
      const response = await orderAPIInstance.get(`/quotes/supplier/${supplierId}/stats`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch quote stats',
      };
    }
  },

  // Supplier responds to quote with pricing
  respond: async (quoteNumber, responseData) => {
    try {
      const response = await orderAPIInstance.post(`/quotes/${quoteNumber}/respond`, responseData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to respond to quote',
      };
    }
  },

  // Supplier approves quote with final pricing
  approve: async (quoteNumber, approvalData) => {
    try {
      const response = await orderAPIInstance.post(`/quotes/${quoteNumber}/approve`, approvalData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve quote',
      };
    }
  },

  // Supplier rejects quote
  reject: async (quoteNumber, reason) => {
    try {
      const response = await orderAPIInstance.post(`/quotes/${quoteNumber}/reject`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reject quote',
      };
    }
  },

  // Supplier extends quote validity
  extendValidity: async (quoteNumber, additionalDays) => {
    try {
      const response = await orderAPIInstance.post(`/quotes/${quoteNumber}/extend`, { additionalDays });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to extend quote validity',
      };
    }
  },

  // Buyer sends counter-offer
  counterOffer: async (quoteNumber, message) => {
    try {
      const response = await orderAPIInstance.post(`/quotes/${quoteNumber}/counter-offer`, { message });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send counter-offer',
      };
    }
  },

  // Buyer cancels quote
  cancel: async (quoteNumber) => {
    try {
      const response = await orderAPIInstance.post(`/quotes/${quoteNumber}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel quote',
      };
    }
  },

  // Convert approved quote to order
  convertToOrder: async (quoteNumber, orderData = {}) => {
    try {
      const payload = {
        paymentType: orderData.paymentType || 'BANK_TRANSFER',
        shippingAddress: orderData.shippingAddress || '',
        notes: orderData.notes || ''
      };
      const response = await orderAPIInstance.post(`/quotes/${quoteNumber}/convert`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to convert quote to order',
      };
    }
  },

  // Add message to quote thread
  addMessage: async (quoteNumber, messageData) => {
    try {
      const response = await orderAPIInstance.post(`/quotes/${quoteNumber}/messages`, messageData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send message',
      };
    }
  },
};

// ==================== Dispute/Ticket APIs ====================
// Compliant with Indian E-Commerce Laws (Consumer Protection Act 2019)
export const disputeAPI = {
  // Create a new dispute/ticket
  create: async (disputeData) => {
    try {
      const response = await orderAPIInstance.post('/disputes', disputeData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create dispute',
      };
    }
  },

  // Get dispute by ticket number
  getByTicketNumber: async (ticketNumber) => {
    try {
      const response = await orderAPIInstance.get(`/disputes/${ticketNumber}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch dispute',
      };
    }
  },

  // Get all disputes for buyer
  getBuyerDisputes: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await orderAPIInstance.get('/disputes/buyer', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch disputes',
      };
    }
  },

  // Get all disputes for supplier
  getSupplierDisputes: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await orderAPIInstance.get('/disputes/supplier', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch disputes',
      };
    }
  },

  // Get supplier dispute statistics
  getSupplierStats: async () => {
    try {
      const response = await orderAPIInstance.get('/disputes/supplier/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch statistics',
      };
    }
  },

  // Acknowledge dispute (Supplier - must be within 48 hours)
  acknowledge: async (ticketNumber, message = null) => {
    try {
      const response = await orderAPIInstance.post(`/disputes/${ticketNumber}/acknowledge`, { message });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to acknowledge dispute',
      };
    }
  },

  // Respond to dispute (Supplier)
  respond: async (ticketNumber, responseData) => {
    try {
      const response = await orderAPIInstance.post(`/disputes/${ticketNumber}/respond`, responseData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to respond to dispute',
      };
    }
  },

  // Escalate dispute (Buyer)
  escalate: async (ticketNumber, reason) => {
    try {
      const response = await orderAPIInstance.post(`/disputes/${ticketNumber}/escalate`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to escalate dispute',
      };
    }
  },

  // Accept resolution (Buyer)
  acceptResolution: async (ticketNumber, rating = null, feedback = null, bankDetails = null) => {
    try {
      const response = await orderAPIInstance.post(`/disputes/${ticketNumber}/accept-resolution`, { rating, feedback, bankDetails });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to accept resolution',
      };
    }
  },

  // Add message to dispute thread
  addMessage: async (ticketNumber, messageData) => {
    try {
      const response = await orderAPIInstance.post(`/disputes/${ticketNumber}/messages`, messageData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send message',
      };
    }
  },


  // Save buyer bank details for refund
  saveBankDetails: async (ticketNumber, bankDetails) => {
    try {
      const response = await orderAPIInstance.post(`/disputes/${ticketNumber}/bank-details`, bankDetails);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save bank details',
      };
    }
  },

  // Upload refund proof (Supplier)
  uploadRefundProof: async (formData) => {
    try {
      const response = await orderAPIInstance.post('/disputes/upload/refund-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, ...response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload refund proof',
      };
    }
  },

  // Get buyer bank details for dispute (Supplier)
  getBuyerBankDetailsForDispute: async (ticketNumber) => {
    try {
      const response = await orderAPIInstance.get(`/disputes/${ticketNumber}/bank-details`);
      return { success: true, data: response.data?.data };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to fetch buyer bank details',
      };
    }
  },

  // Submit refund transaction (Supplier)
  submitRefundTransaction: async (ticketNumber, transactionData) => {
    try {
      const response = await orderAPIInstance.post(`/disputes/${ticketNumber}/refund-transaction`, transactionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit refund transaction',
      };
    }
  },

  // Confirm refund received (Buyer)
  confirmRefundReceived: async (ticketNumber) => {
    try {
      const response = await orderAPIInstance.post(`/disputes/${ticketNumber}/confirm-refund`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to confirm refund',
      };
    }
  },

  // Close dispute
  close: async (ticketNumber, reason = null) => {
    try {
      const response = await orderAPIInstance.post(`/disputes/${ticketNumber}/close`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to close dispute',
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

// ==================== Refund APIs ====================
export const refundAPI = {
  // Supplier initiates refund
  initiateRefund: async (data) => {
    try {
      const response = await orderAPIInstance.post('/refunds/initiate', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to initiate refund' };
    }
  },

  // Buyer confirms refund
  confirmRefund: async (refundId, data = {}) => {
    try {
      const response = await orderAPIInstance.post(`/refunds/${refundId}/confirm`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to confirm refund' };
    }
  },

  // Buyer rejects refund method
  rejectRefund: async (refundId, reason) => {
    try {
      const response = await orderAPIInstance.post(`/refunds/${refundId}/reject`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to reject refund' };
    }
  },

  // Supplier marks refund as completed
  completeRefund: async (refundId) => {
    try {
      const response = await orderAPIInstance.post(`/refunds/${refundId}/complete`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to complete refund' };
    }
  },

  // Get refunds for buyer
  getBuyerRefunds: async (buyerId) => {
    try {
      const response = await orderAPIInstance.get(`/refunds/buyer/${buyerId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  // Get pending refunds for buyer
  getPendingRefunds: async (buyerId) => {
    try {
      const response = await orderAPIInstance.get(`/refunds/buyer/${buyerId}/pending`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  // Get refunds for supplier
  getSupplierRefunds: async (supplierId) => {
    try {
      const response = await orderAPIInstance.get(`/refunds/supplier/${supplierId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  // Get refund by ID
  getRefund: async (refundId) => {
    try {
      const response = await orderAPIInstance.get(`/refunds/${refundId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: null };
    }
  },

  // Get buyer bank details
  getBuyerBankDetails: async (buyerId) => {
    try {
      const response = await orderAPIInstance.get(`/refunds/bank-details/buyer/${buyerId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },

  // Add buyer bank details
  addBuyerBankDetails: async (buyerId, data) => {
    try {
      const response = await orderAPIInstance.post(`/refunds/bank-details/buyer/${buyerId}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to add bank details' };
    }
  },

  // Update buyer bank details
  updateBuyerBankDetails: async (id, data) => {
    try {
      const response = await orderAPIInstance.put(`/refunds/bank-details/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to update bank details' };
    }
  },

  // Delete buyer bank details
  deleteBuyerBankDetails: async (id) => {
    try {
      await orderAPIInstance.delete(`/refunds/bank-details/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to delete bank details' };
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

// WhatsApp Notification API
export const whatsappAPI = {
  // Notify suppliers about product search
  notifyProductSearch: async (searchQuery, suppliers, buyerLocation = null, buyerId = null) => {
    try {
      const response = await notificationAPIInstance.post('/whatsapp/notify/product-search', {
        searchQuery,
        suppliers,
        buyerLocation,
        buyerId
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.log('WhatsApp notification error (non-critical):', error.message);
      return { success: false, message: 'Notification service unavailable' };
    }
  },

  // Notify supplier about new order
  notifyNewOrder: async (supplierId, supplierName, supplierPhone, orderNumber, orderAmount, buyerName) => {
    try {
      const response = await notificationAPIInstance.post('/whatsapp/notify/new-order', {
        supplierId,
        supplierName,
        supplierPhone,
        orderNumber,
        orderAmount,
        buyerName
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.log('WhatsApp notification error (non-critical):', error.message);
      return { success: false, message: 'Notification service unavailable' };
    }
  },

  // Notify supplier about payment received
  notifyPaymentReceived: async (supplierPhone, orderNumber, amount, paymentMethod) => {
    try {
      const response = await notificationAPIInstance.post('/whatsapp/notify/payment-received', {
        supplierPhone,
        orderNumber,
        amount,
        paymentMethod
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.log('WhatsApp notification error (non-critical):', error.message);
      return { success: false, message: 'Notification service unavailable' };
    }
  },

  // Test notification
  testNotification: async (phone, message) => {
    try {
      const response = await notificationAPIInstance.post('/whatsapp/test', { phone, message });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Test failed' };
    }
  }
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
  whatsapp: whatsappAPI,
};





