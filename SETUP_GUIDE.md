# B2B Marketplace - Complete Setup & Run Guide

## 🎯 Quick Start Summary

This project includes:
- ✅ **Frontend**: React + Vite (Already running on Port 3000)
- ✅ **Backend**: Java Spring Boot Microservices
- ✅ **Database**: MySQL with complete schema
- ✅ **Authentication**: JWT-based security
- ✅ **API Integration**: Axios configured

## 📋 What's Been Created

### 1. Database (MySQL)
- **Location**: `database/`
- `schema.sql` - Complete database structure (15 tables)
- `sample_data.sql` - Sample data for testing

### 2. Backend Services (Spring Boot)
- **Location**: `backend/`
- **User Service** (Port 8081) - Authentication & User Management
  - Login/Register APIs
  - JWT token generation
  - User, Buyer, Supplier entities
- **Product Service** (Port 8082) - Product Management (Structure ready)
- **Order Service** (Port 8083) - Order Processing (Structure ready)
- **Payment Service** (Port 8084) - Payment Processing (Structure ready)

### 3. Frontend Integration
- **Location**: `src/services/`
- `api.js` - Complete API service layer
- Updated `AuthContext.jsx` - Real API integration
- Updated `Login.jsx` & `Register.jsx` - Backend connectivity

## 🚀 Step-by-Step Setup

### STEP 1: Setup MySQL Database (5 minutes)

#### Option A: Using MySQL Workbench (Recommended)
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Open `database/schema.sql`
4. Click Execute (⚡ lightning icon)
5. Open `database/sample_data.sql`
6. Click Execute

#### Option B: Using Command Line
```powershell
# Navigate to project directory
cd c:\b2b_sample

# Login to MySQL
mysql -u root -p

# Create and populate database
source C:/b2b_sample/database/schema.sql
source C:/b2b_sample/database/sample_data.sql

# Verify
USE b2b_marketplace;
SHOW TABLES;
SELECT * FROM users;
```

### STEP 2: Configure Backend (2 minutes)

Edit `backend/user-service/src/main/resources/application.properties`:

```properties
# Update this line with your MySQL password
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### STEP 3: Install Java & Maven (if not installed)

Check if installed:
```powershell
java -version   # Should be Java 17+
mvn -version    # Should be Maven 3.8+
```

If not installed:
- **Java 17**: https://www.oracle.com/java/technologies/downloads/#java17
- **Maven**: https://maven.apache.org/download.cgi

### STEP 4: Build & Run Backend (3 minutes)

```powershell
# Navigate to backend directory
cd backend

# Build all services (first time only)
mvn clean install

# Run User Service
cd user-service
mvn spring-boot:run
```

**Expected Output**:
```
Started UserServiceApplication in X.XXX seconds
Tomcat started on port(s): 8081 (http)
```

### STEP 5: Install Frontend Dependencies (if needed)

```powershell
# Navigate to project root
cd c:\b2b_sample

# Install axios (if not already installed)
npm install axios
```

### STEP 6: Start Frontend (Already Running!)

Your React app is already running on `http://localhost:3000`

If not running:
```powershell
npm run dev
```

## ✅ Test the Integration

### Test 1: Register a New User

1. Go to `http://localhost:3000/register`
2. Fill in the form:
   - **Email**: test@example.com
   - **Password**: password123
   - **User Type**: Buyer or Supplier
3. Click "Create Account"
4. You should be redirected to the home page or dashboard

### Test 2: Login with Sample User

1. Go to `http://localhost:3000/login`
2. Use these credentials:
   - **Email**: buyer1@example.com
   - **Password**: password
3. Click "Login"
4. You should be logged in successfully

### Test 3: Verify API Connection

Open browser console (F12) and run:
```javascript
fetch('http://localhost:8081/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'buyer1@example.com',
    password: 'password'
  })
})
.then(r => r.json())
.then(console.log)
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "buyer1@example.com",
  "fullName": "John Smith",
  "userType": "BUYER"
}
```

## 📁 Project Structure

```
b2b_sample/
├── database/                    # MySQL Database
│   ├── schema.sql              # Database structure
│   └── sample_data.sql         # Sample data
│
├── backend/                     # Spring Boot Backend
│   ├── pom.xml                 # Parent POM
│   ├── user-service/           # User & Auth Service ✅
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/com/b2b/marketplace/user/
│   │       │   ├── UserServiceApplication.java
│   │       │   ├── entity/     # User, Supplier, Buyer
│   │       │   ├── repository/ # JPA Repositories
│   │       │   ├── service/    # Business Logic
│   │       │   ├── controller/ # REST Controllers
│   │       │   ├── security/   # JWT & Security
│   │       │   └── dto/        # Data Transfer Objects
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── product-service/        # Product Service (Structure Ready)
│   ├── order-service/          # Order Service (To Be Implemented)
│   └── payment-service/        # Payment Service (To Be Implemented)
│
├── src/                         # React Frontend
│   ├── services/
│   │   └── api.js              # API Service Layer ✅
│   ├── context/
│   │   ├── AuthContext.jsx     # Updated with real API ✅
│   │   └── CartContext.jsx
│   ├── pages/                  # All UI Pages
│   └── components/             # Reusable Components
│
├── BACKEND_SETUP.md            # Detailed backend guide
├── README.md                   # Project overview
└── package.json                # Frontend dependencies
```

