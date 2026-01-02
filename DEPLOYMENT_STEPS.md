# B2B Marketplace - Cloud Deployment Guide

## 🎯 Deployment Stack (Free Tier - $0/month)

| Service | Purpose | URL |
|---------|---------|-----|
| **Vercel** | Frontend (React) | vercel.com |
| **Railway** | Backend (Spring Boot) | railway.app |
| **PlanetScale** | Database (MySQL) | planetscale.com |
| **Typesense** | Search Engine | cloud.typesense.org |

---

## Step 1: Deploy Frontend to Vercel

### 1.1 Create Vercel Account
1. Go to **https://vercel.com**
2. Click **"Sign Up"** → Sign up with GitHub
3. Authorize Vercel to access your GitHub

### 1.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find **b2b-marketplace** repository
3. Click **"Import"**

### 1.3 Configure Build Settings
```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 1.4 Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://your-railway-app.railway.app` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_xxxxxxxxxxxxx` |

### 1.5 Deploy
Click **"Deploy"** → Wait for build to complete

**Your frontend URL:** `https://your-project.vercel.app`

---

## Step 2: Create PlanetScale Database

### 2.1 Create Account
1. Go to **https://planetscale.com**
2. Sign up with GitHub
3. Create a new database: **b2b-marketplace**

### 2.2 Get Connection String
1. Click on your database
2. Go to **"Connect"** → **"Create password"**
3. Select **"Java"** as framework
4. Copy the connection details:

```properties
# Spring Boot format
spring.datasource.url=jdbc:mysql://aws.connect.psdb.cloud/b2b-marketplace?sslMode=VERIFY_IDENTITY
spring.datasource.username=your-username
spring.datasource.password=your-password
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

### 2.3 Initialize Database
1. Open **PlanetScale Console** (web-based SQL editor)
2. Run the schema from `database/schema.sql`

---

## Step 3: Deploy Backend to Railway

### 3.1 Create Railway Account
1. Go to **https://railway.app**
2. Sign up with GitHub
3. You get **$5/month free credit**

### 3.2 Create New Project
1. Click **"New Project"**
2. Choose **"Deploy from GitHub repo"**
3. Select **b2b-marketplace** repository

### 3.3 Deployment Options

You have **two deployment strategies**:

---

## Option A: Single Server Deployment (RECOMMENDED for Startups) ✅

Deploy all services as a **single monolithic application** on one Railway instance.

### Why Single Server?
| Aspect | Single Server | Separate Services |
|--------|---------------|-------------------|
| **Cost** | $5/month (1 instance) | $50+/month (10 instances) |
| **Complexity** | Simple | Complex |
| **Maintenance** | Easy | Harder |
| **Scaling** | Vertical | Horizontal |
| **Best For** | Startups, MVPs | Large enterprises |

### Setup Steps:
1. Click **"New"** → **"GitHub Repo"**
2. Select **b2b-marketplace** repository
3. Set **Root Directory**: `backend`
4. Railway will detect the parent `pom.xml` and build all modules

### Single Server Environment Variables:
```env
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://aws.connect.psdb.cloud/b2b-marketplace?sslMode=VERIFY_IDENTITY
SPRING_DATASOURCE_USERNAME=your-planetscale-username
SPRING_DATASOURCE_PASSWORD=your-planetscale-password

# Security
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long

# Payment
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Email
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password

# Search
TYPESENSE_HOST=xxx.a1.typesense.net
TYPESENSE_API_KEY=your-typesense-api-key

