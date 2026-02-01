# Railway Deployment Checklist

## ✅ Step-by-Step Deployment Guide

### Phase 1: Prerequisites (5 minutes)
- [ ] Create Railway account at [railway.app](https://railway.app)
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login to Railway: `railway login`
- [ ] Push code to GitHub repository

---

### Phase 2: Database Setup (10 minutes)
- [ ] **2.1** Go to Railway Dashboard
- [ ] **2.2** Click "New Project" → "Empty Project"
- [ ] **2.3** Name project: `b2b-marketplace`
- [ ] **2.4** Click "+ New" → "Database" → "Add MySQL"
- [ ] **2.5** Wait for MySQL to provision (~2 minutes)
- [ ] **2.6** Click MySQL service → "Variables" → Copy credentials:
  ```
  MYSQLHOST=containers-us-west-xxx.railway.app
  MYSQLPORT=xxxx
  MYSQLDATABASE=railway
  MYSQLUSER=root
  MYSQLPASSWORD=xxxxxxxxxx
  ```

#### Initialize Database Schema
- [ ] **Option A - Using PowerShell**:
  ```powershell
  # Replace with your Railway MySQL credentials
  $env:MYSQL_HOST = "containers-us-west-xxx.railway.app"
  $env:MYSQL_PORT = "xxxx"
  $env:MYSQL_USER = "root"
  $env:MYSQL_PASSWORD = "your-password"
  $env:MYSQL_DATABASE = "railway"
  
  # Import schema
  mysql -h $env:MYSQL_HOST -P $env:MYSQL_PORT -u $env:MYSQL_USER -p$env:MYSQL_PASSWORD $env:MYSQL_DATABASE < database/schema.sql
  mysql -h $env:MYSQL_HOST -P $env:MYSQL_PORT -u $env:MYSQL_USER -p$env:MYSQL_PASSWORD $env:MYSQL_DATABASE < database/sample_data.sql
  mysql -h $env:MYSQL_HOST -P $env:MYSQL_PORT -u $env:MYSQL_USER -p$env:MYSQL_PASSWORD $env:MYSQL_DATABASE < database/sample_hierarchical_categories.sql
  ```

- [ ] **Option B - Using Railway CLI**:
  ```bash
  railway link  # Link to your project
  railway run mysql < database/schema.sql
  ```

---

### Phase 3: Deploy Microservices (30-45 minutes)

#### Service 1: API Gateway (Deploy First)
- [ ] **3.1** Click "+ New" → "GitHub Repo" → Select your repo
- [ ] **3.2** Service name: `api-gateway`
- [ ] **3.3** Settings:
  - Root Directory: `backend/api-gateway`
  - Watch Paths: `backend/api-gateway/**,backend/common/**`
- [ ] **3.4** Add Variables (from railway.env.template):
  ```
  SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}
  SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
  SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
  SERVER_PORT=${PORT}
  JWT_SECRET=your-256-bit-secret-key
  SPRING_JPA_HIBERNATE_DDL_AUTO=update
  ```
- [ ] **3.5** Click "Deploy"
- [ ] **3.6** Wait for deployment (~5-10 minutes)
- [ ] **3.7** Test: `curl https://api-gateway-production.up.railway.app/actuator/health`
- [ ] **3.8** Copy public URL: `https://api-gateway-production.up.railway.app`

#### Service 2: User Service
- [ ] **3.9** Repeat steps 3.1-3.8 with:
  - Service name: `user-service`
  - Root Directory: `backend/user-service`
  - Watch Paths: `backend/user-service/**,backend/common/**`

#### Service 3: Product Service
- [ ] **3.10** Repeat with:
  - Service name: `product-service`
  - Root Directory: `backend/product-service`

#### Service 4: Order Service
- [ ] **3.11** Repeat with:
  - Service name: `order-service`
  - Root Directory: `backend/order-service`

#### Service 5: Payment Service
- [ ] **3.12** Repeat with:
  - Service name: `payment-service`
  - Root Directory: `backend/payment-service`
  - **Additional Variables**:
    ```
    STRIPE_SECRET_KEY=sk_test_your_key
    RAZORPAY_KEY_ID=rzp_test_your_key
    RAZORPAY_KEY_SECRET=your_secret
    ```

#### Service 6: Cart Service
- [ ] **3.13** Repeat with:
  - Service name: `cart-service`
  - Root Directory: `backend/cart-service`

#### Service 7: Admin Service
- [ ] **3.14** Repeat with:
  - Service name: `admin-service`
  - Root Directory: `backend/admin-service`

#### Service 8: Search Service
- [ ] **3.15** Repeat with:
  - Service name: `search-service`
  - Root Directory: `backend/search-service`
  - **Additional Variables**:
    ```
    SOLR_URL=http://localhost:8983/solr  # Update if using external Solr
    ```

#### Service 9: Email Service
- [ ] **3.16** Repeat with:
  - Service name: `email-service`
  - Root Directory: `backend/email-service`
  - **Additional Variables**:
    ```
    SPRING_MAIL_HOST=smtp.gmail.com
    SPRING_MAIL_PORT=587
    SPRING_MAIL_USERNAME=your-email@gmail.com
    SPRING_MAIL_PASSWORD=your-app-password
    ```

---

### Phase 4: Deploy Frontend (15 minutes)

#### Create Frontend Dockerfile
- [ ] **4.1** Create `Dockerfile.frontend` in project root:
  ```dockerfile
  FROM node:20-alpine AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  
  FROM nginx:alpine
  COPY --from=build /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

#### Create Nginx Config
- [ ] **4.2** Create `nginx.conf`:
  ```nginx
  server {
      listen 80;
      root /usr/share/nginx/html;
      index index.html;
      
      location / {
          try_files $uri $uri/ /index.html;
      }
      
      location /api {
          proxy_pass https://api-gateway-production.up.railway.app;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
  }
  ```

#### Deploy Frontend
- [ ] **4.3** Click "+ New" → "GitHub Repo"
- [ ] **4.4** Service name: `frontend`
- [ ] **4.5** Settings:
  - Root Directory: `/` (project root)
  - Dockerfile Path: `Dockerfile.frontend`
- [ ] **4.6** Add Variables:
  ```
  VITE_API_URL=https://api-gateway-production.up.railway.app/api
  NODE_ENV=production
  ```
- [ ] **4.7** Deploy
- [ ] **4.8** Copy frontend URL: `https://frontend-production.up.railway.app`

---

### Phase 5: Update Environment Variables (10 minutes)

#### Update CORS in API Gateway
- [ ] **5.1** Go to API Gateway service → Variables
- [ ] **5.2** Add/Update:
  ```
  CORS_ALLOWED_ORIGINS=https://frontend-production.up.railway.app
  ```

#### Update Service URLs (if needed)
- [ ] **5.3** In API Gateway, add service URLs:
  ```
  USER_SERVICE_URL=https://user-service-production.up.railway.app
  PRODUCT_SERVICE_URL=https://product-service-production.up.railway.app
  ORDER_SERVICE_URL=https://order-service-production.up.railway.app
  ```

---

### Phase 6: Testing (15 minutes)

#### Test Backend Services
- [ ] **6.1** API Gateway health: `https://api-gateway-production.up.railway.app/actuator/health`
- [ ] **6.2** User Service health: `https://user-service-production.up.railway.app/actuator/health`
- [ ] **6.3** Product Service health: `https://product-service-production.up.railway.app/actuator/health`
- [ ] **6.4** Test user registration endpoint
- [ ] **6.5** Test user login endpoint
- [ ] **6.6** Test product listing endpoint

#### Test Frontend
- [ ] **6.7** Open frontend URL in browser
- [ ] **6.8** Test user registration
- [ ] **6.9** Test user login
- [ ] **6.10** Test product browsing
- [ ] **6.11** Test cart functionality
- [ ] **6.12** Test checkout process

---

### Phase 7: Optional - Custom Domain (10 minutes)
- [ ] **7.1** Go to frontend service → Settings → Domains
- [ ] **7.2** Click "Add Custom Domain"
- [ ] **7.3** Enter your domain: `www.yourdomain.com`
- [ ] **7.4** Add DNS records as shown by Railway
- [ ] **7.5** Wait for SSL certificate (~5 minutes)

---

### Phase 8: Monitoring & Optimization

#### Enable Health Checks
- [ ] **8.1** For each service, go to Settings → Health Check Path
- [ ] **8.2** Set: `/actuator/health`

#### Review Logs
- [ ] **8.3** Check logs for each service
- [ ] **8.4** Fix any errors or warnings

#### Optimize Resources
- [ ] **8.5** Monitor memory usage
- [ ] **8.6** Adjust JVM settings if needed (`-Xmx512m`)
- [ ] **8.7** Consider scaling down unused services

---

## 🎯 Deployment Summary

### Services to Deploy:
1. ✅ MySQL Database
2. ✅ API Gateway
3. ✅ User Service
4. ✅ Product Service
5. ✅ Order Service
6. ✅ Payment Service
7. ✅ Cart Service
8. ✅ Admin Service
9. ✅ Search Service
10. ✅ Email Service
11. ✅ Frontend

### Estimated Costs (Railway Hobby Plan):
- MySQL: $10-15/month
- 9 Microservices: $50-80/month
- Frontend: $5/month
- **Total: ~$70-100/month**

### Alternative for Cost Savings:
- Use PlanetScale for MySQL (Free tier)
- Use external email service (SendGrid free tier)
- Scale down non-critical services
- **Reduced Total: ~$30-50/month**

---

## 🚨 Common Issues & Solutions

### Issue: Service won't start
**Solution**: 
- Check logs in Railway dashboard
- Verify environment variables are set
- Ensure MySQL is running

### Issue: Database connection failed
**Solution**:
- Check SPRING_DATASOURCE_URL format
- Verify MySQL credentials
- Check MySQL is in same project

### Issue: 502 Bad Gateway
**Solution**:
- Verify service is listening on $PORT
- Check SERVER_PORT=${PORT} is set
- Review service logs for crashes

### Issue: CORS errors
**Solution**:
- Update CORS_ALLOWED_ORIGINS with frontend URL
- Redeploy API Gateway after changing

---

## 📚 Useful Commands

```powershell
# Link to Railway project
railway link

# View service logs
railway logs

# Open Railway dashboard
railway open

# Deploy current directory
railway up

# Run command in Railway environment
railway run node index.js

# Add variable
railway variables set KEY=value
```

---

## ✅ Final Checklist

- [ ] All services deployed and healthy
- [ ] Database initialized with schema
- [ ] Environment variables configured
- [ ] Frontend can communicate with backend
- [ ] CORS configured correctly
- [ ] Payment gateways configured (if needed)
- [ ] Email service configured (if needed)
- [ ] Health checks enabled
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Logs reviewed

---

## 🎉 Deployment Complete!

Your B2B Marketplace is now live on Railway! 

**Next Steps:**
1. Share frontend URL with team
2. Set up CI/CD for automatic deployments
3. Monitor performance and costs
4. Scale services as needed
5. Add monitoring tools (e.g., Sentry, LogRocket)

For issues, refer to: [RAILWAY_DEPLOYMENT_GUIDE.md](./RAILWAY_DEPLOYMENT_GUIDE.md)
