# 🚀 Cloud Deployment - Iteration 1 (Day 1)

## Today's Goal
Deploy the **core MVP** to cloud and test it works end-to-end.

## What We'll Deploy Today

```
┌─────────────────────────────────────────────────────────────┐
│                   ITERATION 1 - TODAY (COMPLETE)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ✅ Database:  PlanetScale (MySQL)                         │
│   ✅ Backend:   Railway (ALL 10 Services)                   │
│       1. User Service (8081)                                │
│       2. Product Service (8082)                             │
│       3. Order Service (8083)                               │
│       4. Payment Service (8084)                             │
│       5. Cart Service (8085)                                │
│       6. Notification Service (8086)                        │
│       7. Email Service (8087)                               │
│       8. Admin Service (8088)                               │
│       9. Search Service (8090)                              │
│       10. Messaging Service (8091)                          │
│   ✅ Frontend:  Vercel (React)                              │
│                                                              │
│   Cost: $0 (Railway $5 credit may be consumed)              │
│   Time: 4-6 hours                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] GitHub account
- [ ] Credit/Debit card (for Railway after $5 credit - optional for today)
- [ ] Your code pushed to GitHub repository
- [ ] **4-6 hours of focused time** (deploying all 10 services)
- [ ] Good internet connection
- [ ] All 10 backend services working locally

---

## Part 1: Database Setup (PlanetScale) - 30 minutes

### Step 1.1: Create PlanetScale Account

1. **Visit**: https://planetscale.com
2. **Sign up** with GitHub (easiest)
3. **Verify email**
4. **Skip** team creation (for now)

### Step 1.2: Create Database

1. **Click** "Create database"
2. **Name**: `b2b-marketplace` (or your choice)
3. **Region**: Choose **AWS Mumbai (ap-south-1)** ⭐ (Closest to India)
4. **Plan**: Select **Hobby (Free)** - 5GB storage
5. **Click** "Create database"

Wait 2-3 minutes for database to initialize.

### Step 1.3: Get Connection Credentials

1. **Click** your database name
2. **Click** "Connect" button
3. **Select** "Java/Spring Boot"
4. **Framework**: Select "Spring Boot 3.x"
5. **Copy** the connection string - looks like:

```properties
spring.datasource.url=jdbc:mysql://aws.connect.psdb.cloud/b2b-marketplace?sslMode=VERIFY_IDENTITY
spring.datasource.username=xxxxxxxxx
spring.datasource.password=pscale_pw_xxxxxxxxx
```

**IMPORTANT**: Save these credentials securely! You'll need them in next steps.

### Step 1.4: Create Database Schema

**Option A: Using PlanetScale Console (Easiest)**

1. In PlanetScale dashboard, click "Console"
2. Run your schema creation SQL:

```sql
-- Copy the content from your FIX_ALL_SCHEMA_MISMATCHES.sql
-- Or run table creation scripts one by one
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  -- ... rest of your schema
);
```

**Option B: Using Local Connection**

```powershell
# Install PlanetScale CLI (Optional)
# Or use MySQL Workbench to connect

# Connection details from Step 1.3
```

**For today, we'll use the web console to keep it simple.**

### Step 1.5: Upload Your Schema

1. **Open** your local file: `FIX_ALL_SCHEMA_MISMATCHES.sql`
2. **Copy** the entire content
3. **Paste** into PlanetScale Console
4. **Execute** (may take 2-3 minutes)
5. **Verify**: Click "Branches" → "main" → "Schema" to see your tables

✅ **Checkpoint**: You should see all your tables listed!

---

## Part 2: Backend Deployment (Railway) - 3-4 hours

We'll deploy **ALL 10 services today**:
1. User Service (login/auth) - Port 8081
2. Product Service (products) - Port 8082
3. Order Service (orders/disputes) - Port 8083
4. Payment Service (payments) - Port 8084
5. Cart Service (shopping cart) - Port 8085
6. Notification Service (notifications) - Port 8086
7. Email Service (emails) - Port 8087
8. Admin Service (admin panel) - Port 8088
9. Search Service (advanced search) - Port 8090
10. Messaging Service (buyer-supplier chat) - Port 8091

### Step 2.1: Create Railway Account

1. **Visit**: https://railway.app
2. **Sign in** with GitHub
3. **Accept** permissions
4. **You get**: $5 free credit (no card needed initially)

### Step 2.2: Deploy User Service

#### 2.2.1: Create New Project

1. **Click** "New Project"
2. **Select** "Deploy from GitHub repo"
3. **Authorize** Railway to access your GitHub
4. **Select** your repository: `b2b-marketplace`

#### 2.2.2: Configure User Service

1. **Service Name**: Change to `user-service`
2. **Root Directory**: Set to `backend/user-service`
3. **Build Command**: Railway auto-detects Maven

#### 2.2.3: Set Environment Variables

Click "Variables" tab and add:

```env
# Database (from PlanetScale Step 1.3)
SPRING_DATASOURCE_URL=jdbc:mysql://aws.connect.psdb.cloud/b2b-marketplace?sslMode=VERIFY_IDENTITY
SPRING_DATASOURCE_USERNAME=your_planetscale_username
SPRING_DATASOURCE_PASSWORD=pscale_pw_xxxxx

