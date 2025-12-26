# B2B Marketplace - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                  │
│                         Port: 3000/5173                          │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │   Buyer     │  │   Supplier   │  │   Authentication   │     │
│  │   Pages     │  │   Pages      │  │   Pages            │     │
│  └─────────────┘  └──────────────┘  └────────────────────┘     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API Service Layer (axios)                    │   │
│  │  authAPI | productAPI | orderAPI | cartAPI | supplierAPI │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/REST
                          │ JSON + JWT Token
┌─────────────────────────┴───────────────────────────────────────┐
│                    BACKEND (Spring Boot Microservices)           │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  User Service   │  │ Product Service │  │  Order Service  │ │
│  │   Port: 8081    │  │   Port: 8082    │  │   Port: 8083    │ │
│  │                 │  │                 │  │                 │ │
│  │ • Auth APIs     │  │ • Product CRUD  │  │ • Order CRUD    │ │
│  │ • JWT Security  │  │ • Categories    │  │ • Status Update │ │
│  │ • User CRUD     │  │ • Search        │  │ • Analytics     │ │
│  │ • Cart APIs     │  │ • Images        │  │                 │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                     │          │
│           └────────────────────┴─────────────────────┘          │
│                                │                                 │
│  ┌─────────────────────────────┴──────────────────────────────┐ │
│  │              Payment Service (Port: 8084)                   │ │
│  │              • Payment Processing                            │ │
│  │              • Transaction Management                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │ JDBC
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                    DATABASE (MySQL 8.0+)                         │
│                    Port: 3306                                    │
│                                                                   │
│  Tables:                                                          │
│  • users, buyers, suppliers                                      │
│  • products, categories, product_images                          │
│  • orders, order_items                                           │
│  • cart_items, favorites                                         │
│  • reviews, messages, notifications                              │
│  • payment_transactions                                          │
│  • certifications, supplier_certifications                       │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. User Registration Flow
```
User (Browser)
    │
    │ 1. Fill registration form
    ▼
React Register Page
    │
    │ 2. POST /api/auth/register
    │    { email, password, fullName, userType, ... }
    ▼
User Service (8081)
    │
    │ 3. Validate data
    │ 4. Hash password (BCrypt)
    │ 5. Create user record
    │ 6. Create buyer/supplier record
    │ 7. Generate JWT token
    ▼
MySQL Database
    │
    │ 8. Return token + user data
    ▼
React Frontend
    │
    │ 9. Store token in localStorage
    │ 10. Update AuthContext
    │ 11. Redirect to dashboard
    ▼
User sees Home/Dashboard
```

### 2. Product Search Flow
```
User enters search query
    │
    ▼
Product Search Page
    │
    │ GET /api/products/search?keyword=...
    │ Headers: Authorization: Bearer <token>
    ▼
Product Service (8082)
    │
    │ 1. Validate JWT token
    │ 2. Parse search parameters
    │ 3. Query database (FULLTEXT search)
    ▼
MySQL Database
    │
    │ 4. Return matching products
    ▼
React Frontend
    │
    │ 5. Display ProductCard components
    ▼
User sees search results
```

### 3. Order Creation Flow
```
User clicks "Place Order"
    │
    ▼
Checkout Page
    │
    │ 1. Collect shipping info
    │ 2. POST /api/orders
    │    { items, shippingAddress, paymentMethod, ... }
    │    Headers: Authorization: Bearer <token>
    ▼
Order Service (8083)
    │
    │ 3. Validate JWT token
    │ 4. Extract user ID from token
    │ 5. Validate cart items
    │ 6. Calculate totals
    │ 7. Create order record
    │ 8. Create order_items records
    │ 9. Update product stock
    │ 10. Clear cart
    ▼
Payment Service (8084)
    │
    │ 11. Process payment
    │ 12. Create transaction record
    ▼
MySQL Database
    │
    │ 13. Return order confirmation
    ▼
React Frontend
    │
    │ 14. Show success message
    │ 15. Redirect to order tracking
    ▼
User sees order confirmation
```

## Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Security Layers                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Layer 1: CORS (Cross-Origin Resource Sharing)            │
│  ├─ Allowed Origins: localhost:3000, localhost:5173       │
│  ├─ Allowed Methods: GET, POST, PUT, DELETE, OPTIONS      │
│  └─ Credentials: Allowed                                  │
│                                                            │
│  Layer 2: JWT Token Authentication                        │
│  ├─ Algorithm: HS512                                      │
│  ├─ Expiration: 24 hours                                  │
│  ├─ Claims: userId, email, userType                       │
│  └─ Header: Authorization: Bearer <token>                 │
│                                                            │
│  Layer 3: Spring Security                                 │
│  ├─ Public endpoints: /api/auth/**, /api/public/**        │
│  ├─ Protected endpoints: All others                       │
│  └─ Session: Stateless (no server sessions)               │
│                                                            │
│  Layer 4: Password Encryption                             │
│  ├─ Algorithm: BCrypt                                     │
│  └─ Strength: 10 rounds                                   │
│                                                            │
│  Layer 5: Database Security                               │
│  ├─ Parameterized queries (JPA)                           │
│  ├─ Connection pooling                                    │
│  └─ SSL/TLS for production                                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
```
React 18.2.0
├── Vite 5.0.8 (Build tool)
├── React Router 6.20.0 (Routing)
├── Axios (HTTP client)
└── Context API (State management)
```

### Backend
```
Spring Boot 3.2.0
├── Spring Web (REST APIs)
├── Spring Data JPA (Database access)
├── Spring Security (Authentication)
├── JWT (jsonwebtoken 0.11.5)
└── MySQL Connector (8.0.33)
```

### Database
```
MySQL 8.0+
├── InnoDB Engine
├── UTF-8 Character Set
├── Foreign Key Constraints
└── Indexes for performance
```

## Deployment Architecture (Production)

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │   (Nginx/ALB)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
       │   React     │ │  User   │ │  Product    │
       │   (CDN)     │ │ Service │ │  Service    │
       │   Static    │ │ (8081)  │ │  (8082)     │
       └─────────────┘ └────┬────┘ └──────┬──────┘
                             │              │
                    ┌────────┴──────────────┘
                    │
              ┌─────▼──────┐
              │  MySQL     │
              │  Primary   │
              └────┬───────┘
                   │
              ┌────▼───────┐
              │  MySQL     │
              │  Replica   │
              └────────────┘
```

## Database Schema Relationships

```
users (1) ──────────────────── (1) buyers
  │                              
  │                              
  │ (1) ──────────────────────── (1) suppliers
  │                                   │
  │                                   │
  │                                   │ (1)
  │                                   │
  │                                   ▼
  │                              products (N)
  │                                   │
  │                                   │
  │                                   │ (N)
  │                                   │
  │ (N)                               ▼
  │ ─────────────────────────► orders (N)
  │                                   │
  │                                   │
  │ (N)                               │ (N)
  │ ─────────────────────────► order_items (N)
  │
  │ (N)
  └─────────────────────────► cart_items (N)
                                      │
                                      │ (N)
                                      │
                                      ▼
                                  products (N)
```

## API Request/Response Examples

### Authentication
```http
POST /api/auth/login HTTP/1.1
Host: localhost:8081
Content-Type: application/json

{
  "email": "buyer1@example.com",
  "password": "password"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIi...",
  "type": "Bearer",
  "id": 1,
  "email": "buyer1@example.com",
  "fullName": "John Smith",
  "userType": "BUYER"
}
```

### Products
```http
GET /api/products?category=electronics&minPrice=10&maxPrice=100 HTTP/1.1
Host: localhost:8082
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "name": "Wireless Bluetooth Earbuds",
      "unitPrice": 12.50,
      "moq": 500,
      "supplier": {
        "id": 1,
        "companyName": "Shenzhen TechCorp"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

### Orders
```http
POST /api/orders HTTP/1.1
Host: localhost:8083
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 500,
      "unitPrice": 12.50
    }
  ],
  "shippingAddress": "123 Business Ave, New York, NY",
  "paymentMethod": "Bank Transfer"
}

Response: 201 Created
{
  "id": 1,
  "orderNumber": "ORD-2024-001",
  "status": "PENDING",
  "totalAmount": 6962.50
}
```

## File Structure

```
c:\b2b_sample\
│
├── database/                          # Database scripts
│   ├── schema.sql                    # Tables, indexes, constraints
│   └── sample_data.sql               # Test data
│
├── backend/                           # Spring Boot services
│   ├── pom.xml                       # Parent Maven config
│   ├── user-service/                 # Port 8081 ✅
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/...              # Java source code
│   │       └── resources/
│   │           └── application.properties
│   ├── product-service/              # Port 8082 (Structure)
│   ├── order-service/                # Port 8083 (TBD)
│   └── payment-service/              # Port 8084 (TBD)
│
├── src/                               # React frontend
│   ├── services/
│   │   └── api.js                    # API integration ✅
│   ├── context/
│   │   ├── AuthContext.jsx           # Auth state ✅
│   │   └── CartContext.jsx           # Cart state
│   ├── pages/                        # All pages
│   │   ├── auth/                     # Login, Register ✅
│   │   ├── buyer/                    # Buyer journey
│   │   └── supplier/                 # Supplier journey
│   └── components/                   # Reusable components
│
├── SETUP_GUIDE.md                    # This file
├── BACKEND_SETUP.md                  # Backend details
├── README.md                         # Project overview
└── package.json                      # NPM dependencies
```

---

**Quick Command Reference**:

```powershell
# Start MySQL
net start MySQL80

# Start Backend
cd backend/user-service
mvn spring-boot:run

# Start Frontend
npm run dev

# Test API
curl http://localhost:8081/api/auth/login -d "{\"email\":\"buyer1@example.com\",\"password\":\"password\"}" -H "Content-Type: application/json"
```
