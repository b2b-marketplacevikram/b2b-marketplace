# B2B Marketplace - Production Deployment Stack

## ✅ Final Recommended Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                   PRODUCTION STACK ($0/month)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Frontend:     Vercel          (React + Vite)                  │
│   Backend:      Railway.app     (Spring Boot microservices)     │
│   Database:     PlanetScale     (MySQL - JPA compatible)        │
│   Search:       Typesense       (100K products - perfect!)      │
│   Images:       Cloudflare R2   (No egress fees)                │
│   Cache:        Upstash Redis   (Sessions, hot data)            │
│   Email:        Resend          (Transactional)                 │
│   Push:         Firebase FCM    (Unlimited)                     │
│   Payment:      Razorpay        (Already integrated) ✅         │
│                                                                  │
│   TOTAL COST:   $0/month (up to 100K products)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │            INTERNET                  │
                    └──────────────────┬──────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     VERCEL      │         │   RAILWAY.app   │         │  CLOUDFLARE R2  │
│   (Frontend)    │         │   (Backend)     │         │   (Images/CDN)  │
│                 │         │                 │         │                 │
│  React + Vite   │ ──API──▶│ Spring Boot     │         │  Product Images │
│  Static Files   │         │ Microservices   │         │  User Avatars   │
│  Global CDN     │         │                 │         │  Documents      │
└─────────────────┘         └────────┬────────┘         └─────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   PLANETSCALE   │         │    TYPESENSE    │         │  UPSTASH REDIS  │
│   (Database)    │         │    (Search)     │         │    (Cache)      │
│                 │         │                 │         │                 │
│  MySQL 8.0      │         │  100K Products  │         │  Sessions       │
│  JPA Compatible │         │  Instant Search │         │  Hot Data       │
│  Serverless     │         │  Typo Tolerant  │         │  Rate Limiting  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                               │
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                │
│  │   RESEND    │    │ FIREBASE    │    │  RAZORPAY   │                │
│  │   (Email)   │    │ FCM (Push)  │    │  (Payment)  │                │
│  │             │    │             │    │             │                │
│  │ 3K/month    │    │ Unlimited   │    │ 2% per txn  │                │
│  └─────────────┘    └─────────────┘    └─────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Service Details & Free Limits

### 1. Vercel (Frontend Hosting)

| Feature | Free Limit |
|---------|------------|
| Deployments | Unlimited |
| Bandwidth | 100GB/month |
| Builds | 6000 minutes/month |
| Serverless Functions | 100GB-hrs |
| Edge Middleware | Included |
| Custom Domains | Unlimited |
| SSL/HTTPS | Automatic |

**URL**: https://vercel.com

### 2. Railway.app (Backend Hosting)

| Feature | Free Limit |
|---------|------------|
| Credit | $5/month |
| RAM | Up to 8GB |
| CPU | Shared |
| Deployments | Unlimited |
| Custom Domains | Included |
| SSL | Automatic |

**URL**: https://railway.app

### 3. PlanetScale (Database)

| Feature | Free Limit |
|---------|------------|
| Storage | 5GB |
| Row Reads | 1 Billion/month |
| Row Writes | 10 Million/month |
| Branches | 1 Production + 1 Dev |
| Connections | Unlimited |
| Regions | 1 |

**URL**: https://planetscale.com

### 4. Typesense (Search Engine)

| Feature | Free Limit |
|---------|------------|
| Documents | 100,000 |
| Searches | 1M/month |
| Memory | 256MB |
| Bandwidth | 50GB |
| Replicas | 1 |

**URL**: https://cloud.typesense.org

### 5. Cloudflare R2 (Image Storage)

| Feature | Free Limit |
|---------|------------|
| Storage | 10GB |
| Class A Ops | 1M/month |
| Class B Ops | 10M/month |
| Egress | **FREE** (unlimited) |

**URL**: https://cloudflare.com/r2

### 6. Upstash Redis (Cache)

| Feature | Free Limit |
|---------|------------|
| Commands | 10,000/day |
| Data Size | 256MB |
| Connections | 1,000 concurrent |
| Regions | Global |

**URL**: https://upstash.com

### 7. Resend (Email)

| Feature | Free Limit |
|---------|------------|
| Emails | 3,000/month |
| Domains | 1 |
| API Access | Included |

**URL**: https://resend.com

### 8. Firebase FCM (Push Notifications)

| Feature | Free Limit |
|---------|------------|
| Messages | **Unlimited** |
| Topics | Unlimited |
| Devices | Unlimited |

**URL**: https://firebase.google.com

### 9. Razorpay (Payment Gateway)

| Feature | Details |
|---------|---------|
| Setup Fee | FREE |
| Monthly Fee | FREE |
| Transaction Fee | 2% per transaction |
| Settlement | T+2 days |

**Status**: ✅ Already Integrated
- Key: `rzp_test_RwLvM9vyTCazm9`

---

## Setup Guide

