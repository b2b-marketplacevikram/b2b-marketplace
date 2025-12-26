# B2B Marketplace - Documentation Index

Complete guide to all documentation in this project. Start here for quick navigation.

---

## 📚 Getting Started

### Essential Reads
1. **[README.md](README.md)** - Project overview, features, and quick start
2. **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete step-by-step setup instructions
3. **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Backend architecture and API documentation
4. **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)** - Complete system inventory and status ⭐ NEW

---

## 🎯 Quick Start Guides

### 5-Minute Starts
- **[SOLR_QUICK_START.md](SOLR_QUICK_START.md)** - Get Solr running in 5 minutes (new)
  - Legacy: [ELASTICSEARCH_QUICK_START.md](ELASTICSEARCH_QUICK_START.md)
- **Email Service Setup** - See EMAIL_SERVICE_DOCUMENTATION.md > Gmail Setup section

### Complete Guides
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Full platform setup (database, backend, frontend)
- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Backend services configuration

---

## 🔧 Service Documentation

### Microservices (7 Total)

#### 1. User Service (Port 8081)
- **Files**: `backend/user-service/`
- **Documentation**: See BACKEND_SETUP.md > User Service section
- **APIs**: Authentication, User Management, JWT
- **Startup Script**: `START_USER_SERVICE.ps1` ⭐ NEW

#### 2. Product Service (Port 8082)
- **Files**: `backend/product-service/`
- **Documentation**: [PRODUCT_SERVICE_GUIDE.md](PRODUCT_SERVICE_GUIDE.md)
- **APIs**: Product CRUD, Categories, Search
- **Startup Script**: `START_PRODUCT_SERVICE.ps1`

#### 3. Order Service (Port 8083)
- **Files**: `backend/order-service/`
- **Documentation**: See BACKEND_SETUP.md > Order Service section
- **APIs**: Order Processing, Status Tracking
- **Startup Script**: `START_ORDER_SERVICE.ps1` ⭐ NEW

#### 4. Payment Service (Port 8084)
- **Files**: `backend/payment-service/`
- **Documentation**: See BACKEND_SETUP.md > Payment Service section
- **APIs**: Payment Processing, Transactions
- **Startup Script**: `START_PAYMENT_SERVICE.ps1` ⭐ NEW

#### 5. Cart Service (Port 8085)
- **Files**: `backend/cart-service/`
- **Documentation**: [CART_SERVICE.md](CART_SERVICE.md)
- **Implementation**: [CART_IMPLEMENTATION_SUMMARY.md](CART_IMPLEMENTATION_SUMMARY.md)
- **APIs**: Cart Management, Item Operations
- **Startup Script**: `START_CART_SERVICE.ps1`

#### 6. Search Service (Port 8086)
- **Files**: `backend/search-service/`
- **Complete Guide**: (migrated to Solr) see `SOLR_QUICK_START.md` and `ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md` (legacy details)
- **Quick Start**: [SOLR_QUICK_START.md](SOLR_QUICK_START.md) (5 minutes)
- **Implementation**: [ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md](ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md) (legacy - implementation notes)
- **APIs**: Search endpoints (now backed by Solr) - see service API docs in `backend/search-service` sources
- **Startup Script**: `START_SEARCH_SERVICE.ps1`
- **Setup Script**: `SETUP_SOLR.ps1`

#### 7. Email Service (Port 8087) ⭐ NEW
- **Files**: `backend/email-service/`
- **Complete Guide**: [EMAIL_SERVICE_DOCUMENTATION.md](EMAIL_SERVICE_DOCUMENTATION.md) (30+ pages)
- **APIs**: Send Emails, Templates, Logging
- **Templates**: 6 HTML templates (registration, order confirmation, etc.)
- **Startup Script**: `START_EMAIL_SERVICE.ps1`
- **Features**:
  - Professional HTML email templates
  - Gmail SMTP integration
  - Async sending with logging
  - Email statistics dashboard

---

## 🚀 Startup Scripts

### Complete System
- **[START_ALL_SERVICES.ps1](START_ALL_SERVICES.ps1)** - Start all 7 microservices + dependencies

### Individual Services
- **[START_USER_SERVICE.ps1](START_USER_SERVICE.ps1)** - User Service (8081) ⭐ NEW
- **[START_PRODUCT_SERVICE.ps1](START_PRODUCT_SERVICE.ps1)** - Product Service (8082)
- **[START_ORDER_SERVICE.ps1](START_ORDER_SERVICE.ps1)** - Order Service (8083) ⭐ NEW
- **[START_PAYMENT_SERVICE.ps1](START_PAYMENT_SERVICE.ps1)** - Payment Service (8084) ⭐ NEW
- **[START_CART_SERVICE.ps1](START_CART_SERVICE.ps1)** - Cart Service (8085)
- **[START_SEARCH_SERVICE.ps1](START_SEARCH_SERVICE.ps1)** - Search Service (8086)
- **[START_EMAIL_SERVICE.ps1](START_EMAIL_SERVICE.ps1)** - Email Service (8087) ⭐ NEW

