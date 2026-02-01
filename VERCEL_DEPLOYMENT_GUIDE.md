# Deploy Frontend to Vercel - Step by Step Guide

## Prerequisites
- ✅ All backend services deployed on Railway
- ✅ GitHub repository with your code
- ✅ Vercel account (free tier works)

---

## Step 1: Get Your Railway Service URLs

Before deploying, collect all your Railway service URLs:

1. Go to Railway dashboard
2. Click on each service and copy its **Public URL**

**Your Railway URLs will look like:**
```
user-service:         https://user-service-production-xxxx.up.railway.app
product-service:      https://product-service-production-xxxx.up.railway.app
order-service:        https://order-service-production-xxxx.up.railway.app
payment-service:      https://payment-service-production-xxxx.up.railway.app
search-service:       https://search-service-production-xxxx.up.railway.app
email-service:        https://email-service-production-xxxx.up.railway.app
admin-service:        https://admin-service-production-xxxx.up.railway.app
notification-service: https://notification-service-production-xxxx.up.railway.app
messaging-service:    https://messaging-service-production-xxxx.up.railway.app
cart-service:         https://cart-service-production-xxxx.up.railway.app
```

**Write them down - you'll need them in Step 4!**

---

## Step 2: Create .env.production File

In your local project, create `.env.production` file:

```bash
# In PowerShell
cd f:\B2B-MarketPlace\b2b-marketplace
New-Item -Path ".env.production" -ItemType File
```

Add your Railway URLs (replace with your actual URLs):

```env
# Backend Service URLs (from Railway)
VITE_USER_SERVICE_URL=https://user-service-production-xxxx.up.railway.app/api
VITE_PRODUCT_SERVICE_URL=https://product-service-production-xxxx.up.railway.app/api
VITE_ORDER_SERVICE_URL=https://order-service-production-xxxx.up.railway.app/api
VITE_PAYMENT_SERVICE_URL=https://payment-service-production-xxxx.up.railway.app/api
VITE_SEARCH_SERVICE_URL=https://search-service-production-xxxx.up.railway.app/api
VITE_EMAIL_SERVICE_URL=https://email-service-production-xxxx.up.railway.app/api
VITE_ADMIN_SERVICE_URL=https://admin-service-production-xxxx.up.railway.app/api
VITE_NOTIFICATION_SERVICE_URL=https://notification-service-production-xxxx.up.railway.app/api
VITE_MESSAGING_SERVICE_URL=https://messaging-service-production-xxxx.up.railway.app/api
VITE_CART_SERVICE_URL=https://cart-service-production-xxxx.up.railway.app/api

# Stripe Public Key (safe to expose in frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here

# Razorpay Key (safe to expose in frontend)
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_here
```

**Commit this file:**
```bash
git add .env.production
git commit -m "Add production environment variables for Vercel"
git push
```

---

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel:** https://vercel.com
2. **Sign in** with GitHub
3. **Click "Add New"** → **"Project"**
4. **Import your repository:** `b2b-marketplace`
5. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

6. **Click "Deploy"**

Vercel will automatically:
- Install dependencies
- Build your project
- Deploy to a production URL

---

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (run from project root)
cd f:\B2B-MarketPlace\b2b-marketplace
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? b2b-marketplace
# - Directory? ./
# - Override settings? No
```

---

## Step 4: Add Environment Variables in Vercel

**IMPORTANT:** Vercel doesn't use `.env.production` file directly. You need to add variables in Vercel dashboard.

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add each variable:

For each variable, add:
- **Key:** `VITE_USER_SERVICE_URL`
- **Value:** `https://user-service-production-xxxx.up.railway.app/api`
- **Environment:** Select **Production**, **Preview**, and **Development**
- Click **Save**

**Add all these variables:**