### Step 1: Deploy Frontend to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Build and Deploy
cd c:\b2b_sample
npm run build
vercel --prod
```

**Environment Variables for Vercel:**
```env
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
VITE_RAZORPAY_KEY_ID=rzp_test_RwLvM9vyTCazm9
VITE_TYPESENSE_HOST=your-cluster.typesense.net
VITE_TYPESENSE_API_KEY=your-search-only-key
```

### Step 2: Create PlanetScale Database

```bash
# 1. Sign up at planetscale.com
# 2. Create database: b2b_marketplace
# 3. Get connection string

# Connection String Format:
mysql://username:password@host.planetscale.com/b2b_marketplace?ssl={"rejectUnauthorized":true}
```

**Spring Boot Configuration:**
```properties
# application.properties for PlanetScale
spring.datasource.url=jdbc:mysql://host.planetscale.com/b2b_marketplace?sslMode=VERIFY_IDENTITY
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# PlanetScale requires these settings
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
```

**Import Schema:**
```bash
# Use PlanetScale CLI or Console to import
pscale shell b2b_marketplace main < database/schema.sql
```

### Step 3: Deploy Backend to Railway

```bash
# 1. Connect GitHub repo to Railway
# 2. Railway will auto-detect Spring Boot

# Environment Variables for Railway:
SPRING_DATASOURCE_URL=jdbc:mysql://host.planetscale.com/b2b_marketplace?sslMode=VERIFY_IDENTITY
SPRING_DATASOURCE_USERNAME=your_planetscale_username
SPRING_DATASOURCE_PASSWORD=your_planetscale_password
JWT_SECRET=your-256-bit-secret-key-here
RAZORPAY_KEY_ID=rzp_test_RwLvM9vyTCazm9
RAZORPAY_KEY_SECRET=your_razorpay_secret
TYPESENSE_HOST=your-cluster.typesense.net
TYPESENSE_API_KEY=your_admin_key
REDIS_URL=redis://default:password@host.upstash.io:6379
RESEND_API_KEY=re_xxxxx
```

**Dockerfile for Railway:**
```dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY backend/user-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Step 4: Setup Typesense Search

```bash
# 1. Create cluster at cloud.typesense.org
# 2. Get API keys (Admin + Search-Only)

# Create products collection
curl -X POST 'https://your-cluster.typesense.net/collections' \
  -H 'X-TYPESENSE-API-KEY: your-admin-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "products",
    "fields": [
      {"name": "id", "type": "string"},
      {"name": "name", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "category", "type": "string", "facet": true},
      {"name": "supplierType", "type": "string", "facet": true},
      {"name": "unitPrice", "type": "float"},
      {"name": "moq", "type": "int32"},
      {"name": "supplierId", "type": "string"},
      {"name": "companyName", "type": "string"}
    ],
    "default_sorting_field": "unitPrice"
  }'
```

**React Integration (TypesenseInstantSearchAdapter):**
```bash
npm install typesense typesense-instantsearch-adapter
```

### Step 5: Setup Cloudflare R2

```bash
# 1. Login to Cloudflare Dashboard
# 2. Go to R2 > Create Bucket: b2b-marketplace-images

# Configure CORS for R2:
[
  {
    "AllowedOrigins": ["https://your-domain.vercel.app", "http://localhost:5173"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]

# Get R2 API credentials:
# - Account ID
# - Access Key ID
# - Secret Access Key
# - Bucket URL: https://your-bucket.r2.cloudflarestorage.com
```

**Spring Boot R2 Integration:**
```java
// Add AWS S3 SDK (R2 is S3-compatible)
// pom.xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.0</version>
</dependency>
```

### Step 6: Setup Upstash Redis

```bash
# 1. Create database at upstash.com
# 2. Get Redis URL

# Format: redis://default:password@hostname:port
```

**Spring Boot Redis Integration:**
```properties
# application.properties
spring.redis.url=redis://default:password@hostname.upstash.io:6379
spring.session.store-type=redis
```

### Step 7: Setup Resend Email

```bash
# 1. Sign up at resend.com
# 2. Verify domain
# 3. Get API key
```

**Spring Boot Resend Integration:**
```java
// Add to pom.xml
<dependency>
    <groupId>com.resend</groupId>
    <artifactId>resend-java</artifactId>
    <version>2.0.0</version>
</dependency>

// EmailService.java
@Service
public class EmailService {
    private final Resend resend = new Resend("re_xxxxx");
    
    public void sendOrderConfirmation(String to, Order order) {
        SendEmailRequest request = SendEmailRequest.builder()
            .from("orders@yourdomain.com")
            .to(to)
            .subject("Order Confirmed: " + order.getOrderNumber())
            .html("<h1>Thank you for your order!</h1>...")
            .build();
        resend.emails().send(request);
    }
}
```

### Step 8: Setup Firebase FCM

```bash
# 1. Create project at console.firebase.google.com
# 2. Enable Cloud Messaging
# 3. Download service account JSON
# 4. Add Firebase SDK to frontend
```

**React FCM Setup:**
```bash
npm install firebase
```

```javascript
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
```

---

## Production Checklist

### Before Launch