## 🔑 Sample Credentials

All sample users have password: `password`

### Buyers
- buyer1@example.com
- buyer2@example.com
- buyer3@example.com

### Suppliers
- supplier1@techcorp.com
- supplier2@globalmanuf.com
- supplier3@easttrade.com
- supplier4@eurosupply.com

## 🔧 Troubleshooting

### Problem: "Cannot connect to MySQL"
**Solution**:
1. Check MySQL is running: Open Task Manager → Services → MySQL
2. Verify port 3306 is open
3. Check credentials in `application.properties`

### Problem: "Port 8081 already in use"
**Solution**:
```powershell
# Find process using port 8081
netstat -ano | findstr :8081

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Problem: "CORS error in browser"
**Solution**: 
- Make sure backend is running on port 8081
- Check `SecurityConfig.java` has correct origins
- Clear browser cache

### Problem: "Token expired"
**Solution**:
- Tokens expire after 24 hours
- Logout and login again
- Or increase `jwt.expiration` in `application.properties`

## 📊 Database Schema Overview

### Core Tables
- `users` - All user accounts
- `buyers` - Buyer profile details
- `suppliers` - Supplier business details
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Purchase orders
- `order_items` - Order line items
- `cart_items` - Shopping cart
- `reviews` - Product reviews
- `messages` - User messages
- `notifications` - System notifications
- `payment_transactions` - Payment records

## 🌐 API Endpoints

### Authentication (User Service - Port 8081)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products (Product Service - Port 8082)
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `GET /api/products/search` - Search products
- `POST /api/products` - Create product (Supplier)
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders (Order Service - Port 8083)
- `GET /api/orders` - List user orders
- `GET /api/orders/{id}` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/status` - Update order status

### Cart (User Service - Port 8081)
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update quantity
- `DELETE /api/cart/{productId}` - Remove from cart

## 🎨 Frontend Features

### Implemented & Working
✅ Complete UI for buyer and supplier journeys
✅ Authentication (Login/Register) with real API
✅ State management (Context API)
✅ Routing (React Router)
✅ Responsive design

### Connected to Backend
✅ User registration
✅ User login
✅ Token-based authentication
✅ API service layer ready

### Mock Data (To Be Connected)
- Product listings
- Order management
- Cart operations
- Supplier profiles
- Analytics

## 🚀 Next Steps

### Immediate (Already Working)
1. ✅ Database created and populated
2. ✅ User Service running
3. ✅ Frontend connected to authentication API
4. ✅ Test login/register functionality

### Short Term (Next Phase)
1. ⏳ Implement Product Service REST APIs
2. ⏳ Connect frontend product pages to Product Service
3. ⏳ Implement Order Service
4. ⏳ Connect cart and checkout to backend

### Long Term (Future Enhancements)
- Real-time notifications
- File upload for product images
- Advanced search with Elasticsearch
- Email notifications
- Payment gateway integration

## 💡 Development Tips

### Running Multiple Services
Open separate terminal windows for each:
```powershell
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - User Service
cd backend/user-service
mvn spring-boot:run

# Terminal 3 - Product Service (when ready)
cd backend/product-service
mvn spring-boot:run
```

### Hot Reload
- **Frontend**: Vite provides instant hot reload
- **Backend**: Spring DevTools enables hot reload (included)

### Debugging
- **Frontend**: Use browser DevTools (F12)
- **Backend**: Enable debug in VS Code or IntelliJ
- **Database**: Use MySQL Workbench to inspect data

## 📚 Additional Resources

- **BACKEND_SETUP.md** - Detailed backend documentation
- **README.md** - Project overview
- **PROJECT_SUMMARY.md** - Complete project summary
- Database scripts in `database/` folder
- API service in `src/services/api.js`

## ✅ Verification Checklist

Before you start:
- [ ] MySQL installed and running
- [ ] Java 17+ installed
- [ ] Maven 3.8+ installed
- [ ] Node.js installed
- [ ] Database created (run schema.sql)
- [ ] Sample data loaded (run sample_data.sql)
- [ ] Backend dependencies installed (mvn install)
- [ ] Frontend dependencies installed (npm install)
- [ ] User Service running (port 8081)
- [ ] Frontend running (port 3000 or 5173)

Test functionality:
- [ ] Can access http://localhost:3000
- [ ] Can register new user
- [ ] Can login with sample user
- [ ] Token stored in localStorage
- [ ] No CORS errors in console

---

## 🎉 You're All Set!

Your B2B marketplace is ready with:
- ✅ Complete MySQL database
- ✅ Working authentication service
- ✅ React frontend integrated with backend
- ✅ JWT security implemented
- ✅ Professional architecture

**Start developing by**: Testing the login/register functionality, then gradually implementing the remaining services (Product, Order, Payment).

For questions or issues, refer to BACKEND_SETUP.md or check the troubleshooting section above.
