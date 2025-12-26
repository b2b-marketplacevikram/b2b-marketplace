# B2B Marketplace - AWS Deployment Guide

## Deployment Architecture

```
                    ┌─────────────────┐
                    │   CloudFront    │
                    │   (CDN + SSL)   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐      ┌───────────▼───────────┐
    │    S3 Bucket      │      │  Application Load     │
    │  (React Frontend) │      │     Balancer (ALB)    │
    └───────────────────┘      └───────────┬───────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
          ┌─────────▼─────────┐  ┌────────▼────────┐   ┌────────▼────────┐
          │   ECS Fargate     │  │  ECS Fargate    │   │  ECS Fargate    │
          │  (User Service)   │  │(Product Service)│   │ (Other Services)│
          └─────────┬─────────┘  └────────┬────────┘   └────────┬────────┘
                    │                     │                     │
                    └─────────────────────┼─────────────────────┘
                                          │
                              ┌───────────▼───────────┐
                              │      RDS MySQL        │
                              │   (Multi-AZ Optional) │
                              └───────────────────────┘
```

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed locally
4. **Domain name** (optional, for custom domain)

## Quick Start (EC2 - Simplest Option)

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose:
   - **AMI**: Amazon Linux 2023
   - **Instance Type**: t3.medium (or t3.large for production)
   - **Storage**: 30 GB gp3
   - **Security Group**: Allow ports 22, 80, 443, 3306, 8081-8091

### Step 2: Connect and Setup

```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git

# Logout and login again for docker group
exit
```

### Step 3: Deploy Application

```bash
# Connect again
ssh -i your-key.pem ec2-user@your-ec2-ip

# Clone your repository
git clone https://github.com/YOUR_USERNAME/b2b-marketplace.git
cd b2b-marketplace

# Create environment file
cp .env.example .env
nano .env  # Edit with your values

# Build and run
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f
```

### Step 4: Access Application

- Frontend: http://your-ec2-ip
- User Service: http://your-ec2-ip:8081
- Product Service: http://your-ec2-ip:8082

---

## Production Deployment (ECS + RDS)

### Step 1: Create RDS MySQL Database

```bash
# Using AWS CLI
aws rds create-db-instance \
    --db-instance-identifier b2b-marketplace-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0 \
    --master-username admin \
    --master-user-password YourSecurePassword123! \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxx \
    --db-name b2b_marketplace \
    --backup-retention-period 7 \
    --multi-az false \
    --publicly-accessible false
```

### Step 2: Create ECR Repositories

```bash
# Create repositories for each service
aws ecr create-repository --repository-name b2b/frontend
aws ecr create-repository --repository-name b2b/user-service
aws ecr create-repository --repository-name b2b/product-service
aws ecr create-repository --repository-name b2b/order-service
aws ecr create-repository --repository-name b2b/payment-service
aws ecr create-repository --repository-name b2b/messaging-service
```

### Step 3: Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push frontend
docker build -f Dockerfile.frontend -t b2b/frontend .
docker tag b2b/frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/b2b/frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/b2b/frontend:latest

# Build and push user-service
docker build -f Dockerfile.backend --build-arg SERVICE_NAME=user-service -t b2b/user-service .
docker tag b2b/user-service:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/b2b/user-service:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/b2b/user-service:latest

# Repeat for other services...
```

### Step 4: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name b2b-marketplace-cluster
```

### Step 5: Deploy Frontend to S3 + CloudFront (Alternative)

```bash
# Build frontend
npm run build

# Create S3 bucket
aws s3 mb s3://b2b-marketplace-frontend

# Enable static website hosting
aws s3 website s3://b2b-marketplace-frontend --index-document index.html --error-document index.html

# Upload files
aws s3 sync dist/ s3://b2b-marketplace-frontend --delete

# Create CloudFront distribution (optional for HTTPS + CDN)
aws cloudfront create-distribution \
    --origin-domain-name b2b-marketplace-frontend.s3.amazonaws.com \
    --default-root-object index.html
```

---

## Cost Estimation (Monthly)

| Resource | Development | Production |
|----------|-------------|------------|
| EC2 (t3.medium) | $30 | $60 (t3.large) |
| RDS MySQL (t3.micro) | $15 | $50 (t3.small + Multi-AZ) |
| S3 + CloudFront | $5 | $20 |
| Data Transfer | $5 | $20 |
| **Total** | **~$55/month** | **~$150/month** |

---

## Security Best Practices

### 1. Environment Variables
Never commit secrets. Use AWS Secrets Manager or Parameter Store:

```bash
# Store secret
aws secretsmanager create-secret \
    --name b2b/stripe-key \
    --secret-string "sk_live_xxxxx"

# Retrieve in application
aws secretsmanager get-secret-value --secret-id b2b/stripe-key
```

### 2. Security Groups
```
Frontend SG:
- Inbound: 80, 443 from 0.0.0.0/0
- Outbound: All

Backend SG:
- Inbound: 8081-8091 from Frontend SG, ALB SG
- Outbound: All

Database SG:
- Inbound: 3306 from Backend SG only
- Outbound: None
```

### 3. HTTPS Setup
Use AWS Certificate Manager (ACM) for free SSL certificates:

```bash
aws acm request-certificate \
    --domain-name yourdomain.com \
    --subject-alternative-names "*.yourdomain.com" \
    --validation-method DNS
```

---

## CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker images
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |
          docker build -f Dockerfile.frontend -t $ECR_REGISTRY/b2b/frontend:latest .
          docker push $ECR_REGISTRY/b2b/frontend:latest
          
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster b2b-marketplace --service frontend --force-new-deployment
```

---

## Monitoring & Logging

### CloudWatch Setup
```bash
# Create log group
aws logs create-log-group --log-group-name /b2b-marketplace/backend

# View logs
aws logs tail /b2b-marketplace/backend --follow
```

### Health Checks
All services have `/actuator/health` endpoint for monitoring.

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs service-name
```

### Database connection issues
```bash
# Test connectivity
nc -zv your-rds-endpoint 3306
```

### Check running services
```bash
docker-compose ps
curl http://localhost:8081/actuator/health
```

---

## Quick Reference Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up -d --build user-service

# Scale service
docker-compose up -d --scale user-service=2

# SSH into container
docker-compose exec user-service sh
```