### Setup & Installation
- **[SETUP_SOLR.ps1](SETUP_SOLR.ps1)** - Install and configure Solr (new)
  - Legacy: [SETUP_ELASTICSEARCH.ps1](SETUP_ELASTICSEARCH.ps1)

---

## 📊 Architecture & Design

### System Architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete architecture overview
- **[SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md)** - Service inventory and status ⭐ NEW
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project summary

### Technical Specifications
- **Database**: MySQL 9.5.0 (16 tables) + Solr (replaced Elasticsearch)
- **Backend**: Java 17, Spring Boot 3.2.0, Maven
- **Frontend**: React 18.2.0, Vite 7.2.6
- **Authentication**: JWT with BCrypt

---

## 🎨 Frontend Documentation

### Integration Guides
- **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Frontend-backend integration
- **[SEARCH_IMPLEMENTATION.md](SEARCH_IMPLEMENTATION.md)** - Search functionality

### API Client
- **File**: `src/services/api.js`
- **Services**: User, Product, Order, Payment, Cart, Search, Email APIs
- **Documentation**: See BACKEND_SETUP.md > Frontend Integration

---

## 📈 Implementation Summaries

### Service Implementations
- **[CART_IMPLEMENTATION_SUMMARY.md](CART_IMPLEMENTATION_SUMMARY.md)** - Cart Service
- **[ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md](ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md)** - Search Service
- **[EMAIL_SERVICE_DOCUMENTATION.md](EMAIL_SERVICE_DOCUMENTATION.md)** - Email Service (includes implementation)

### Deployment Status
- **[STARTUP_STATUS.md](STARTUP_STATUS.md)** - System startup status
- **[DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md)** - Deployment completion

---

## 🗄️ Database Documentation

### Schema & Data
- **Files**: `database/schema.sql`, `database/sample_data.sql`
- **Tables**: 16 tables (users, products, orders, cart_items, email_logs, etc.)
- **Sample Data**: 7 users, 10 products, 5 orders
- **Documentation**: See BACKEND_SETUP.md > Database Setup

### Entity Details
- **User Entities**: Users, Buyers, Suppliers
- **Product Entities**: Products, Categories
- **Order Entities**: Orders, Order Items
- **Cart Entities**: Cart Items
- **Email Entities**: Email Logs ⭐ NEW
- **Payment Entities**: Payments

---

## 🔍 Search & Filter Features

### Elasticsearch Documentation
- **[ELASTICSEARCH_SEARCH_SERVICE.md](ELASTICSEARCH_SEARCH_SERVICE.md)** - Complete guide (30+ pages)
  - Architecture and components
  - API endpoint reference (8 endpoints)
  - Query examples and filters
  - Performance optimization
  - Troubleshooting guide

- **[ELASTICSEARCH_QUICK_START.md](ELASTICSEARCH_QUICK_START.md)** - 5-minute setup
  - Installation steps
  - Configuration
  - First search query
  - Health checks

- **[ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md](ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md)**
  - Implementation timeline
  - Files created (15+ files)
  - Features implemented
  - Testing guide

### Search Features
- Full-text search with fuzzy matching
- Multi-field queries (name, description, tags)
- Advanced filters (category, price, rating, MOQ)
- Relevance scoring and ranking
- Automatic MySQL synchronization

---

## 📧 Email Service Documentation

### Complete Guide
- **[EMAIL_SERVICE_DOCUMENTATION.md](EMAIL_SERVICE_DOCUMENTATION.md)** - 30+ page guide
  - **Overview**: Features and architecture
  - **Email Templates**: 6 professional HTML templates
    1. Registration welcome email
    2. Order confirmation
    3. Order status updates
    4. Password reset
    5. Supplier order notification
    6. Generic template
  - **API Reference**: 12 REST endpoints
    - Send email, registration, order confirmation, status updates, etc.
    - Email logs, statistics, health check
  - **Gmail SMTP Setup**: Step-by-step with App Password
  - **Configuration**: Environment variables, SMTP settings
  - **Database Schema**: email_logs table structure
  - **Testing**: PowerShell and frontend examples
  - **Frontend Integration**: Complete API client guide
  - **Troubleshooting**: Authentication, spam, templates, performance
  - **Best Practices**: Async sending, logging, graceful failures
  - **Production**: SMTP services, rate limiting, monitoring