# JPA Settings
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_SHOW_SQL=false

# Server
SERVER_PORT=8080

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-256-bits

# CORS (we'll add Vercel URL later)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Generate JWT Secret** (in PowerShell):
```powershell
# Generate random 256-bit secret
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

#### 2.2.4: Deploy

1. **Click** "Deploy"
2. **Wait** 3-5 minutes for build
3. **Check logs** for "Started UserServiceApplication"

#### 2.2.5: Get Service URL

1. **Click** "Settings" tab
2. **Click** "Generate Domain"
3. **Copy** the URL: `https://user-service-production-xxxx.up.railway.app`

**Test it**:
```powershell
# Test health endpoint
curl https://user-service-production-xxxx.up.railway.app/actuator/health
```for Product Service:

1. **New Project** → "Deploy from GitHub repo"
2. **Service Name**: `product-service`
3. **Root Directory**: `backend/product-service`
4. **Environment Variables**: Same as User Service
5. **Deploy** and **Generate Domain**

### Step 2.4: Deploy Order Service

**Same process**:

1. **Service Name**: `order-service`
2. **Root Directory**: `backend/order-service`
3. **Environment Variables**: Same database credentials
4. **Deploy** and **Generate Domain**

### Step 2.5: Deploy Payment Service

1. **Service Name**: `payment-service`
2. **Root Directory**: `backend/payment-service`
3. **Environment Variables**: Same + Razorpay credentials:

```env
# Database (same as above)
SPRING_DATASOURCE_URL=...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...

# Razorpay (from your current config)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

4. **Deploy** and **Generate Domain**

### Step 2.6: Deploy Cart Service

1. **Service Name**: `cart-service`
2. **Root Directory**: `backend/cart-service`
3. **Environment Variables**: Same database credentials
4. **Deploy** and **Generate Domain**

### Step 2.7: Deploy Notification Service

1. **Service Name**: `notification-service`
2. **Root Directory**: `backend/notification-service`
3. **Environment Variables**: Same database credentials + WebSocket config
4. **Deploy** and **Generate Domain**

### Step 2.8: Deploy Email Service

1. **Service Name**: `email-service`
2. **Root Directory**: `backend/email-service`
3. **Environment Variables**: Same + SMTP settings:

```env
# Database
SPRING_DATASOURCE_URL=...

# Email (if using Gmail SMTP)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password
```

4. **Deploy** and **Generate Domain**

### Step 2.9: Deploy Admin Service

1. **Service Name**: `admin-service`
2. **Root Directory**: `backend/admin-service`
3. **Environment Variables**: Same database credentials
4. **Deploy** and **Generate Domain**
 **ALL service URLs**:

```env
# ALL Backend Services (from Railway Step 2)
VITE_USER_SERVICE_URL=https://user-service-production-xxxx.up.railway.app/api
VITE_PRODUCT_SERVICE_URL=https://product-service-production-xxxx.up.railway.app/api
VITE_ORDER_SERVICE_URL=https://order-service-production-xxxx.up.railway.app/api
VITE_PAYMENT_SERVICE_URL=https://payment-service-production-xxxx.up.railway.app/api
VITE_CART_SERVICE_URL=https://cart-service-production-xxxx.up.railway.app/api
VITE_NOTIFICATION_SERVICE_URL=https://notification-service-production-xxxx.up.railway.app/api
VITE_EMAIL_SERVICE_URL=https://email-service-production-xxxx.up.railway.app/api
VITE_ADMIN_SERVICE_URL=https://admin-service-production-xxxx.up.railway.app/api
VITE_SEARCH_SERVICE_URL=https://search-service-production-xxxx.up.railway.app/api
VITE_MESSAGING_SERVICE_URL=https://messaging-service-production-xxxx.up.railway.app/api

# Not using gateway (direct service URLs)
VITE_USE_API_GATEWAY=false

