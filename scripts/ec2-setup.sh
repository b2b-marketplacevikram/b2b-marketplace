#!/bin/bash
# EC2 Setup Script for B2B Marketplace
# Run this script after connecting to your EC2 instance

set -e

echo "=========================================="
echo "B2B Marketplace - EC2 Setup Script"
echo "=========================================="

# Update system
echo "Updating system packages..."
sudo yum update -y

# Install Docker
echo "Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "Installing Git..."
sudo yum install -y git

# Install AWS CLI (usually pre-installed on Amazon Linux)
echo "Verifying AWS CLI..."
aws --version || sudo yum install -y aws-cli

# Create application directory
echo "Creating application directory..."
mkdir -p /home/ec2-user/b2b-marketplace
cd /home/ec2-user/b2b-marketplace

# Create .env file template
cat > .env << 'EOF'
# Database
MYSQL_ROOT_PASSWORD=YourSecurePassword123!

# Stripe
STRIPE_SECRET_KEY=sk_live_your_key_here

# AWS
AWS_REGION=us-east-1
EOF

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Log out and log back in for Docker group to take effect:"
echo "   exit"
echo ""
echo "2. Clone your repository:"
echo "   cd /home/ec2-user/b2b-marketplace"
echo "   git clone https://github.com/YOUR_USERNAME/b2b-marketplace.git ."
echo ""
echo "3. Edit the .env file with your actual values:"
echo "   nano .env"
echo ""
echo "4. Start the application:"
echo "   docker-compose up -d --build"
echo ""
echo "5. Check status:"
echo "   docker-compose ps"
echo "   docker-compose logs -f"
echo ""
