# B2B Marketplace - Alibaba-Style E-commerce Platform

A comprehensive B2B e-commerce platform built with React.js and Vite, designed for connecting buyers and suppliers globally. This application provides a complete user journey for both buyers and suppliers with features similar to Alibaba.

## 🚀 Features

### For Buyers
- **Product Discovery**: Search and filter through millions of products
- **Detailed Product Pages**: View specifications, pricing, MOQ, supplier information
- **Supplier Profiles**: Explore verified suppliers with ratings and certifications
- **Shopping Cart**: Add products with flexible quantity management
- **Secure Checkout**: Multi-step checkout process with multiple payment options
- **Order Tracking**: Real-time order status updates and tracking

### For Suppliers
- **Supplier Dashboard**: Comprehensive analytics and statistics
- **Product Management**: Add, edit, and manage product listings
- **Order Management**: Process incoming orders and update status
- **Analytics**: Detailed insights into sales, revenue, and customer behavior
- **Profile Management**: Showcase company information and certifications

### General Features
- **User Authentication**: Separate login/registration for buyers and suppliers
- **Responsive Design**: Mobile-friendly interface
- **State Management**: Context API for cart and authentication
- **Modern UI**: Clean, professional design with smooth animations

## 📁 Project Structure

```
b2b_sample/
├── .github/
│   └── copilot-instructions.md
├── node_modules/
├── public/
├── src/
│   ├── components/           # Reusable components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── SearchBar.jsx
│   │   ├── CategoryCard.jsx
│   │   └── FilterPanel.jsx
│   │
│   ├── context/              # State management
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   │
│   ├── pages/
│   │   ├── buyer/           # Buyer journey pages
│   │   │   ├── Home.jsx
│   │   │   ├── ProductSearch.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── SupplierProfile.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── OrderTracking.jsx
│   │   │
│   │   ├── supplier/        # Supplier journey pages
│   │   │   ├── SupplierDashboard.jsx
│   │   │   ├── ProductManagement.jsx
│   │   │   ├── OrderManagement.jsx
│   │   │   └── Analytics.jsx
│   │   │
│   │   └── auth/            # Authentication pages
│   │       ├── Login.jsx
│   │       └── Register.jsx
│   │
│   ├── styles/              # CSS modules
│   │   ├── index.css
│   │   ├── Header.css
│   │   ├── Footer.css
│   │   ├── Home.css
│   │   ├── ProductCard.css
│   │   ├── SearchBar.css
│   │   ├── CategoryCard.css
│   │   ├── ProductSearch.css
│   │   ├── FilterPanel.css
│   │   ├── ProductDetails.css
│   │   ├── SupplierProfile.css
│   │   ├── Cart.css
│   │   ├── Checkout.css
│   │   ├── OrderTracking.css
│   │   ├── Auth.css
│   │   ├── SupplierDashboard.css
│   │   ├── ProductManagement.css
│   │   ├── OrderManagement.css
│   │   └── Analytics.css
│   │
│   ├── App.jsx              # Main application component
│   └── main.jsx             # Application entry point
│
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🛣️ User Journeys

### Buyer Journey

1. **Home Page** (`/`)
   - Hero section with search functionality
   - Featured products and categories
   - Platform statistics and features

2. **Product Search** (`/search`)
   - Advanced filtering (price, MOQ, location, rating)
   - Sort options (relevance, price, rating)
   - Pagination

3. **Product Details** (`/product/:id`)
   - Image gallery
   - Detailed specifications
   - Supplier information
   - Quantity selection with MOQ validation
   - Add to cart functionality
   - Product reviews

4. **Supplier Profile** (`/supplier/:id`)
   - Company information and statistics
   - Product catalog
   - Certifications
   - Contact information

5. **Shopping Cart** (`/cart`)
   - View all cart items
   - Update quantities
   - Remove items
   - Order summary

6. **Checkout** (`/checkout`)
   - 3-step process:
     - Shipping information
     - Payment method selection
     - Order review
   - Multiple payment options

7. **Order Tracking** (`/orders/:orderId`)
   - Real-time order status
   - Tracking timeline
   - Order details
   - Invoice download

### Supplier Journey

1. **Supplier Dashboard** (`/supplier/dashboard`)
   - Key performance metrics (orders, revenue, products)
   - Recent orders overview
   - Top-selling products
   - Quick actions

2. **Product Management** (`/supplier/products`)
   - View all products in table format
   - Add new products with detailed form
   - Edit existing products
   - Toggle product status
   - Delete products

3. **Order Management** (`/supplier/orders`)
   - Filter orders by status (pending, processing, shipped, delivered)
   - View order details
   - Update order status
   - Buyer information
   - Order tracking

4. **Analytics** (`/supplier/analytics`)
   - Revenue trends with charts
   - Sales performance metrics
   - Top products and customers
   - Category distribution
   - Growth insights

## 🔑 Key Features Implementation

### Authentication System
- Separate flows for buyers and suppliers
- Context-based state management
- LocalStorage persistence
- Protected routes

### Shopping Cart
- Add to cart with MOQ validation
- Quantity management
- Cart persistence
- Total calculation

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🎨 Design Highlights

- **Color Scheme**: 
  - Primary: Orange (#ff6b00)
  - Secondary: Blue (#0066cc)
  - Success: Green (#28a745)
  - Danger: Red (#dc3545)

- **Typography**: System fonts for optimal performance
- **Components**: Modular and reusable
- **Animations**: Smooth transitions and hover effects

## 🏗️ Backend Architecture

### Microservices (Java Spring Boot)
The platform uses a microservices architecture with the following services:

1. **User Service** (Port 8081)
   - User authentication and management
   - JWT token generation
   - Role-based access control

2. **Product Service** (Port 8082)
   - Product CRUD operations
   - Category management
   - Product catalog

3. **Order Service** (Port 8083)
   - Order processing
   - Order status tracking
   - Order history

4. **Payment Service** (Port 8084)
   - Payment processing
   - Transaction management
   - Payment gateway integration

5. **Cart Service** (Port 8085)
   - Shopping cart management
   - Cart persistence
   - Cart synchronization

6. **Search Service** (Port 8086)
   - Solr-powered search (replaced Elasticsearch)
   - Full-text search with fuzzy matching
   - Advanced filtering and relevance ranking
   - Automatic data synchronization

7. **Email Service** (Port 8087) ⭐ NEW
   - Email notification system
   - 6 professional HTML email templates
   - Gmail SMTP integration
   - Async email sending with logging
   - Order confirmations, status updates, registrations

### Database
- **MySQL 9.5.0** - Primary database
- **Elasticsearch 8.11.1** - Search engine for advanced product search

### 🔍 Elasticsearch Search Features
- **Full-text search** across product names, descriptions, tags, categories, and suppliers
- **Fuzzy matching** for typo tolerance (e.g., "laptp" finds "laptop")
- **Multi-field queries** with weighted relevance (name^3, description^2)
- **Advanced filters**: category, supplier, price range, MOQ, rating, origin, tags
- **Relevance scoring** and ranking
- **Pagination** with configurable page size
- **Auto-sync** from MySQL (on startup + hourly scheduled)
- **Performance**: < 50ms search latency

### Quick Start with Backend

#### Option 1: Start Complete System
```powershell
# Starts MySQL, Elasticsearch, all 6 microservices, and frontend
.\START_ALL_SERVICES.ps1
```

#### Option 2: Start Individual Services
```powershell
# Install and start Elasticsearch first
.\SETUP_ELASTICSEARCH.ps1