**Test all services**:
```powershell
# Test each service health endpoint
curl https://user-service-xxxx.railway.app/actuator/health
curl https://product-service-xxxx.railway.app/actuator/health
curl https://order-service-xxxx.railway.app/actuator/health
curl https://payment-service-xxxx.railway.app/actuator/health
curl https://cart-service-xxxx.railway.app/actuator/health
# ... and so on
```

✅ **Checkpoint**: All 10nerate Domain**
6. **Copy URL**: `https://product-service-production-xxxx.up.railway.app`

**Test it**:
```powershell
curl https://product-service-production-xxxx.up.railway.app/api/categories
```

✅ **Checkpoint**: Both services deployed!

---

## Part 3: Frontend Deployment (Vercel) - 30 minutes

### Step 3.1: Create Vercel Account

1. **Visit**: https://vercel.com
2. **Sign up** with GitHub
3. **Accept** permissions

### Step 3.2: Import Project

1. **Click** "Add New..." → "Project"
2. **Select** your `b2b-marketplace` repository
3. **Click** "Import"

### Step 3.3: Configure Build Settings

**Framework Preset**: Vite (auto-detected)

**Build Settings**:
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**Root Directory**: `.` (leave as root, not in backend folder)

### Step 3.4: Set Environment Variables

**CRITICAL**: Add these before deploying!

Click "Environment Variables" and add:

```env
# Backend Services (from Railway Step 2)
VITE_USER_SERVICE_URL=https://user-service-production-xxxx.up.railway.app/api
VITE_PRODUCT_SERVICE_URL=https://product-service-production-xxxx.up.railway.app/api

# For today, use direct URLs (no gateway yet)
VITE_USE_API_GATEWAY=false

# Placeholder for services not deployed yet
VITE_ORDER_SERVICE_URL=http://localhost:8083/api
VITE_CART_SERVICE_URL=http://localhost:8085/api
VITE_PAYMENT_SERVICE_URL=http://localhost:8084/api
```

### Step 3.5: Deploy

1. **Click** "Deploy"
2. **Wait** 2-3 minutes for build
3. **Get URL**: `https://your-project-name.vercel.app`
**ALL 10 Railway services** to allow Vercel domain!

For **each service** on Railway (User, Product, Order, Payment, Cart, Notification, Email, Admin, Search, Messaging):

1. **Go to** Variables tab
2. **Update** `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-project-name.vercel.app
```

3. **Redeploy** (Railway auto-redeploys on variable change)

**Tip**: Open all services in separate browser tabs and update simultaneously to save time!-project-name.vercel.app
```

3. **Redeploy** each service (Railway auto-redeploys on variable change)

---

## Part 4: Testing Your Deployment - 15 minutes

### Test 1: Frontend Loads

1. **Open**: `https://your-project-name.vercel.app`
2. **Check**: Homepage loads
3. **Check**: No console errors (F12 → Console)

### Test 2: Backend Connection

1. **Open** browser DevTools (F12) → Network tab
2. **Navigate** to a page that calls API
3. **Check**: Requests go to Railway URLs
4. **Check**: Status 200 OK

### Test 3: Database Connection

1. **Try to register** a new account
2. **Check**: Registration succeeds
3. **Try to login** with new account
4. **Check**: Login succeeds


### Test 5: Cart Functionality

1. **Add** item to cart
2. **Check**: Cart updates
3. **Verify**: Cart service responding

### Test 6: Order Placement

1. **Try** to place an order
2. **Check*ALL 10 Services on Railway
   1. User Service ✅
   2. Product Service ✅
   3. Order Service ✅
   4. Payment Service ✅
   5. Cart Service ✅
   6. Notification Service ✅
   7. Email Service ✅
   8. Admin Service ✅
   9. Search Service ✅
   10. Messaging Service ✅
✅ Frontend: React app on Vercel
✅ All connected and working!
✅ Full e-commerce functionality live!

Total Cost: $0 (Railway credit may be partially used)
Total Time: ~4-6 hours
```

---

## Iteration 2 - Next Session (Optional Enhancements)

```
📋 Next Iteration Plan:

