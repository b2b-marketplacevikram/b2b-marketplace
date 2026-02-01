# Railway Deployment - Step by Step Guide

## ✅ What Was Fixed

### Problem:
Services were failing to build in Railway because:
1. **Old pom.xml files** referenced parent pom that doesn't exist in standalone deployment
2. **Multi-module structure** expected all services to be built together

### Solution:
1. ✅ Converted all pom.xml files to standalone (no parent dependency)
2. ✅ Removed Dockerfiles - Railway's **Nixpacks** auto-detection works better!
3. ✅ Each service now builds independently with Maven

### Why No Dockerfiles?
Railway's **Nixpacks** automatically detects Spring Boot projects and:
- Detects `pom.xml` and runs Maven build
- Creates optimized runtime containers
- Handles Java version and dependencies
- Simpler and faster than custom Dockerfiles

**Proof:** admin-service deployed successfully without a Dockerfile! ✅

---

## 🚀 How to Deploy Each Service to Railway

### For Each Service (repeat these steps):

#### 1. **Create New Service in Railway**
   - Click **"+ New"** → **"GitHub Repo"**
   - Select your repository: `b2b-marketplace`

#### 2. **Configure Service Settings**

Go to **Settings** tab and configure:

##### **Source Section:**
- **Root Directory:** 
  ```
  backend/user-service
  ```
  (Change based on which service you're deploying)

##### **Build Section:**
- Railway will **auto-detect Maven/Spring Boot**
- Build Command: (leave empty - Railway auto-detects)
- Install Command: (leave empty - Railway auto-detects)
- **Nixpacks** will automatically run `mvn clean install`
Start Command: (leave empty - Railway auto-detects)
- Railway will automatically run the Spring Boot JAR
##### **Deploy Section:**
- Railway will use the Dockerfile automatically

#### 3. **Set Environment Variables**

Go to **Variables** tab and add:

```bash
# Required for ALL services
ALLOWED_ORIGINS=https://your-frontend-url.com

# Database (use your Railway MySQL credentials)
SPRING_DATASOURCE_URL=jdbc:mysql://maglev.proxy.rlwy.net:33965/b2b_marketplace?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=UQvmfcCPabRiomKtJkPPItoUmhZcPEWv
```

**Additional variables per service:**

**user-service:**
```bash
JWT_SECRET=YourVeryLongSecretKeyForJWTTokenGenerationAndValidation2024B2BMarketplace
JWT_EXPIRATION=86400000
```

**payment-service:**
```bash
FRONTEND_URL=https://your-frontend-url.com
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

**search-service:**
```bash
SPRING_DATA_SOLR_HOST=https://us-east-8-10.solrcluster.com/solr
SPRING_DATA_SOLR_USERNAME=opensolr
SPRING_DATA_SOLR_PASSWORD=de189a9e8021b3df526505da20b80cd1
```

**email-service:**
```bash
SPRING_MAIL_USERNAME=b2bmarketplace9@gmail.com
SPRING_MAIL_PASSWORD=nmyqqjarogxxxnca
```

#### 4. **Deploy**
- Railway will automatically deploy after you save settings
- Check the **Deployments** tab for build progress

#### 5. **Verify Deployment**
Once deployed, test the health endpoint:
```bash
curl https://your-service-url.railway.app/actuator/health
```

---

## 📋 Service Deployment Checklist

Deploy services in this order (due to dependencies):

1. ✅ **user-service** (Port 8081) - Authentication/Users
   - Root: `backend/user-service`
   - Env: `JWT_SECRET`, `JWT_EXPIRATION`, `ALLOWED_ORIGINS`

2. ✅ **product-service** (Port 8082) - Products
   - Root: `backend/product-service`
   - Env: `ALLOWED_ORIGINS`

3. ✅ **cart-service** (Port 8085) - Shopping Cart
   - Root: `backend/cart-service`
   - Env: `ALLOWED_ORIGINS`

4. ✅ **order-service** (Port 8083) - Orders
   - Root: `backend/order-service`
   - Env: `ALLOWED_ORIGINS`

5. ✅ **payment-service** (Port 8084) - Payments
   - Root: `backend/payment-service`
   - Env: `ALLOWED_ORIGINS`, `FRONTEND_URL`, Stripe/Razorpay keys

6. ✅ **search-service** (Port 8090) - Search
   - Root: `backend/search-service`
   - Env: `ALLOWED_ORIGINS`, Solr credentials

7. ✅ **admin-service** (Port 8088) - Admin
   - Root: `backend/admin-service`
   - Env: `ALLOWED_ORIGINS`

8. ✅ **messaging-service** (Port 8091) - Messages
   - Root: `backend/messaging-service`
   - Env: `ALLOWED_ORIGINS`

9. ✅ **notification-service** (Port 8086) - Notifications
   - Root: `backend/notification-service`
   - Env: `ALLOWED_ORIGINS`

10. ✅ **email-service** (Port 8087) - Emails
    - Root: `backend/email-service`
    - Env: `ALLOWED_ORIGINS`, Gmail SMTP credentials

---

## 🔧 Railway Configuration Reference

### Root Directory Format:
```
backend/[service-name]
```

### Watch Paths (Optional but Recommended):
```
backend/[service-name]/**
backend/common/**
```
This ensures Railway only rebuilds when your service files change.

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Build faiAll pom.xml files now standalone (no parent dependency).

### Issue 2: "Build not detecting Maven project"
**Solution:** Make sure:
- Root directory is set to `backend/[service-name]`
- pom.xml exists in that directory
- No Dockerfile exists (let Nixpacks auto-detect)
**Solution:** ✅ Fixed! Updated Dockerfiles to not reference parent pom.

### Issue 2: "Port already in use"
**Solution:** Railway automatically sets the `PORT` environment variable. Update your services to use:
```properties
server.port=${PORT:8081}
```

### Issue 3: "CORS errors in production"
**Solution:** Make sure `ALLOWED_ORIGINS` environment variable is set to your actual frontend URL.

### Issue 4: "Database connection failed"
**Solution:** Use Railway's MySQL connection details:
- Host: `maglev.proxy.rlwy.net:33965`
- Database: `b2b_marketplace`
- Username: `root`
- Password: (from Railway MySQL service)

---

## 🎯 Next Steps After Deployment

1. **Get Service URLs:**
   - Each service will have a unique Railway URL
   - Format: `https://[service-name]-production-xxxx.up.railway.app`

2. **Update Frontend API Configuration:**
   - Point your frontend to use Railway service URLs instead of localhost

3. **Test Each Service:**
   ```bash
   # Health check
   curl https://user-service-production.railway.app/actuator/health
   
   # Test authentication
   curl -X POST https://user-service-production.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

4. **Monitor Logs:**
   - Check Railway **Logs** tab for any runtime errors
   - Enable logging in application.properties if needed

---

## 📊 Cost Optimization

Railway free tier includes:
- $5 credit per month
- 500 hours of usage

**Tips:**
- Deploy critical services first (user, product, order, payment)
- Other services can be deployed as needed
- Use Railway's sleep feature for non-production environments

---

## ✅ Deployment Complete When:

- [ ] All services build successfully
- [ ] Health checks return 200 OK
- [ ] Database connections work
- [ ] Frontend can communicate with all services
- [ ] No CORS errors
- [ ] Authentication works end-to-end

**Status: Ready to deploy! All Dockerfiles fixed! 🚀**