# Server (all services on different ports internally, exposed via one URL)
SERVER_PORT=8080
```

### How It Works:
- All 10 services run in the **same JVM process**
- Services communicate via **localhost** (faster)
- Single Railway URL handles all API requests
- Use **path-based routing** (e.g., `/api/users`, `/api/products`)

---

## Option B: Separate Services Deployment (Enterprise Scale)

Deploy **each microservice separately** for independent scaling. Create **10 services**:

#### Common Environment Variables (All Services)
```env
SPRING_DATASOURCE_URL=jdbc:mysql://aws.connect.psdb.cloud/b2b-marketplace?sslMode=VERIFY_IDENTITY
SPRING_DATASOURCE_USERNAME=your-planetscale-username
SPRING_DATASOURCE_PASSWORD=your-planetscale-password
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long
```

---

#### Service 1: User Service (Port 8080)
1. Click **"New"** → **"GitHub Repo"**
2. Select repository
3. Set **Root Directory**: `backend/user-service`
4. Add environment variables: Common + `SERVER_PORT=8080`

**Handles:** User registration, authentication, profiles, JWT tokens

---

#### Service 2: Product Service (Port 8081)
- **Root Directory**: `backend/product-service`
- **Environment**: Common + `SERVER_PORT=8081`

**Handles:** Product CRUD, categories, inventory, supplier products

---

#### Service 3: Order Service (Port 8082)
- **Root Directory**: `backend/order-service`
- **Environment**: Common + `SERVER_PORT=8082`

**Handles:** Orders, order items, disputes, refunds, invoices, buyer/supplier bank details

---

#### Service 4: Payment Service (Port 8083)
- **Root Directory**: `backend/payment-service`
- **Environment**: Common + additional:
```env
SERVER_PORT=8083
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

**Handles:** Payment processing, Razorpay integration, payment verification

---

#### Service 5: Cart Service (Port 8084)
- **Root Directory**: `backend/cart-service`
- **Environment**: Common + `SERVER_PORT=8084`

**Handles:** Shopping cart, cart items, cart persistence

---

#### Service 6: Notification Service (Port 8085)
- **Root Directory**: `backend/notification-service`
- **Environment**: Common + `SERVER_PORT=8085`

**Handles:** Push notifications, WebSocket real-time updates, notification preferences

---

#### Service 7: Messaging Service (Port 8086)
- **Root Directory**: `backend/messaging-service`
- **Environment**: Common + `SERVER_PORT=8086`

**Handles:** Buyer-supplier messaging, conversation threads, message history

---

#### Service 8: Email Service (Port 8087)
- **Root Directory**: `backend/email-service`
- **Environment**: Common + additional:
```env
SERVER_PORT=8087
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
```

**Handles:** Email notifications, order confirmations, password resets

---

#### Service 9: Search Service (Port 8088)
- **Root Directory**: `backend/search-service`
- **Environment**: Common + additional:
```env
SERVER_PORT=8088
TYPESENSE_HOST=xxx.a1.typesense.net
TYPESENSE_PORT=443
TYPESENSE_PROTOCOL=https
TYPESENSE_API_KEY=your-typesense-api-key
```

**Handles:** Product search, filters, autocomplete, search indexing

---

#### Service 10: Admin Service (Port 8089)
- **Root Directory**: `backend/admin-service`
- **Environment**: Common + `SERVER_PORT=8089`

**Handles:** Admin dashboard, analytics, user management, system monitoring

### 3.4 Set Up API Gateway (Optional)
Railway provides public URLs for each service. For production, consider:
- Using Railway's built-in networking
- Or setting up an API Gateway

---

## Step 4: Set Up Typesense Search

### 4.1 Create Typesense Cloud Account
1. Go to **https://cloud.typesense.org**
2. Sign up (free tier: 100K documents)
3. Create a new cluster

### 4.2 Get API Keys
After cluster creation, you'll get:
- **API Key** (for backend)
- **Search-only API Key** (for frontend)
- **Cluster URL** (e.g., `xxx.a1.typesense.net`)

### 4.3 Index Products
Create a script or use search service to index products:

```java
// In Search Service
@Value("${typesense.host}")
private String typesenseHost;

@Value("${typesense.api-key}")
private String typesenseApiKey;
```

---

## Step 5: Update Frontend Environment

After deploying backend, update Vercel environment variables:

