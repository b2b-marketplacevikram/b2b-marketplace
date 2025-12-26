# EC2 Step-by-Step Setup Guide

## Step 1: Create EC2 Instance

### 1.1 Go to AWS Console
1. Login to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **EC2** → **Instances** → **Launch Instance**

### 1.2 Configure Instance
| Setting | Value |
|---------|-------|
| Name | `b2b-marketplace` |
| AMI | Amazon Linux 2023 |
| Instance Type | `t3.medium` (2 vCPU, 4GB RAM) |
| Key Pair | Create new or select existing |
| Storage | 30 GB gp3 |

### 1.3 Network Settings (Security Group)
Create a new security group with these rules:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | Your IP | SSH access |
| HTTP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | 443 | 0.0.0.0/0 | Secure web |
| Custom TCP | 8081-8091 | 0.0.0.0/0 | Backend APIs |
| MySQL | 3306 | Security Group | Internal DB |

### 1.4 Launch Instance
Click **Launch Instance** and wait for it to start.

---

## Step 2: Connect to EC2

### Option A: Using Terminal (Mac/Linux)
```bash
# Set permissions on key file
chmod 400 your-key.pem

# Connect
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

### Option B: Using PuTTY (Windows)
1. Convert .pem to .ppk using PuTTYgen
2. Open PuTTY, enter `ec2-user@YOUR_EC2_PUBLIC_IP`
3. Go to Connection → SSH → Auth → Browse for .ppk file
4. Click Open

### Option C: EC2 Instance Connect
1. In AWS Console, select your instance
2. Click **Connect** → **EC2 Instance Connect**
3. Click **Connect**

---

## Step 3: Run Setup Script

Once connected to EC2:

```bash
# Download and run setup script
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/b2b-marketplace/main/scripts/ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh

# IMPORTANT: Logout and login again
exit
```

Then reconnect:
```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

---

## Step 4: Deploy Application

```bash
cd /home/ec2-user/b2b-marketplace

# Clone your repository
git clone https://github.com/YOUR_USERNAME/b2b-marketplace.git .

# Configure environment
nano .env
# Add your actual passwords and API keys

# Build and start all services
docker-compose up -d --build

# Watch the logs
docker-compose logs -f
```

---

## Step 5: Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Test endpoints
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost
```

Access in browser:
- Frontend: `http://YOUR_EC2_PUBLIC_IP`
- User API: `http://YOUR_EC2_PUBLIC_IP:8081/api`

---

## Step 6: Setup Domain (Optional)

### 6.1 Register Domain
- Use AWS Route 53 or any domain registrar (GoDaddy, Namecheap, etc.)

### 6.2 Create DNS Records
| Type | Name | Value |
|------|------|-------|
| A | @ | YOUR_EC2_PUBLIC_IP |
| A | www | YOUR_EC2_PUBLIC_IP |
| A | api | YOUR_EC2_PUBLIC_IP |

### 6.3 Wait for DNS Propagation
```bash
# Check if DNS is working
nslookup yourdomain.com
```

---

## Step 7: Setup SSL (HTTPS)

```bash
cd /home/ec2-user/b2b-marketplace

# Run SSL setup script
./scripts/ssl-setup.sh yourdomain.com
```

---

## Step 8: Setup CI/CD

### 8.1 Create GitHub Repository
```bash
# On your local machine
cd c:\b2b_sample
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/b2b-marketplace.git
git push -u origin main
```

### 8.2 Add GitHub Secrets
Go to your GitHub repo → Settings → Secrets and Variables → Actions

Add these secrets:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `EC2_HOST` | Your EC2 public IP or domain |
| `EC2_SSH_KEY` | Contents of your .pem file |
| `API_BASE_URL` | https://api.yourdomain.com |
| `STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key |
| `S3_BUCKET_NAME` | (Optional) S3 bucket for frontend |
| `CLOUDFRONT_DISTRIBUTION_ID` | (Optional) CloudFront ID |

### 8.3 Create AWS IAM User for CI/CD

1. Go to AWS Console → IAM → Users → Add User
2. Name: `github-actions`
3. Access type: Programmatic access
4. Attach policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonECS_FullAccess`
   - `AmazonS3FullAccess`

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs service-name
docker-compose down
docker-compose up -d --build
```

### Database connection error
```bash
# Check if MySQL is healthy
docker-compose ps mysql
docker-compose logs mysql
```

### Out of memory
```bash
# Check memory usage
free -m
docker stats

# Consider upgrading to t3.large
```

### Port already in use
```bash
sudo lsof -i :8081
sudo kill -9 PID
```

---

## Useful Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up -d --build user-service

# SSH into container
docker-compose exec user-service sh

# Check disk space
df -h

# Monitor resources
htop
```

---

## Cost Optimization Tips

1. **Use Reserved Instances** - Save up to 72% for 1-3 year commitment
2. **Enable Auto-Scaling** - Scale down during low traffic
3. **Use Spot Instances** - For non-production environments
4. **S3 for Static Files** - Cheaper than serving from EC2
5. **CloudFront** - Reduces origin requests and improves speed

---

## Security Best Practices

1. ✅ Use IAM roles instead of access keys when possible
2. ✅ Enable AWS CloudTrail for audit logging
3. ✅ Use AWS Secrets Manager for sensitive data
4. ✅ Regular security group audits
5. ✅ Enable automatic security updates
6. ✅ Use private subnets for database
7. ✅ Enable encryption at rest for RDS
