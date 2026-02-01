# Railway Deployment Guide for B2B Marketplace

This guide walks you through deploying your B2B marketplace microservices architecture to Railway.app cloud platform.

## Architecture Overview

Your application consists of:
- **9 Spring Boot Microservices** (API Gateway, User, Product, Order, Payment, Cart, Admin, Search, Email, Notification, Messaging)
- **MySQL Database** 
- **Apache Solr** (Search Engine)
- **React Frontend** (Vite)

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Railway Project Setup](#railway-project-setup)
3. [Database Deployment](#database-deployment)
4. [Solr Deployment](#solr-deployment)
5. [Spring Microservices Deployment](#spring-microservices-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Environment Variables](#environment-variables)
8. [Cost Optimization](#cost-optimization)

---

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Railway CLI** (optional but recommended):
   ```bash
   npm install -g @railway/cli
   railway login
   ```

---

## Railway Project Setup

### Step 1: Create New Project

1. Go to Railway Dashboard
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Connect your GitHub account and select your repository

### Step 2: Project Structure

Railway supports multiple services in one project. You'll create:
- 1 MySQL service
- 1 Solr service (or use external Solr)
- 9 Spring Boot services
- 1 Frontend service

---

## Database Deployment

### Option 1: Railway MySQL Plugin (Recommended)

1. **Add MySQL Plugin**:
   - In Railway dashboard, click **"+ New"**
   - Select **"Database"** → **"Add MySQL"**
   - Railway automatically creates database with credentials

2. **Get Database Credentials**:
   ```
   MYSQL_URL=mysql://root:password@containers-us-west-123.railway.app:7891/railway
   MYSQLHOST=containers-us-west-123.railway.app
   MYSQLPORT=7891
   MYSQLDATABASE=railway
   MYSQLUSER=root
   MYSQLPASSWORD=generated-password
   ```

3. **Initialize Database Schema**:
   
   **Method A - Using Railway CLI**:
   ```bash
   # Connect to Railway MySQL
   railway connect MySQL
   
   # Import schema
   mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < database/schema.sql
   mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < database/sample_data.sql
   mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < database/sample_hierarchical_categories.sql
   ```

   **Method B - Using MySQL Workbench**:
   - Connect using Railway's MySQL credentials
   - Run SQL scripts manually

   **Method C - Automated via Init Container**:
   Create `railway.json` in project root:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

### Option 2: External MySQL (PlanetScale, AWS RDS, etc.)

If Railway MySQL is too expensive:
- Use **PlanetScale** (Free tier available)
- Use **AWS RDS** MySQL
- Use **Clever Cloud** MySQL

---

## Solr Deployment

### Option 1: Deploy Solr on Railway

1. **Create Solr Service**:
   
   Create `solr.Dockerfile` in project root:
   ```dockerfile
   FROM solr:9.4
   
   # Copy Solr configuration
   COPY solr-config /opt/solr/server/solr/configsets/b2b_config/conf
   
   # Expose port
   EXPOSE 8983
   
   # Create core on startup
   USER solr
   CMD ["solr-precreate", "products", "/opt/solr/server/solr/configsets/b2b_config"]
   ```

2. **Add Solr Service to Railway**:
   - Click **"+ New"** → **"Empty Service"**
   - Name it **"solr-service"**
   - Settings → **"Custom Start Command"**:
     ```bash
     solr-precreate products
     ```
   - Or use **Docker** build mode and specify `solr.Dockerfile`

3. **Environment Variables for Solr**:
   ```
   SOLR_JAVA_MEM=-Xms512m -Xmx1024m
   PORT=8983
   ```

### Option 2: External Solr (Recommended for Cost)

Consider using **SearchStax** or **OpenSolr** for managed Solr:
- **SearchStax**: 14-day free trial, then paid
- **Self-hosted**: DigitalOcean/AWS EC2
- **Elasticsearch Alternative**: Use Elastic Cloud (better Railway integration)

### Option 3: Switch to Elasticsearch (Railway-Friendly)

If Solr is complex, consider switching to Elasticsearch:
1. **Add Elasticsearch Plugin** in Railway
2. Update `search-service` to use Elasticsearch instead of Solr

---

## Spring Microservices Deployment

### Step 1: Prepare Each Microservice

Railway deploys each service separately. You have 9 services:

1. **api-gateway** (Port: 8080)
2. **user-service** (Port: 8081)
3. **product-service** (Port: 8082)
4. **order-service** (Port: 8083)
5. **payment-service** (Port: 8084)
6. **cart-service** (Port: 8085)
7. **admin-service** (Port: 8086)
8. **search-service** (Port: 8087)
9. **email-service** (Port: 8088)
10. **notification-service** (Port: 8089)
11. **messaging-service** (Port: 8090)

### Step 2: Create Individual Dockerfiles

Railway works best with individual Dockerfiles per service.

**Create** `backend/api-gateway/Dockerfile`:
```dockerfile
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app

# Copy parent pom and common module
COPY backend/pom.xml ./
COPY backend/common ./common

# Copy service
COPY backend/api-gateway ./api-gateway

# Build
WORKDIR /app/api-gateway
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/api-gateway/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Repeat for each service** (user-service, product-service, etc.)

### Step 3: Add Services to Railway

For **EACH microservice**:

1. **Add New Service**:
   - Click **"+ New"** → **"GitHub Repo"**
   - Select your repo
   - Railway detects the Dockerfile

2. **Configure Build Settings**:
   - **Root Directory**: `backend/api-gateway` (change per service)
   - **Dockerfile Path**: `backend/api-gateway/Dockerfile`
   - **Port**: `8080` (change per service - Railway uses $PORT variable)

3. **Environment Variables**:
   ```
   # Database
   SPRING_DATASOURCE_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}
   SPRING_DATASOURCE_USERNAME=${{MySQL.MYSQLUSER}}
   SPRING_DATASOURCE_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   
   # Service Port (Railway provides PORT)
   SERVER_PORT=${PORT}
   
   # Other service URLs (if using service discovery)
   USER_SERVICE_URL=https://user-service.railway.app
   PRODUCT_SERVICE_URL=https://product-service.railway.app
   ORDER_SERVICE_URL=https://order-service.railway.app
   ```

4. **Service-Specific Variables**:
   
   **For payment-service**:
   ```
   STRIPE_SECRET_KEY=your_stripe_key
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

   **For search-service**:
   ```
   SOLR_URL=https://your-solr-instance.railway.app/solr
   ```

   **For email-service**:
   ```
   SPRING_MAIL_HOST=smtp.gmail.com
   SPRING_MAIL_PORT=587
   SPRING_MAIL_USERNAME=your-email@gmail.com
   SPRING_MAIL_PASSWORD=your-app-password
   ```

### Step 4: Service Discovery Configuration

Since Railway doesn't have built-in service discovery, you have 2 options:

**Option A: Hardcode URLs** (Simple)
```yaml
# application.yml for api-gateway
microservices:
  user-service: https://user-service-production.up.railway.app
  product-service: https://product-service-production.up.railway.app
  order-service: https://order-service-production.up.railway.app
```

**Option B: Use Environment Variables** (Recommended)
```yaml
# application.yml
microservices:
  user-service: ${USER_SERVICE_URL}
  product-service: ${PRODUCT_SERVICE_URL}
  order-service: ${ORDER_SERVICE_URL}
```

Then set in Railway:
```
USER_SERVICE_URL=https://user-service-production.up.railway.app
```

### Step 5: Update application.properties

Modify each service's `application.properties` to use Railway environment variables:

```properties
# Database
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

# Server
server.port=${SERVER_PORT:8080}

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Logging
logging.level.root=INFO
logging.level.com.b2b.marketplace=${LOG_LEVEL:INFO}
```

---

## Frontend Deployment

### Step 1: Configure Vite for Production

Update `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  preview: {
    port: process.env.PORT || 5173,
    host: '0.0.0.0'
  }
})
```

### Step 2: Create Frontend Dockerfile

Create `Dockerfile.frontend`:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 3: Create nginx.conf

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://api-gateway-production.up.railway.app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Step 4: Deploy Frontend to Railway

1. **Add New Service**: **"frontend"**
2. **Settings**:
   - **Dockerfile Path**: `Dockerfile.frontend`
   - **Port**: `80`

3. **Environment Variables**:
   ```
   VITE_API_URL=https://api-gateway-production.up.railway.app/api
   NODE_ENV=production
   ```

4. **Update API Config**:
   
   Update `src/config/api.js`:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
   export default API_URL;
   ```

---

## Simplified Railway Deployment (Monorepo Approach)

### Alternative: Use railway.json for Multi-Service

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.backend"
  },
  "deploy": {
    "startCommand": "java -jar /app/target/api-gateway.jar",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Create Unified Dockerfile

Create `Dockerfile.railway`:
```dockerfile
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app

# Copy entire backend
COPY backend ./

# Build all services
RUN mvn clean install -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy all JARs
COPY --from=build /app/api-gateway/target/*.jar ./api-gateway.jar
COPY --from=build /app/user-service/target/*.jar ./user-service.jar
COPY --from=build /app/product-service/target/*.jar ./product-service.jar
COPY --from=build /app/order-service/target/*.jar ./order-service.jar
COPY --from=build /app/payment-service/target/*.jar ./payment-service.jar
COPY --from=build /app/cart-service/target/*.jar ./cart-service.jar
COPY --from=build /app/admin-service/target/*.jar ./admin-service.jar
COPY --from=build /app/search-service/target/*.jar ./search-service.jar
COPY --from=build /app/email-service/target/*.jar ./email-service.jar

# Start command will be set per service
EXPOSE 8080
```

Then for each service in Railway, set **Custom Start Command**:
- API Gateway: `java -jar api-gateway.jar`
- User Service: `java -jar user-service.jar`
- etc.

---

## Environment Variables

### Global Variables (Shared)

```bash
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://containers-us-west-123.railway.app:7891/railway
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=generated-password

# JPA
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false

# Logging
LOG_LEVEL=INFO
SPRING_PROFILES_ACTIVE=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=86400000
```

### Service-Specific Variables

**API Gateway**:
```bash
SERVER_PORT=${PORT}
CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app
```

**Payment Service**:
```bash
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
```

**Search Service**:
```bash
SOLR_URL=https://your-solr.railway.app/solr
SOLR_COLLECTION=products
```

**Email Service**:
```bash
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=noreply@yourdomain.com
SPRING_MAIL_PASSWORD=your-app-specific-password
```

---

## Cost Optimization

### Railway Pricing (as of 2024)
- **Free Tier**: $5 credit/month (limited)
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage

**Estimated Costs** (Hobby Plan):
- MySQL: ~$10-15/month
- Solr: ~$15-20/month
- 9 Microservices: ~$50-80/month (if always on)
- Frontend: ~$5/month
- **Total**: ~$80-120/month

### Cost Reduction Strategies

1. **Combine Services** (Not recommended but cheaper):
   - Deploy only critical services initially
   - Combine email/notification into one service

2. **Use External Database**:
   - PlanetScale (Free tier: 5GB)
   - Clever Cloud MySQL (Free tier: 256MB)
   - Supabase PostgreSQL (Free tier)

3. **Use Managed Solr/Search**:
   - Replace Solr with Algolia (Free tier: 10k requests/month)
   - Use Meilisearch Cloud (cheaper than Solr)

4. **Service Optimization**:
   - Set sleep policies for non-critical services
   - Scale down memory/CPU for less-used services

5. **Alternative: Use Single VPS**:
   - Deploy all services to DigitalOcean Droplet ($12/month)
   - Use Docker Compose
   - Cheaper but requires manual management

---

## Deployment Steps Summary

### Quick Start Checklist

- [ ] **1. Sign up for Railway** and create new project
- [ ] **2. Deploy MySQL**:
  - Add MySQL plugin
  - Run schema migrations
- [ ] **3. Deploy Solr** (or use external):
  - Create Solr service
  - Configure core
- [ ] **4. Deploy Microservices** (in order):
  - [ ] API Gateway (first)
  - [ ] User Service
  - [ ] Product Service
  - [ ] Cart Service
  - [ ] Order Service
  - [ ] Payment Service
  - [ ] Search Service
  - [ ] Admin Service
  - [ ] Email Service
  - [ ] Notification Service
  - [ ] Messaging Service
- [ ] **5. Deploy Frontend**:
  - Build with Vite
  - Deploy with Nginx
  - Configure API_URL
- [ ] **6. Configure Environment Variables**
- [ ] **7. Test all endpoints**
- [ ] **8. Set up custom domain** (optional)

---

## Testing Your Deployment

### 1. Health Checks

Test each service:
```bash
# API Gateway
curl https://api-gateway-production.up.railway.app/actuator/health

# User Service
curl https://user-service-production.up.railway.app/actuator/health

# Product Service
curl https://product-service-production.up.railway.app/actuator/health
```

### 2. Database Connection

```bash
# Check database from any service
curl https://api-gateway-production.up.railway.app/api/health/db
```

### 3. Frontend Test

Visit: `https://your-frontend.up.railway.app`

---

## Troubleshooting

### Common Issues

**1. Service won't start**:
- Check logs in Railway dashboard
- Verify environment variables
- Ensure PORT is set correctly

**2. Database connection failed**:
- Verify MySQL is running
- Check SPRING_DATASOURCE_URL format
- Ensure MySQL allows external connections

**3. Out of memory**:
- Increase service memory in Railway settings
- Add JVM options: `-Xmx512m -Xms256m`

**4. 502 Bad Gateway**:
- Service crashed or not listening on PORT
- Check if PORT env variable is used
- Verify Dockerfile EXPOSE matches

---

## Next Steps

1. **Add Health Endpoints** to all services
2. **Set up Monitoring** (Railway Analytics or external)
3. **Configure CI/CD** (Railway auto-deploys on git push)
4. **Add Custom Domain**
5. **Set up SSL** (Railway provides free SSL)
6. **Configure Rate Limiting**
7. **Set up Logging** (Railway Logs or external like DataDog)

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

## Alternative Cloud Platforms

If Railway is too expensive:

1. **Render.com** (Similar pricing, better free tier)
2. **Fly.io** (Good for microservices)
3. **AWS ECS/EKS** (More complex, scalable)
4. **DigitalOcean App Platform** (Simpler, cheaper)
5. **Heroku** (Classic but expensive)
6. **Azure Container Apps** (Good for enterprise)

Would you like me to create deployment scripts for any specific platform?