□ Set up API Gateway (optional)
□ Set up Typesense Cloud for advanced search
□ Configure Cloudflare R2 for image storage
□ Set up custom domain
□ Add monitoring (Sentry)
□ Performance optimization
□ Set up CI/CD pipelinesCOMPLETE DEPLOYED STACK                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   🌐 Frontend:  https://your-app.vercel.app                 │
│        ↓                                                     │
│   🚂 Backend (All 10 Services on Railway):                  │
│      → User Service:         user-service.railway.app       │
│      → Product Service:      product-service.railway.app    │
│      → Order Service:        order-service.railway.app      │
│      → Payment Service:      payment-service.railway.app    │
│      → Cart Service:         cart-service.railway.app       │
│      → Notification Service: notification-service.rail...   │
│      → Email Service:        email-service.railway.app      │
│      → Admin Service:        admin-service.railway.app      │
│      → Search Service:       search-service.railway.app     │
│      → Messaging Service:    messaging-service.railway.appen
        }
    } catch {
        Write-Host "  ❌ $svc is DOWN" -ForegroundColor Red
    }
}
```
### Test 4: Product Listing

1. **Navigate** to Products page
2. **Check**: Products load (if you have seed data)
3. **Check**: No errors

---

## What We Achieved Today ✅

```
✅ Database: PlanetScale MySQL (5GB free)
✅ Backend: User Service on Railway
✅ Backend: Product Service on Railway
✅ Frontend: React app on Vercel
✅ All connected and working!

Total Cost: $0
Total Time: ~2-3 hours
```

---

## Iteration 2 - Tomorrow/Next Session

```
📋 Next Iteration Plan:

□ Deploy Order Service to Railway
□ Deploy Cart Service to Railway
□ Deploy Payment Service to Railway
□ Set up Typesense for search
□ Deploy remaining services
□ Set up custom domain
```

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  YOUR DEPLOYED STACK                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   🌐 Frontend:  https://your-app.vercel.app                 │
│        ↓                                                     │
│   🚂 Backend:                                                │
│      → User Service:    user-service.railway.app            │
│      → Product Service: product-service.railway.app         │
│        ↓                                                     │
│   🪐 Database:  PlanetScale MySQL (Mumbai region)           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: Railway build fails

**Solution**:
1. Check build logs in Railway dashboard
2. Ensure `pom.xml` is correct
3. Check Java version (should be 17+)
4. Verify root directory is set correctly

### Issue: Database connection error

**Solution**:
1. Verify PlanetScale credentials are correct
2. Check if database is in "sleep mode" (wake it up)
3. Ensure connection string has `sslMode=VERIFY_IDENTITY`

### Issue: CORS errors in browser

**Solution**:
1. Update `ALLOWED_ORIGINS` in Railway to include Vercel URL
2. Redeploy Railway services
3. Clear browser cache
4. Check backend logs for CORS errors

### Issue: Frontend shows blank page

**Solution**:
1. Check Vercel build logs
2. Ensure environment variables are set
3. Check browser console for errors
4. Verify API URLs are correct (no trailing slashes)

---

## Saving Money Tips 💰

1. **Railway**: $5/month credit is enough for 2-3 services on free tier
2. **PlanetScale**: 5GB is plenty for development
3. **Vercel**: Unlimited deployments on free tier

**You won't pay anything until you exceed these limits!**

---

## Next Steps Checklist

After today's deployment:

- [ ] Save all credentials securely (use password manager)
- [ ] Bookmark your dashboard URLs:
  - [ ] Vercel: https://vercel.com/dashboard
  - [ ] Railway: https://railway.app/dashboard
  - [ ] PlanetScale: https://app.planetscale.com
- [ ] Test all functionality
- [ ] Take screenshots (for documentation)
- [ ] Plan Iteration 2 tasks

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **PlanetScale Docs**: https://planetscale.com/docs
- **Your Guide**: FINAL_INFRA_GUIDE.md

---

## Quick Reference - Credentials

**Save these securely!**

```
┌─────────────────────────────────────────────────────────────┐
│ Service       │ URL                     │ Credentials       │
├───────────────┼─────────────────────────┼───────────────────┤
│ PlanetScale   │ app.planetscale.com     │ GitHub login      │
│ Railway       │ railway.app/dashboard   │ GitHub login      │
│ Vercel        │ vercel.com/dashboard    │ GitHub login      │
├───────────────┼─────────────────────────┼───────────────────┤
│ Database URL  │ [saved in Railway]      │ [from Step 1.3]   │
│ User Service  │ user-service.railway... │ [auto-generated]  │
│ Product Svc   │ product-service.rail... │ [auto-generated]  │
│ Frontend      │ your-app.vercel.app     │ [auto-deployed]   │
└─────────────────────────────────────────────────────────────┘
```

---

**Ready to start? Let's do this! 🚀**

**Estimated Total Time**: 2-3 hours  
**Cost**: $0  
**Result**: Your B2B marketplace live on the internet!

---

*Iteration 1 Deployment Guide*  
*Date: January 17, 2026*  
*Next: Iteration 2 - Deploy remaining services*