# Start individual microservices
.\START_USER_SERVICE.ps1      # Port 8081
.\START_PRODUCT_SERVICE.ps1   # Port 8082
.\START_ORDER_SERVICE.ps1     # Port 8083
.\START_PAYMENT_SERVICE.ps1   # Port 8084
.\START_CART_SERVICE.ps1      # Port 8085
.\START_SEARCH_SERVICE.ps1    # Port 8086
.\START_EMAIL_SERVICE.ps1     # Port 8087
```

#### Verify Services
```powershell
# Check Elasticsearch
Invoke-RestMethod http://localhost:9200

# Check Search Service
Invoke-RestMethod http://localhost:8086/api/search/health

# Test search
Invoke-RestMethod "http://localhost:8086/api/search?q=laptop"
```

### Documentation
- **EMAIL_SERVICE_DOCUMENTATION.md** - Complete email service guide (30+ pages) ⭐ NEW
- **ELASTICSEARCH_QUICK_START.md** - 5-minute quick start guide
- **ELASTICSEARCH_SEARCH_SERVICE.md** - Complete Elasticsearch documentation (30+ pages)
- **ELASTICSEARCH_IMPLEMENTATION_SUMMARY.md** - Implementation details
- **CART_SERVICE.md** - Cart service API documentation
- **SEARCH_IMPLEMENTATION.md** - Search functionality implementation
- **BACKEND_SETUP.md** - Backend setup instructions
- **SETUP_GUIDE.md** - Complete setup guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd b2b_sample
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📦 Dependencies

### Frontend Dependencies
- **react**: ^18.2.0 - UI library
- **react-dom**: ^18.2.0 - DOM rendering
- **react-router-dom**: ^6.20.0 - Routing
- **axios**: ^1.13.2 - HTTP client for API calls

### Frontend Dev Dependencies
- **vite**: ^7.2.6 - Build tool
- **@vitejs/plugin-react**: ^4.2.1 - React plugin for Vite
- **@types/react**: ^18.2.43 - TypeScript types
- **@types/react-dom**: ^18.2.17 - TypeScript types

### Backend Stack
- **Java**: 17
- **Spring Boot**: 3.2.0
- **Spring Cloud**: 2023.0.0
- **Spring Data JPA**: Database access
- **Spring Data Elasticsearch**: 5.2.0 - Search functionality
- **MySQL Connector**: 8.0.33
- **Elasticsearch Java Client**: 8.11.1
- **JWT (jjwt)**: 0.11.5 - Authentication
- **Lombok**: 1.18.30 - Code generation
- **Maven**: 3.8+ - Build tool

### External Services
- **MySQL**: 9.5.0 - Primary database
- **Elasticsearch**: 8.11.1 - Search engine

## 🗺️ Routes

### Public Routes
- `/` - Home page
- `/search` - Product search
- `/product/:id` - Product details
- `/supplier/:id` - Supplier profile
- `/login` - Login page
- `/register` - Registration page

### Buyer Routes
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/orders/:orderId` - Order tracking