### Quick Reference
- **Port**: 8087
- **Templates Location**: `backend/email-service/src/main/resources/templates/`
- **Database Table**: `email_logs`
- **API Base**: `http://localhost:8087/api`

---

## 🛠️ Troubleshooting

### Common Issues
- See BACKEND_SETUP.md > Troubleshooting
- See ELASTICSEARCH_SEARCH_SERVICE.md > Troubleshooting
- See EMAIL_SERVICE_DOCUMENTATION.md > Troubleshooting
- See SETUP_GUIDE.md > Troubleshooting

### Port Conflicts
- User Service: 8081
- Product Service: 8082
- Order Service: 8083
- Payment Service: 8084
- Cart Service: 8085
- Search Service: 8086
- Email Service: 8087
- MySQL: 3306
- Elasticsearch: 9200
- Frontend: 3000

### Health Checks
```powershell
# Check all services
Invoke-RestMethod http://localhost:8081/actuator/health
Invoke-RestMethod http://localhost:8082/actuator/health
Invoke-RestMethod http://localhost:8083/actuator/health
Invoke-RestMethod http://localhost:8084/actuator/health
Invoke-RestMethod http://localhost:8085/actuator/health
Invoke-RestMethod http://localhost:8086/api/search/health
Invoke-RestMethod http://localhost:8087/api/email/health

# Check Elasticsearch
Invoke-RestMethod http://localhost:9200
```

---

## 📁 File Organization

### Root Directory
```
c:\b2b_sample\
├── README.md                           # Project overview
├── DOCUMENTATION_INDEX.md              # This file ⭐ NEW
├── SYSTEM_OVERVIEW.md                  # System status ⭐ NEW
├── SETUP_GUIDE.md                      # Complete setup
├── BACKEND_SETUP.md                    # Backend setup
├── ARCHITECTURE.md                     # Architecture
├── PROJECT_SUMMARY.md                  # Project summary
│
├── START_ALL_SERVICES.ps1              # Start all services
├── START_USER_SERVICE.ps1              # User Service ⭐ NEW
├── START_PRODUCT_SERVICE.ps1           # Product Service
├── START_ORDER_SERVICE.ps1             # Order Service ⭐ NEW
├── START_PAYMENT_SERVICE.ps1           # Payment Service ⭐ NEW
├── START_CART_SERVICE.ps1              # Cart Service
├── START_SEARCH_SERVICE.ps1            # Search Service
├── START_EMAIL_SERVICE.ps1             # Email Service ⭐ NEW
├── SETUP_ELASTICSEARCH.ps1             # Elasticsearch setup
│
├── backend/                            # 7 microservices
├── database/                           # SQL scripts
├── src/                                # React frontend
└── .github/                            # GitHub config
```

### Documentation Files by Category

**Getting Started** (3 files):
- README.md
- SETUP_GUIDE.md
- BACKEND_SETUP.md

**Architecture** (3 files):
- ARCHITECTURE.md
- SYSTEM_OVERVIEW.md ⭐ NEW
- PROJECT_SUMMARY.md

**Service Guides** (7 files):
- EMAIL_SERVICE_DOCUMENTATION.md ⭐ NEW
- ELASTICSEARCH_SEARCH_SERVICE.md
- ELASTICSEARCH_QUICK_START.md
- PRODUCT_SERVICE_GUIDE.md
- CART_SERVICE.md
- Frontend integration guides

**Implementation** (4 files):
- CART_IMPLEMENTATION_SUMMARY.md
- ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md
- SEARCH_IMPLEMENTATION.md
- FRONTEND_INTEGRATION.md

**Status & Deployment** (2 files):
- STARTUP_STATUS.md
- DEPLOYMENT_COMPLETE.md

---

## 🎯 Common Workflows

