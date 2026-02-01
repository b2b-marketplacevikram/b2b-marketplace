# Railway Deployment Configuration Guide

## ✅ CORS Configuration Updated

All backend services are now configured to use environment variables for CORS, making them production-ready for Railway deployment.

---

## 🔧 Required Environment Variables for Railway

### For Each Backend Service, Set These Environment Variables:

#### 1. **ALLOWED_ORIGINS** (Required for all services)
Set this to your production frontend URL(s):

```bash
# Single frontend URL
ALLOWED_ORIGINS=https://your-app.vercel.app

# Multiple frontend URLs (comma-separated, no spaces)
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-domain.com,https://www.your-domain.com
```

**Services that need this:**
- ✅ admin-service
- ✅ user-service
- ✅ product-service
- ✅ payment-service
- ✅ order-service
- ✅ cart-service
- ✅ messaging-service
- ✅ notification-service
- ✅ email-service
- ✅ search-service

#### 2. **FRONTEND_URL** (Required for payment-service)
Set this for Stripe redirect URLs:

```bash
FRONTEND_URL=https://your-app.vercel.app
```

#### 3. **Database Configuration** (Required for all services)
You already have this configured in Railway MySQL:

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://maglev.proxy.rlwy.net:33965/b2b_marketplace?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=UQvmfcCPabRiomKtJkPPItoUmhZcPEWv
```

---

## 📝 How to Set Environment Variables in Railway

### Method 1: Via Railway Dashboard (Recommended)

1. **Go to your Railway project**
2. **Select the service** (e.g., admin-service)
3. **Click on "Variables" tab**
4. **Add New Variable:**
   - Name: `ALLOWED_ORIGINS`
   - Value: `https://your-frontend-url.com`
5. **Click "Add"**
6. **Repeat for each service**

### Method 2: Via Railway CLI

```bash
# Set ALLOWED_ORIGINS for a service
railway variables set ALLOWED_ORIGINS=https://your-app.vercel.app

# Set FRONTEND_URL for payment-service
railway variables set FRONTEND_URL=https://your-app.vercel.app
```

---

## 🚀 Deployment Steps

### Step 1: Deploy Each Backend Service to Railway

For each service, create a new Railway service:

```bash
# Example for admin-service
cd backend/admin-service
railway up
```

Or use the Railway dashboard to connect your GitHub repository.

### Step 2: Configure Environment Variables

For **each deployed service**, set:

```bash
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

For **payment-service only**, also set:

```bash
FRONTEND_URL=https://your-frontend-domain.com
```

### Step 3: Verify Deployment

Test each service:

```bash
# Health check
curl https://your-service-url.railway.app/actuator/health

# Test CORS
curl -H "Origin: https://your-frontend-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-service-url.railway.app/api/endpoint
```

---

## 🔍 What Changed?

### Before (Local Development Only):
```properties
spring.web.cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

### After (Production Ready):
```properties
spring.web.cors.allowed-origins=${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}
```

**Benefits:**
- ✅ Works locally without any setup (defaults to localhost)
- ✅ Production-ready (use Railway environment variables)
- ✅ No code changes needed between environments
- ✅ Secure (no hardcoded production URLs in code)

---

## 🌐 Frontend Deployment Options

### Option 1: Vercel (Recommended for React/Vite)
1. Connect your GitHub repo to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Get your deployment URL: `https://your-app.vercel.app`
5. Use this URL in Railway `ALLOWED_ORIGINS`

### Option 2: Netlify
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Get deployment URL: `https://your-app.netlify.app`
5. Use this URL in Railway `ALLOWED_ORIGINS`

### Option 3: Railway (Full Stack)
1. Deploy frontend on Railway too
2. Get Railway frontend URL
3. Use it in backend `ALLOWED_ORIGINS`

### Option 4: Custom Domain
1. Deploy frontend anywhere
2. Point your domain to it
3. Use: `https://yourdomain.com` in `ALLOWED_ORIGINS`

---

## 📋 Services Deployment Checklist

- [ ] **admin-service** (Port 8088)
  - [ ] Deployed to Railway
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] Database configured
  - [ ] CORS tested

- [ ] **user-service** (Port 8081)
  - [ ] Deployed to Railway
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] Database configured
  - [ ] JWT secret configured
  - [ ] CORS tested

- [ ] **product-service** (Port 8082)
  - [ ] Deployed to Railway
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] Database configured
  - [ ] CORS tested

- [ ] **payment-service** (Port 8084)
  - [ ] Deployed to Railway
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] `FRONTEND_URL` set
  - [ ] Stripe keys configured
  - [ ] Database configured
  - [ ] CORS tested

- [ ] **order-service** (Port 8083)
  - [ ] Deployed to Railway
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] Database configured
  - [ ] CORS tested

- [ ] **cart-service** (Port 8085)
  - [ ] Deployed to Railway
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] Database configured
  - [ ] CORS tested

- [ ] **search-service** (Port 8090)
  - [ ] Deployed to Railway
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] Database configured
  - [ ] Solr configured
  - [ ] CORS tested

- [ ] **messaging-service** (Port 8091)
  - [ ] Deployed to Railway
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] Database configured
  - [ ] CORS tested

- [ ] **notification-service** (Port 8086)
  - [ ] Deployed to Railway
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] Database configured
  - [ ] WhatsApp API configured (optional)
  - [ ] CORS tested

- [ ] **email-service** (Port 8087)
  - [ ] Deployed to Railway
  - [ ] `ALLOWED_ORIGINS` set
  - [ ] Database configured
  - [ ] SMTP configured
  - [ ] CORS tested

---

## 🔐 Security Best Practices

1. **Never commit production URLs to code** ✅ (Now using environment variables)
2. **Use HTTPS only in production** (Railway provides this automatically)
3. **Keep credentials in Railway environment variables** (Not in code)
4. **Use specific origins** (Don't use `*` in production)
5. **Enable credentials only if needed** (Currently enabled for auth)

---

## 🐛 Troubleshooting

### CORS Error: "Access-Control-Allow-Origin missing"

**Cause:** Frontend URL not in `ALLOWED_ORIGINS`

**Fix:**
```bash
# In Railway, add your frontend URL
ALLOWED_ORIGINS=https://your-actual-frontend-url.com
```

### CORS Error: "Credentials not supported if origin is *"

**Cause:** Using wildcard `*` with credentials

**Fix:** Use specific origin URLs (already configured)

### Local Development Still Works?

**Yes!** The default values still point to localhost:
```properties
${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}
```

If no `ALLOWED_ORIGINS` environment variable is set, it defaults to localhost.

---

## 📞 Next Steps

1. **Deploy your frontend** to Vercel/Netlify/Railway
2. **Get the production URL** (e.g., `https://your-app.vercel.app`)
3. **Set `ALLOWED_ORIGINS`** in Railway for all backend services
4. **Test the integration** between frontend and backend
5. **Update API endpoints** in your frontend to point to Railway backend URLs

---

## 💡 Example: Complete Railway Configuration

### For admin-service:

```bash
# Environment Variables in Railway
ALLOWED_ORIGINS=https://b2b-marketplace.vercel.app
SPRING_DATASOURCE_URL=jdbc:mysql://maglev.proxy.rlwy.net:33965/b2b_marketplace?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=UQvmfcCPabRiomKtJkPPItoUmhZcPEWv
```

### For payment-service (additional):

```bash
# Environment Variables in Railway
ALLOWED_ORIGINS=https://b2b-marketplace.vercel.app
FRONTEND_URL=https://b2b-marketplace.vercel.app
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

**Status:** ✅ All backend services are now production-ready for Railway deployment!