### Supplier Routes (Protected)
- `/supplier/dashboard` - Supplier dashboard
- `/supplier/products` - Product management
- `/supplier/orders` - Order management
- `/supplier/analytics` - Analytics

## 🔄 State Management

### AuthContext
Manages user authentication state:
- `user` - Current user object
- `login(userData)` - Login function
- `logout()` - Logout function
- `isAuthenticated` - Boolean flag
- `isSupplier` - Check if user is supplier
- `isBuyer` - Check if user is buyer

### CartContext
Manages shopping cart state:
- `cart` - Array of cart items
- `addToCart(product)` - Add product to cart
- `removeFromCart(productId)` - Remove product
- `updateQuantity(productId, quantity)` - Update quantity
- `clearCart()` - Clear all items
- `getCartTotal()` - Calculate total price
- `getCartItemsCount()` - Get total item count

## 🎯 Sample Data

The application uses simulated data for demonstration purposes. In a production environment, these would be replaced with actual API calls:

- Product listings
- Supplier information
- Order data
- Analytics metrics

## 🔐 Security Considerations

For production deployment:
- Implement proper backend API
- Add JWT authentication
- Secure payment processing
- Input validation and sanitization
- HTTPS enforcement
- Rate limiting
- CORS configuration

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 968px
- Desktop: > 968px

## 🎨 Styling Approach

- **CSS Modules**: Component-scoped styling
- **Custom Properties**: CSS variables for theming
- **Flexbox & Grid**: Modern layout techniques
- **Transitions**: Smooth animations

## 🚧 Future Enhancements

- [ ] Real-time chat between buyers and suppliers
- [ ] Advanced search with AI recommendations
- [ ] Multi-language support
- [ ] Multi-currency support
- [ ] Bulk order management
- [ ] API integration
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Product comparison feature
- [ ] Wishlist functionality
- [ ] Reviews and ratings system
- [ ] Document upload for quotes
- [ ] Live order tracking with map
- [ ] Mobile app development

## 🤝 Contributing

This is a sample project for demonstration purposes. Feel free to fork and modify according to your needs.

## 📄 License

This project is open source and available for educational purposes.

## 👥 User Test Accounts

### Buyer Account
- Email: buyer@example.com
- Password: (any password for demo)
- Type: Buyer

### Supplier Account
- Email: supplier@example.com
- Password: (any password for demo)
- Type: Supplier

## 📞 Support

For questions or issues, please refer to the documentation or create an issue in the repository.

## 🙏 Acknowledgments

- Inspired by Alibaba.com
- Built with React.js and Vite
- Icons: Emoji-based for simplicity
- Color scheme: Professional B2B palette

---

**Note**: This is a demonstration project with simulated data. For production use, integrate with a proper backend API, implement security measures, and add payment processing capabilities.