- [ ] **Vercel**
  - [ ] Deploy frontend
  - [ ] Configure custom domain
  - [ ] Set environment variables
  - [ ] Enable Analytics

- [ ] **Railway**
  - [ ] Deploy all microservices
  - [ ] Configure environment variables
  - [ ] Set up health checks
  - [ ] Configure custom domain

- [ ] **PlanetScale**
  - [ ] Create production database
  - [ ] Import schema
  - [ ] Import seed data
  - [ ] Enable query insights

- [ ] **Typesense**
  - [ ] Create products collection
  - [ ] Index all products
  - [ ] Configure search settings
  - [ ] Test search functionality

- [ ] **Cloudflare R2**
  - [ ] Create bucket
  - [ ] Configure CORS
  - [ ] Upload existing images
  - [ ] Test image upload/download

- [ ] **Upstash Redis**
  - [ ] Create database
  - [ ] Configure connection
  - [ ] Test session storage

- [ ] **Resend**
  - [ ] Verify domain
  - [ ] Create email templates
  - [ ] Test transactional emails

- [ ] **Firebase**
  - [ ] Create project
  - [ ] Configure FCM
  - [ ] Test push notifications

- [ ] **Razorpay**
  - [ ] Switch to live credentials
  - [ ] Test payment flow
  - [ ] Configure webhooks

### Security Checklist

- [ ] All API keys in environment variables
- [ ] JWT secret is strong (256-bit)
- [ ] CORS configured correctly
- [ ] HTTPS enabled on all endpoints
- [ ] Rate limiting configured
- [ ] SQL injection prevention (JPA)
- [ ] XSS prevention (React)

---

## Monitoring & Analytics

### Free Monitoring Tools

| Tool | Purpose | Free Limit |
|------|---------|------------|
| Vercel Analytics | Frontend metrics | 2,500 events/month |
| Railway Metrics | Backend monitoring | Included |
| PlanetScale Insights | Query analysis | Included |
| Sentry | Error tracking | 5,000 errors/month |
| Google Analytics | User analytics | Unlimited |

### Recommended Setup

```javascript
// Sentry for error tracking
npm install @sentry/react

// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@sentry.io/xxx",
  environment: import.meta.env.MODE,
});
```

---

## Scaling Guide

### When to Upgrade

| Trigger | Current Limit | Upgrade Path |
|---------|---------------|--------------|
| Database > 5GB | PlanetScale Free | PlanetScale Scaler ($29/mo) |
| Products > 100K | Typesense Free | Typesense Pro ($29/mo) |
| High traffic | Railway $5/mo | Railway Pro ($20/mo) |
| Images > 10GB | R2 Free | R2 Pay-as-you-go (~$0.015/GB) |
| Redis commands | Upstash Free | Upstash Pay-as-you-go |
| Emails > 3K/mo | Resend Free | Resend Pro ($20/mo) |

### Growth Milestones

| Users | Monthly Cost | Stack Changes |
|-------|--------------|---------------|
| 0-10K | $0 | Free tier everything |
| 10K-50K | $50-100 | Upgrade Railway + PlanetScale |
| 50K-100K | $200-300 | Add more Railway instances |
| 100K+ | $500+ | Consider AWS/Azure migration |

---

## Quick Reference

### URLs

| Service | Dashboard URL |
|---------|--------------|
| Vercel | https://vercel.com/dashboard |
| Railway | https://railway.app/dashboard |
| PlanetScale | https://app.planetscale.com |
| Typesense | https://cloud.typesense.org |
| Cloudflare | https://dash.cloudflare.com |
| Upstash | https://console.upstash.com |
| Resend | https://resend.com/dashboard |
| Firebase | https://console.firebase.google.com |
| Razorpay | https://dashboard.razorpay.com |

### Support

| Service | Documentation |
|---------|--------------|
| Vercel | https://vercel.com/docs |
| Railway | https://docs.railway.app |
| PlanetScale | https://docs.planetscale.com |
| Typesense | https://typesense.org/docs |
| Cloudflare R2 | https://developers.cloudflare.com/r2 |
| Upstash | https://docs.upstash.com |
| Resend | https://resend.com/docs |
| Firebase | https://firebase.google.com/docs |
| Razorpay | https://razorpay.com/docs |

---

## Summary

| Component | Service | Cost | Status |
|-----------|---------|------|--------|
| Frontend | Vercel | $0 | Ready to deploy |
| Backend | Railway | $0 | Ready to deploy |
| Database | PlanetScale | $0 | Ready to setup |
| Search | Typesense | $0 | Ready to setup |
| Images | Cloudflare R2 | $0 | Ready to setup |
| Cache | Upstash Redis | $0 | Ready to setup |
| Email | Resend | $0 | Ready to setup |
| Push | Firebase FCM | $0 | Ready to setup |
| Payment | Razorpay | 2%/txn | ✅ Integrated |

**Total Monthly Cost: $0** (up to 100K products, 50K suppliers)

---

*Document created: December 28, 2025*
*Stack validated for B2B Marketplace with 100K products, 50K suppliers*