```env
# Core API URL
VITE_API_BASE_URL=https://user-service-xxx.railway.app

# Individual Service URLs
VITE_USER_SERVICE_URL=https://user-service-xxx.railway.app
VITE_PRODUCT_SERVICE_URL=https://product-service-xxx.railway.app
VITE_ORDER_SERVICE_URL=https://order-service-xxx.railway.app
VITE_PAYMENT_SERVICE_URL=https://payment-service-xxx.railway.app
VITE_CART_SERVICE_URL=https://cart-service-xxx.railway.app
VITE_NOTIFICATION_SERVICE_URL=https://notification-service-xxx.railway.app
VITE_MESSAGING_SERVICE_URL=https://messaging-service-xxx.railway.app
VITE_SEARCH_SERVICE_URL=https://search-service-xxx.railway.app
VITE_ADMIN_SERVICE_URL=https://admin-service-xxx.railway.app

# Typesense Search
VITE_TYPESENSE_HOST=xxx.a1.typesense.net
VITE_TYPESENSE_PORT=443
VITE_TYPESENSE_PROTOCOL=https
VITE_TYPESENSE_API_KEY=your-search-only-key

# Payment Gateway
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

Redeploy frontend after updating variables.

---

## Step 6: Configure CORS for Production

Update each service's CORS configuration:

```java
@CrossOrigin(origins = {
    "https://your-project.vercel.app",
    "http://localhost:3000"
}, allowCredentials = "true")
```

---

## Quick Deployment Checklist

### Prerequisites
- [ ] GitHub account with repository pushed
- [ ] Vercel account created
- [ ] Railway account created
- [ ] PlanetScale account created
- [ ] Typesense Cloud account created
- [ ] Razorpay account (already have)

### Deployment Order
1. [ ] PlanetScale → Create database & run schema
2. [ ] Railway → Deploy all 10 backend services
3. [ ] Typesense → Create cluster & get API keys
4. [ ] Vercel → Deploy frontend with correct API URLs
5. [ ] Test → Verify all endpoints work

### Environment Variables Summary

#### Backend (All Services)
```env
SPRING_DATASOURCE_URL=jdbc:mysql://aws.connect.psdb.cloud/b2b-marketplace?sslMode=VERIFY_IDENTITY
SPRING_DATASOURCE_USERNAME=xxxxx
SPRING_DATASOURCE_PASSWORD=xxxxx
JWT_SECRET=your-256-bit-secret-key
```

#### Payment Service (Additional)
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

#### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://api.railway.app
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

---

## Estimated Deployment Time

### Option A: Single Server (Recommended)
| Step | Time |
|------|------|
| Create accounts | 15 min |
| PlanetScale setup | 10 min |
| Railway deployment (1 server) | 10 min |
| Typesense setup | 10 min |
| Vercel deployment | 5 min |
| Configuration & testing | 15 min |
| **Total** | **~1 hour** |

### Option B: Separate Services
| Step | Time |
|------|------|
| Create accounts | 15 min |
| PlanetScale setup | 10 min |
| Railway deployment (10 services) | 45 min |
| Typesense setup | 10 min |
| Vercel deployment | 5 min |
| Configuration & testing | 30 min |
| **Total** | **~2 hours** |

---

## Post-Deployment URLs

After deployment, you'll have:

| Service | Port | URL Example |
|---------|------|-------------|
| Frontend | - | `https://b2b-marketplace.vercel.app` |
| User Service | 8080 | `https://user-service-xxx.railway.app` |
| Product Service | 8081 | `https://product-service-xxx.railway.app` |
| Order Service | 8082 | `https://order-service-xxx.railway.app` |
| Payment Service | 8083 | `https://payment-service-xxx.railway.app` |
| Cart Service | 8084 | `https://cart-service-xxx.railway.app` |
| Notification Service | 8085 | `https://notification-service-xxx.railway.app` |
| Messaging Service | 8086 | `https://messaging-service-xxx.railway.app` |
| Email Service | 8087 | `https://email-service-xxx.railway.app` |
| Search Service | 8088 | `https://search-service-xxx.railway.app` |
| Admin Service | 8089 | `https://admin-service-xxx.railway.app` |
| Database | - | `aws.connect.psdb.cloud` (PlanetScale) |
| Typesense Search | - | `xxx.a1.typesense.net` |

---

## Need Help?

### Common Issues

1. **CORS errors** → Update @CrossOrigin with Vercel URL
2. **Database connection fails** → Check PlanetScale SSL settings
3. **Build fails on Railway** → Check Java version in Dockerfile
4. **Frontend can't reach backend** → Verify VITE_API_BASE_URL

### Support Links
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- PlanetScale Docs: https://planetscale.com/docs
- Typesense Docs: https://typesense.org/docs

---

*Created: January 2, 2026*
