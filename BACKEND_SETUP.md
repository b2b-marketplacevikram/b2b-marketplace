# B2B Marketplace - Backend Setup Guide

## Overview
Complete backend setup with MySQL database and Java Spring Boot microservices for the B2B marketplace platform.

## Architecture
```
Backend (Spring Boot Microservices)
├── User Service (Port 8081) - Authentication & User Management
├── Product Service (Port 8082) - Product Catalog Management
├── Order Service (Port 8083) - Order Processing
└── Payment Service (Port 8084) - Payment Processing

Database: MySQL 8.0+
Frontend: React + Vite (Port 3000/5173)
```

## Prerequisites
- **Java 17** or higher
- **Maven 3.8+**
- **MySQL 8.0+**
- **Node.js 14+** (for frontend)

## Database Setup

### Step 1: Install MySQL
Download and install MySQL from: https://dev.mysql.com/downloads/mysql/

mysqld --initialize-insecure

Start Server mysqld --console

Next Window mysql -u root --skip-password

ALTER USER 'root'@'localhost' IDENTIFIED BY '1234';


### Step 2: Create Database
```bash
# Login to MySQL
mysql -u root -p

# Run the schema creation script
mysql -u root -p < database/schema.sql

# Load sample data
mysql -u root -p < database/sample_data.sql
```

### Step 3: Verify Database
```sql
USE b2b_marketplace;
SHOW TABLES;

-- Should show:
-- buyers, cart_items, categories, certifications, favorites, messages,
-- notifications, order_items, orders, payment_transactions, product_images,
-- products, reviews, supplier_certifications, suppliers, users
```

## Backend Services Setup

### Step 1: Update Database Credentials
Edit `backend/user-service/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 2: Build All Services
```bash
cd backend
mvn clean install
```

### Step 3: Run User Service
```bash
cd backend/user-service
mvn spring-boot:run
```

User Service will start on `http://localhost:8081`

### Step 4: Run Product Service (Optional)
```bash
cd backend/product-service
mvn spring-boot:run
```

Product Service will start on `http://localhost:8082`

## API Endpoints

### User Service (Port 8081)

#### Authentication

**POST** `/api/auth/register`
```json
{
  "email": "buyer@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "userType": "BUYER",
  "phone": "+1-555-0123",
  "companyName": "ABC Company",
  "country": "United States",
  "city": "New York"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "buyer@example.com",
  "fullName": "John Doe",
  "userType": "BUYER"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "buyer@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "buyer@example.com",
  "fullName": "John Doe",
  "userType": "BUYER"
}
```

### Product Service (Port 8082)

**GET** `/api/products` - Get all products
**GET** `/api/products/{id}` - Get product by ID
**GET** `/api/products/search?keyword={keyword}` - Search products
**POST** `/api/products` - Create product (Supplier only)
**PUT** `/api/products/{id}` - Update product
**DELETE** `/api/products/{id}` - Delete product

**GET** `/api/categories` - Get all categories

### Order Service (Port 8083)

**GET** `/api/orders` - Get user orders
**GET** `/api/orders/{id}` - Get order details
**POST** `/api/orders` - Create new order
**PUT** `/api/orders/{id}/status` - Update order status (Supplier only)

### Cart Service (User Service - Port 8081)

**GET** `/api/cart` - Get cart items
**POST** `/api/cart/add` - Add item to cart
**PUT** `/api/cart/update` - Update cart item quantity
**DELETE** `/api/cart/{productId}` - Remove from cart

## Frontend Integration

### Step 1: Install Axios
```bash
npm install axios
```

### Step 2: Create API Configuration
Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  search: (keyword) => api.get('/products/search', { params: { keyword } }),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
};

// Order APIs
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  updateItem: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  removeItem: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

export default api;
```

### Step 3: Update AuthContext to Use Real API
Modify `src/context/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, ...user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isSupplier: user?.userType === 'SUPPLIER',
    isBuyer: user?.userType === 'BUYER',
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
```

## Testing the API

### Test User Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer1@example.com","password":"password"}'
```

### Test Product Listing (after implementing Product Service)
```bash
curl -X GET http://localhost:8082/api/products
```

## Database Schema Overview

### Key Tables

**users** - User accounts (buyers & suppliers)
- id, email, password_hash, user_type, full_name, phone

**suppliers** - Supplier business details
- id, user_id, company_name, business_type, country, rating

**buyers** - Buyer company details
- id, user_id, company_name, country, shipping_address

**products** - Product catalog
- id, supplier_id, category_id, name, description, unit_price, moq

**orders** - Purchase orders
- id, order_number, buyer_id, supplier_id, status, total_amount

**order_items** - Order line items
- id, order_id, product_id, quantity, unit_price

**cart_items** - Shopping cart
- id, buyer_id, product_id, quantity

**categories** - Product categories
- id, name, slug, description

## Security

### JWT Authentication
- Token expiration: 24 hours
- Token storage: localStorage
- Token prefix: "Bearer "

### Password Encryption
- Algorithm: BCrypt
- Strength: 10 rounds

### CORS Configuration
- Allowed origins: localhost:3000, localhost:5173
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS

## Development Workflow

1. **Start MySQL Database**
2. **Start User Service** (Port 8081)
3. **Start Frontend** (Port 3000 or 5173)
4. **Test Authentication**
5. **Implement Product Service** (Optional)
6. **Implement Order Service** (Optional)

## Sample Test Data

The database includes sample data:
- **3 Buyers**: buyer1@example.com, buyer2@example.com, buyer3@example.com
- **4 Suppliers**: supplier1@techcorp.com, etc.
- **10 Products**: Electronics, machinery, textiles, etc.
- **5 Orders**: Various order statuses
- **8 Categories**: Electronics, Machinery, Textiles, etc.

Default password for all sample users: `password`

## Next Steps

1. ✅ Database schema created
2. ✅ User Service implemented with authentication
3. ✅ Product Service implemented with catalog management
4. ✅ Order Service implemented with order processing
5. ✅ Payment Service implemented with payment processing
6. ⏳ Integrate frontend with Product Service APIs

## Troubleshooting

### Cannot connect to MySQL
- Check MySQL is running: `systemctl status mysql` (Linux) or Task Manager (Windows)
- Verify port 3306 is open
- Check credentials in application.properties

### Port already in use
- Change server.port in application.properties
- Kill process using the port

### CORS errors
- Verify cors.allowed-origins in application.properties
- Check frontend is running on allowed origin

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT Documentation](https://jwt.io/)
- [React Axios](https://axios-http.com/docs/intro)

---

**Status**: All backend services (User, Product, Order, Payment) fully implemented and ready. See individual service guides:
- [Order Service Guide](ORDER_SERVICE_GUIDE.md)
- [Payment Service Guide](PAYMENT_SERVICE_GUIDE.md)
- [Product Service Guide](PRODUCT_SERVICE_GUIDE.md)