```
VITE_USER_SERVICE_URL
VITE_PRODUCT_SERVICE_URL
VITE_ORDER_SERVICE_URL
VITE_PAYMENT_SERVICE_URL
VITE_SEARCH_SERVICE_URL
VITE_EMAIL_SERVICE_URL
VITE_ADMIN_SERVICE_URL
VITE_NOTIFICATION_SERVICE_URL
VITE_MESSAGING_SERVICE_URL
VITE_CART_SERVICE_URL
VITE_STRIPE_PUBLISHABLE_KEY
VITE_RAZORPAY_KEY_ID
```

4. **Redeploy** to apply environment variables:
   - Go to **Deployments** tab
   - Click "..." on latest deployment
   - Click **"Redeploy"**

---

## Step 5: Update Railway CORS Settings

Now that you have your Vercel URL, update Railway backend services:

**Your Vercel URL will be:** `https://your-project-name.vercel.app`

### For EACH Railway service:

1. Go to Railway dashboard
2. Select the service (e.g., user-service)
3. Go to **Variables** tab
4. Update or add **ALLOWED_ORIGINS:**

```bash
ALLOWED_ORIGINS=https://your-project-name.vercel.app
```

5. **Save** - Railway will automatically redeploy

**Repeat for all 10 services!**

---

## Step 6: Test Your Deployment

1. **Open your Vercel URL:** `https://your-project-name.vercel.app`

2. **Test basic functionality:**
   - Can you load the homepage?
   - Can you navigate between pages?
   - Can you see products?
   - Can you register/login?

3. **Check Browser Console** for errors:
   - Press F12
   - Look for CORS errors
   - Look for 404 errors on API calls

---

## Step 7: Set Up Custom Domain (Optional)

1. Go to Vercel → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `b2bmarketplace.com`)
4. Follow DNS configuration instructions
5. Once verified, update Railway `ALLOWED_ORIGINS` to include your custom domain:

```bash
ALLOWED_ORIGINS=https://b2bmarketplace.com,https://www.b2bmarketplace.com,https://your-project-name.vercel.app
```

---

## Troubleshooting

### Issue 1: "Cannot connect to backend"
**Solution:** 
- Check environment variables in Vercel
- Make sure URLs end with `/api`
- Verify Railway services are running

### Issue 2: CORS Errors
**Solution:**
- Update `ALLOWED_ORIGINS` in all Railway services
- Include your Vercel URL
- Redeploy Railway services after updating

### Issue 3: "Module not found" errors
**Solution:**
- Check `package.json` has all dependencies
- Redeploy in Vercel
- Check build logs for errors

### Issue 4: Blank page after deployment
**Solution:**
- Check browser console for errors
- Verify build completed successfully in Vercel
- Check that `dist` folder is being deployed

---

## Quick Reference

### Vercel Project Settings
```
Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x
```

### Required Environment Variables (10 total)
- 10 x `VITE_*_SERVICE_URL` (backend URLs)
- 1 x `VITE_STRIPE_PUBLISHABLE_KEY`
- 1 x `VITE_RAZORPAY_KEY_ID`

### Railway CORS Update
Update `ALLOWED_ORIGINS` in all 10 backend services with your Vercel URL.

---

## Success Checklist

- [ ] All Railway service URLs collected
- [ ] .env.production file created
- [ ] Committed and pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] All environment variables added in Vercel
- [ ] Railway CORS updated with Vercel URL
- [ ] Frontend loads successfully
- [ ] Can connect to backend services
- [ ] No CORS errors in browser console
- [ ] Authentication works
- [ ] Products display correctly

---

## Next Steps After Deployment

1. **Monitor Vercel Analytics** - Check performance and errors
2. **Set up Vercel Monitoring** - Get alerts for downtime
3. **Enable Vercel Preview Deployments** - Test changes before production
4. **Configure Redirects** - Set up URL redirects if needed
5. **Add Vercel Functions** - For serverless functions if needed

**Your B2B Marketplace is now live! 🚀**