### 1. First Time Setup
1. Read [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Setup MySQL database
3. Install Elasticsearch with [SETUP_ELASTICSEARCH.ps1](SETUP_ELASTICSEARCH.ps1)
4. Configure Email Service (see EMAIL_SERVICE_DOCUMENTATION.md)
5. Build all services with Maven
6. Run [START_ALL_SERVICES.ps1](START_ALL_SERVICES.ps1)

### 2. Development on Single Service
1. Read specific service guide (e.g., CART_SERVICE.md)
2. Start just that service (e.g., START_CART_SERVICE.ps1)
3. Test with Postman or frontend
4. Check logs and health endpoint

### 3. Debugging Issues
1. Check [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) for status
2. Review service-specific documentation
3. Check troubleshooting sections
4. Verify health endpoints

### 4. Adding Email Notifications
1. Read [EMAIL_SERVICE_DOCUMENTATION.md](EMAIL_SERVICE_DOCUMENTATION.md)
2. Configure Gmail SMTP (App Password)
3. Use email templates or create custom ones
4. Call emailAPI from frontend (see api.js)

### 5. Implementing Search
1. Setup Elasticsearch: [ELASTICSEARCH_QUICK_START.md](ELASTICSEARCH_QUICK_START.md)
2. Start Search Service
3. Sync data from MySQL
4. Use searchAPI in frontend

---

## 📝 Quick Reference

### Service Ports
| Service | Port | Health Endpoint |
|---------|------|----------------|
| User Service | 8081 | http://localhost:8081/actuator/health |
| Product Service | 8082 | http://localhost:8082/actuator/health |
| Order Service | 8083 | http://localhost:8083/actuator/health |
| Payment Service | 8084 | http://localhost:8084/actuator/health |
| Cart Service | 8085 | http://localhost:8085/actuator/health |
| Search Service | 8086 | http://localhost:8086/api/search/health |
| Email Service | 8087 | http://localhost:8087/api/email/health |
| MySQL | 3306 | - |
| Elasticsearch | 9200 | http://localhost:9200 |
| Frontend | 3000 | http://localhost:3000 |

### Startup Scripts
```powershell
# All services
.\START_ALL_SERVICES.ps1

# Individual services
.\START_USER_SERVICE.ps1      # ⭐ NEW
.\START_PRODUCT_SERVICE.ps1
.\START_ORDER_SERVICE.ps1     # ⭐ NEW
.\START_PAYMENT_SERVICE.ps1   # ⭐ NEW
.\START_CART_SERVICE.ps1
.\START_SEARCH_SERVICE.ps1
.\START_EMAIL_SERVICE.ps1     # ⭐ NEW

# Setup
.\SETUP_ELASTICSEARCH.ps1
```

### Frontend Dev Server
```bash
npm run dev           # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🆕 Recent Updates

### Latest Additions (⭐ NEW)
1. **Email Service** - Complete email notification system
   - 6 professional HTML templates
   - Gmail SMTP integration
   - Async sending with logging
   - EMAIL_SERVICE_DOCUMENTATION.md (30+ pages)

2. **Individual Startup Scripts**
   - START_USER_SERVICE.ps1
   - START_ORDER_SERVICE.ps1
   - START_PAYMENT_SERVICE.ps1

3. **Documentation Index**
   - This file (DOCUMENTATION_INDEX.md)
   - Complete navigation guide

4. **System Overview**
   - SYSTEM_OVERVIEW.md
   - Service inventory and status

---

## 💡 Tips for Documentation Users

### For New Developers
Start with:
1. README.md (overview)
2. SETUP_GUIDE.md (setup)
3. SYSTEM_OVERVIEW.md (what's running)
4. Service-specific guides as needed

### For Service Development
1. Read service-specific documentation
2. Check implementation summary
3. Review API endpoints in BACKEND_SETUP.md
4. Use individual startup scripts for testing

### For Frontend Development
1. FRONTEND_INTEGRATION.md
2. src/services/api.js file
3. Service-specific API documentation
4. Health check all backend services first

### For Troubleshooting
1. Check SYSTEM_OVERVIEW.md
2. Review service logs
3. Check troubleshooting sections in guides
4. Verify health endpoints

---

## 🔗 External Resources

### Spring Boot
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Security](https://spring.io/projects/spring-security)

### Elasticsearch
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Spring Data Elasticsearch](https://spring.io/projects/spring-data-elasticsearch)

### React & Vite
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)

### Database
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JPA/Hibernate](https://hibernate.org/orm/documentation/)

### Email
- [Spring Mail Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#mail)
- [Thymeleaf Documentation](https://www.thymeleaf.org/documentation.html)
- [Gmail SMTP Setup](https://support.google.com/mail/answer/7126229)

---

## 📞 Need Help?

If you can't find what you're looking for:

1. **Check this index** - Navigate to the relevant document
2. **Search in files** - Use VS Code search (Ctrl+Shift+F)
3. **Check README.md** - Often has quick answers
4. **Review SYSTEM_OVERVIEW.md** - See what's running
5. **Check service logs** - Look for errors in terminal windows

---

**Last Updated**: After Email Service implementation and documentation reorganization

**Total Documentation Files**: 20+ comprehensive guides

**Total Services**: 7 microservices + MySQL + Elasticsearch + Frontend

**Status**: ✅ All services implemented and documented
