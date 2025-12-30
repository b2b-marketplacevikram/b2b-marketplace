# B2B Marketplace - Infrastructure & Deployment Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [AWS Infrastructure](#aws-infrastructure)
3. [Azure Infrastructure](#azure-infrastructure)
4. [Free Tools Stack](#free-tools-stack)
5. [Recommended Stack by Scale](#recommended-stack-by-scale)
6. [Cost Comparison](#cost-comparison)
7. [Migration Path](#migration-path)

---

## System Requirements

### Your Scale
| Metric | Count | Implications |
|--------|-------|--------------|
| Products | 100,000 | Medium catalog, needs good search |
| Suppliers | 50,000 | High concurrent logins, many dashboards |
| Estimated Buyers | 200,000+ | Heavy read traffic |
| Daily Orders | ~5,000-10,000 | Transaction heavy |

### Data Estimates
| Data Type | Size Calculation | Total |
|-----------|------------------|-------|
| Products | 100K × 5KB | ~500MB |
| Suppliers | 50K × 2KB | ~100MB |
| Users | 200K × 1KB | ~200MB |
| Orders & Transactions | Growth | ~1GB/month |
| Product Images | 100K × 500KB avg | ~50GB |
| **Total Database** | | **~2-3GB** |
| **Total Storage** | | **~50-100GB** |

---

## AWS Infrastructure

### Architecture Diagram
```
                           ┌─────────────────────────────────────┐
                           │         Route 53 (DNS)              │
                           └──────────────────┬──────────────────┘
                                              │
                           ┌──────────────────▼──────────────────┐
                           │      CloudFront (CDN)               │
                           │   - Static assets (React build)     │
                           │   - Product images                  │
                           └──────────────────┬──────────────────┘
                                              │
                           ┌──────────────────▼──────────────────┐
                           │   Application Load Balancer (ALB)   │
                           │        - SSL Termination            │
                           │        - Health Checks              │
                           └──────────────────┬──────────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              │                               │                               │
    ┌─────────▼─────────┐         ┌──────────▼──────────┐         ┌──────────▼──────────┐
    │   ECS/EKS Cluster │         │   ECS/EKS Cluster   │         │   ECS/EKS Cluster   │
    │   User Service    │         │   Product Service   │         │   Order Service     │
    │   (2-4 instances) │         │   (3-6 instances)   │         │   (2-4 instances)   │
    └─────────┬─────────┘         └──────────┬──────────┘         └──────────┬──────────┘
              │                               │                               │
              └───────────────────────────────┼───────────────────────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              │                               │                               │
    ┌─────────▼─────────┐         ┌──────────▼──────────┐         ┌──────────▼──────────┐
    │   ElastiCache     │         │   RDS MySQL         │         │   OpenSearch/Solr   │
    │   (Redis)         │         │   (Primary+Replica) │         │   (3-node cluster)  │
    │   Session/Cache   │         │   Main Database     │         │   Product Search    │
    └───────────────────┘         └─────────────────────┘         └─────────────────────┘
```

### AWS Service Specifications

#### EC2/ECS Instances
| Service | Instance Type | vCPU | RAM | Count | Monthly Cost |
|---------|--------------|------|-----|-------|--------------|
| User Service | t3.medium | 2 | 4GB | 2-3 | $60-90 |
| Product Service | t3.large | 2 | 8GB | 3-4 | $180-240 |
| Order Service | t3.medium | 2 | 4GB | 2-3 | $60-90 |
| Payment Service | t3.medium | 2 | 4GB | 2 | $60 |
| Search Service | t3.large | 2 | 8GB | 2 | $120 |
| Notification Service | t3.small | 2 | 2GB | 1-2 | $15-30 |

#### Database (RDS MySQL)
| Configuration | Specification | Reason |
|--------------|---------------|--------|
| Instance | `db.r6g.xlarge` | 4 vCPU, 32GB RAM |
| Storage | 500GB gp3 SSD | Fast IOPS, expandable |
| IOPS | 12,000 provisioned | For high transactions |
| Multi-AZ | ✅ Yes | High availability |
| Read Replica | 1-2 replicas | Offload read queries |
| Backup | 7 days retention | Point-in-time recovery |

#### Search Engine (OpenSearch)
| Configuration | Specification |
|--------------|---------------|
| Instance | `r6g.large.search` |
| Nodes | 3 (Master) + 2 (Data) |
| Storage | 200GB EBS per node |
| Dedicated Master | Yes (t3.small.search × 3) |

#### Caching (ElastiCache Redis)
| Configuration | Specification | Purpose |
|--------------|---------------|---------|
| Instance | `cache.r6g.large` | 13GB RAM |
| Nodes | 2 (Primary + Replica) | High availability |
| Cluster Mode | Enabled | Horizontal scaling |

### AWS Pricing (US East vs India Mumbai)

| Service | US East (us-east-1) | India (ap-south-1) | Savings |
|---------|--------------------|--------------------|---------|
| t3.large EC2 | $0.0832/hr | $0.0736/hr | 12% |
| r6g.xlarge EC2 | $0.2016/hr | $0.1792/hr | 11% |
| db.r6g.xlarge RDS | $0.48/hr | $0.426/hr | 11% |
| OpenSearch r6g.large | $0.167/hr | $0.148/hr | 11% |
| ElastiCache r6g.large | $0.214/hr | $0.190/hr | 11% |
| Data Transfer (out) | $0.09/GB | $0.1093/GB | -21% ❌ |
| S3 Storage | $0.023/GB | $0.023/GB | Same |

### AWS Monthly Cost Summary

| Traffic Level | US East | India (Mumbai) | Monthly Savings |
|--------------|---------|----------------|-----------------|
| Low | $1,450 | $1,280 | $170 (₹14,000) |
| Medium | $2,120 | $1,890 | $230 (₹19,000) |
| High | $3,100 | $2,750 | $350 (₹29,000) |

### Recommended AWS Configuration (India)
```yaml
Region: ap-south-1 (Mumbai)

EC2/ECS:
  user-service:    t3.medium × 2    # ₹3,900/month
  product-service: t3.large × 3     # ₹9,700/month
  order-service:   t3.medium × 2    # ₹3,900/month
  payment-service: t3.medium × 2    # ₹3,900/month

RDS MySQL:
  instance: db.r6g.xlarge           # ₹23,000/month
  read_replica: 1                   # ₹23,000/month
  storage: 500GB gp3                # ₹3,500/month

OpenSearch:
  data_nodes: r6g.large × 3         # ₹24,000/month
  master_nodes: t3.small × 3        # ₹3,000/month

ElastiCache:
  redis: cache.r6g.large × 2        # ₹10,000/month

S3 + CloudFront:                    # ₹8,000/month

Total: ~₹1,16,000/month (~$1,400)
```

---

## Azure Infrastructure

### Architecture Diagram
```
                           ┌─────────────────────────────────────┐
                           │      Azure Front Door (CDN + WAF)   │
                           └──────────────────┬──────────────────┘
                                              │
                           ┌──────────────────▼──────────────────┐
                           │      Application Gateway (L7 LB)    │
                           └──────────────────┬──────────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              │                               │                               │
    ┌─────────▼─────────┐         ┌──────────▼──────────┐         ┌──────────▼──────────┐
    │   AKS / App Svc   │         │   AKS / App Svc     │         │   AKS / App Svc     │
    │   User Service    │         │   Product Service   │         │   Order Service     │
    │   (2-4 replicas)  │         │   (3-6 replicas)    │         │   (2-4 replicas)    │
    └─────────┬─────────┘         └──────────┬──────────┘         └──────────┬──────────┘
              │                               │                               │
              └───────────────────────────────┼───────────────────────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              │                               │                               │
    ┌─────────▼─────────┐         ┌──────────▼──────────┐         ┌──────────▼──────────┐
    │   Azure Cache     │         │   Azure MySQL       │         │   Azure Cognitive   │
    │   for Redis       │         │   Flexible Server   │         │   Search            │
    │                   │         │   (Primary+Replica) │         │   (Product Search)  │
    └───────────────────┘         └─────────────────────┘         └─────────────────────┘
```

### Azure Pricing Comparison

| Service | AWS Mumbai | Azure India | Winner |
|---------|------------|-------------|--------|
| VM (4 vCPU, 16GB) | $0.179/hr | $0.166/hr | Azure 7% |
| MySQL DB (4 vCPU, 32GB) | $0.426/hr | $0.408/hr | Azure 4% |
| Redis Cache (13GB) | $0.190/hr | $0.211/hr | AWS 11% |
| Search (Cognitive Search) | $0.148/hr | $0.101/hr | Azure 32% |
| Blob Storage | $0.023/GB | $0.020/GB | Azure 13% |
| Load Balancer | $22/month | $18/month | Azure 18% |

### Azure Monthly Cost (India Central)

| Component | Specification | Monthly Cost (₹) | Monthly Cost ($) |
|-----------|--------------|------------------|------------------|
| AKS Cluster | 3 nodes × D4s v3 | ₹27,000 | $325 |
| App Services (Alt) | 4 × P1v3 | ₹32,000 | $385 |
| Azure MySQL Flexible | D4ds v4 + Replica | ₹38,000 | $460 |
| Azure Cognitive Search | S1 (Standard) | ₹20,000 | $240 |
| Azure Cache for Redis | C3 Premium | ₹18,000 | $215 |
| Blob Storage | 500GB + CDN | ₹1,500 | $18 |
| Application Gateway | WAF v2 | ₹15,000 | $180 |
| Azure Front Door | Standard | ₹4,000 | $48 |
| Azure Monitor | Logs + Metrics | ₹3,000 | $36 |
| Other (DNS, Secrets) | | ₹2,000 | $24 |
| **Total** | | **₹1,28,500** | **$1,550** |

### AWS vs Azure Final Comparison

| Component | AWS Mumbai | Azure India | Difference |
|-----------|------------|-------------|------------|
| Compute (8-10 VMs) | ₹44,000 | ₹40,000 | Azure -9% |
| Database (MySQL) | ₹49,500 | ₹38,000 | Azure -23% |
| Search Engine | ₹27,000 | ₹20,000 | Azure -26% |
| Redis Cache | ₹10,000 | ₹18,000 | AWS -44% |
| CDN + Load Balancer | ₹10,000 | ₹19,000 | AWS -47% |
| Storage | ₹8,000 | ₹5,500 | Azure -31% |
| Monitoring | ₹4,000 | ₹3,000 | Azure -25% |
| **Total** | **₹1,52,500** | **₹1,43,500** | **Azure -6%** |

### When to Choose Which

| If You Have... | Choose |
|----------------|--------|
| Existing Microsoft licenses (O365, Windows Server) | **Azure** |
| AWS experience / team skills | **AWS** |
| Need best search capabilities | **Azure** (Cognitive Search) |
| Cost-sensitive, need Redis heavily | **AWS** |
| Startup (free credits) | Azure ($200) or AWS ($100) |
| Already using GitHub Actions | **Azure** |

---

## Free Tools Stack

### Hosting & Infrastructure

| Service | Free Tier | Good For |
|---------|-----------|----------|
| Railway.app | $5/month credit | Backend services |
| Render.com | 750 hrs/month | Spring Boot APIs |
| Vercel | Unlimited | React frontend |
| Netlify | 100GB bandwidth | Static hosting |
| Fly.io | 3 shared VMs | Microservices |
| Oracle Cloud | 2 VMs forever free | Backend + DB |
| Google Cloud | $300 credits (90 days) | Full stack |
| Azure | $200 credits (30 days) | Full stack |

### Database

| Tool | Free Limit | Use Case |
|------|------------|----------|
| PlanetScale | 5GB, 1B reads/month | MySQL (serverless) |
| Supabase | 500MB, 2GB bandwidth | PostgreSQL + Auth |
| Neon | 3GB storage | PostgreSQL |
| MongoDB Atlas | 512MB | NoSQL |
| CockroachDB | 5GB | Distributed SQL |
| TiDB Cloud | 5GB | MySQL compatible |

### Search Engine

| Tool | Free Limit | Features |
|------|------------|----------|
| Meilisearch Cloud | 10K docs | Fast, typo-tolerant |
| Typesense Cloud | 100K docs | Instant search |
| Algolia | 10K records, 10K searches | Best UX |
| Self-hosted Solr | Unlimited | Your own server |

### Email Service

| Tool | Free Limit | Use Case |
|------|------------|----------|
| Resend | 3,000 emails/month | Transactional |
| Brevo (Sendinblue) | 300 emails/day | Marketing + Trans |
| Mailgun | 5,000 emails/month | Transactional |
| Amazon SES | 62,000/month (from EC2) | High volume |

### Payment Gateway

| Tool | Transaction Fee | Features |
|------|-----------------|----------|
| Razorpay | 2% per txn | ✅ Already integrated |
| Stripe | 2.9% + ₹2 | Global |
| PayU | 2% per txn | India focused |
| Cashfree | 1.9% per txn | Low fees |

### Analytics & Monitoring

| Tool | Free Limit | Use Case |
|------|------------|----------|
| Google Analytics 4 | Unlimited | User analytics |
| Plausible | Self-hosted free | Privacy-focused |
| Grafana Cloud | 10K metrics | Dashboards |
| New Relic | 100GB/month | APM |
| Sentry | 5K errors/month | Error tracking |
| LogRocket | 1K sessions/month | Session replay |

### Push Notifications

| Tool | Free Limit | Use Case |
|------|------------|----------|
| Firebase FCM | Unlimited | Mobile + Web |
| OneSignal | Unlimited (mobile) | Multi-platform |
| Pusher Beams | 1K devices | Simple setup |

### Real-time Chat/Messaging

| Tool | Free Limit | Use Case |
|------|------------|----------|
| Pusher | 200K messages/day | WebSockets |
| Ably | 6M messages/month | Realtime |
| Socket.io | Self-hosted free | Your own server |

### Image Storage & CDN

| Tool | Free Limit | Features |
|------|------------|----------|
| Cloudinary | 25GB + 25K transforms | Image optimization |
| ImageKit | 20GB bandwidth | Smart cropping |
| Cloudflare R2 | 10GB storage | No egress fees! |
| Backblaze B2 | 10GB storage | Cheap |

### DevOps & CI/CD

| Tool | Free Limit | Use Case |
|------|------------|----------|
| GitHub Actions | 2K mins/month | CI/CD |
| GitLab CI | 400 mins/month | CI/CD |
| Docker Hub | Unlimited public | Container registry |

---

## Recommended Stack by Scale

### 🆓 Free Tier (0-10K users, $0/month)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FREE TIER STACK ($0/month)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Frontend:     Vercel          (React + Vite)                  │
│   Backend:      Railway.app     (Spring Boot microservices)     │
│   Database:     PlanetScale     (5GB MySQL - JPA compatible)    │
│   Search:       Typesense       (100K products - perfect!)      │
│   Images:       Cloudflare R2   (10GB, No egress fees)          │
│   Cache:        Upstash Redis   (10K commands/day)              │
│   Email:        Resend          (3K emails/month)               │
│   Push:         Firebase FCM    (Unlimited)                     │
│   Payment:      Razorpay        (Already integrated) ✅         │
│   Monitoring:   Sentry          (5K errors/month)               │
│   Analytics:    Google GA4      (Unlimited)                     │
│                                                                  │
│   TOTAL COST:   $0/month                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 💰 Startup Tier (10K-50K users, ~$100/month)

```
┌─────────────────────────────────────────────────────────────────┐
│                 STARTUP TIER (~$100/month)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Frontend:     Vercel Pro      ($20/month)                     │
│   Backend:      Railway Pro     ($20/month)                     │
│   Database:     PlanetScale     (Scaler $29/month)              │
│   Search:       Typesense       (Free 100K docs)                │
│   Images:       Cloudflare R2   ($5-10/month for extra)         │
│   Cache:        Upstash Redis   (Pay-as-you-go ~$10)            │
│   Email:        Resend          ($20/month - 50K emails)        │
│   Push:         Firebase FCM    (Free)                          │
│                                                                  │
│   TOTAL COST:   ~$100-120/month                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🚀 Growth Tier (50K-200K users, ~$500/month)

```
┌─────────────────────────────────────────────────────────────────┐
│                  GROWTH TIER (~$500/month)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Frontend:     Vercel Pro      ($20/month)                     │
│   Backend:      DigitalOcean    (4 Droplets - $100/month)       │
│   Database:     DigitalOcean    (Managed MySQL - $100/month)    │
│   Search:       Typesense       ($99/month - 500K docs)         │
│   Images:       Cloudflare R2   ($20/month)                     │
│   Cache:        DigitalOcean    (Managed Redis - $50/month)     │
│   Email:        Resend          ($50/month)                     │
│   CDN:          Cloudflare      (Pro $20/month)                 │
│                                                                  │
│   TOTAL COST:   ~$450-550/month                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 🏢 Enterprise Tier (200K+ users, ~$1,500-2,500/month)

```
┌─────────────────────────────────────────────────────────────────┐
│               ENTERPRISE TIER ($1,500-2,500/month)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   OPTION A: AWS Mumbai                                          │
│   ├─ ECS/EKS Cluster           ($400-600/month)                │
│   ├─ RDS MySQL + Replica       ($400-600/month)                │
│   ├─ OpenSearch                ($300-450/month)                │
│   ├─ ElastiCache Redis         ($200-250/month)                │
│   ├─ S3 + CloudFront           ($70-120/month)                 │
│   └─ Other services            ($80-100/month)                 │
│   Total: ₹1,16,000 (~$1,400)                                   │
│                                                                  │
│   OPTION B: Azure India                                         │
│   ├─ AKS Cluster               ($325/month)                    │
│   ├─ Azure MySQL Flexible      ($460/month)                    │
│   ├─ Cognitive Search          ($240/month)                    │
│   ├─ Azure Redis               ($215/month)                    │
│   ├─ Blob + Front Door         ($66/month)                     │
│   └─ Other services            ($60/month)                     │
│   Total: ₹1,28,500 (~$1,550)                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cost Comparison Summary

| Scale | Free Stack | DigitalOcean | AWS India | Azure India |
|-------|------------|--------------|-----------|-------------|
| **0-10K users** | $0 | $50 | $200 | $200 |
| **10K-50K users** | $100 | $150 | $500 | $550 |
| **50K-200K users** | N/A | $500 | $1,200 | $1,300 |
| **200K+ users** | N/A | $1,000 | $1,400 | $1,550 |

---

## Migration Path

### Phase 1: Launch (Free)
```
Vercel + Railway + PlanetScale + Typesense + Cloudflare R2
Cost: $0/month
Capacity: Up to 100K products, 10K users
```

### Phase 2: Growth
```
When you hit limits:
├─ > 100K products → Upgrade Typesense ($29/mo)
├─ > 5GB database → Upgrade PlanetScale ($29/mo)
├─ > 10GB images → Pay Cloudflare R2 (~$5/mo)
├─ Heavy traffic → Upgrade Railway ($20/mo)
Total: ~$83/month
```

### Phase 3: Scale
```
When you need more control:
├─ Migrate to DigitalOcean/AWS/Azure
├─ Set up Kubernetes (EKS/AKS)
├─ Add read replicas
├─ Implement auto-scaling
Total: $500-1,500/month
```

### Phase 4: Enterprise
```
When you need enterprise features:
├─ Multi-region deployment
├─ Disaster recovery
├─ 99.99% SLA
├─ Dedicated support
Total: $2,000-5,000/month
```

---

## Quick Start: Free Stack Deployment

### 1. Deploy Frontend to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd c:\b2b_sample
vercel
```

### 2. Deploy Backend to Railway
```bash
# Connect GitHub repo to Railway
# Set environment variables:
# - SPRING_DATASOURCE_URL=mysql://...
# - JWT_SECRET=your-secret
# - RAZORPAY_KEY_ID=rzp_test_xxx
```

### 3. Create PlanetScale Database
```bash
# Create database at planetscale.com
# Get connection string
# Update Spring Boot application.properties
```

### 4. Set Up Typesense Search
```bash
# Create cluster at cloud.typesense.org
# Index products
# Update search service
```

### 5. Configure Cloudflare R2
```bash
# Create R2 bucket
# Set up CORS
# Update image upload service
```

---

## Conclusion

### For Your B2B Marketplace (100K Products, 50K Suppliers)

| Recommendation | Best Choice | Monthly Cost |
|----------------|-------------|--------------|
| **Starting Out** | Free Stack (Vercel + Railway + PlanetScale + Typesense) | **$0** |
| **Growing** | DigitalOcean or AWS India | **$500-1,000** |
| **Scaled** | AWS Mumbai or Azure India | **$1,400-1,600** |

### Key Takeaways

1. **Start Free** - Use Vercel, Railway, PlanetScale, Typesense
2. **India Region** - 10-15% cheaper than US regions
3. **Typesense** - Perfect for 100K products (free tier!)
4. **PlanetScale** - MySQL compatible, works with JPA
5. **Cloudflare R2** - No egress fees for images
6. **Razorpay** - Already integrated ✅

---

*Document created: December 28, 2025*
*Last updated: December 28, 2025*
