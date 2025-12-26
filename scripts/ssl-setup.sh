#!/bin/bash
# SSL Setup with Let's Encrypt for EC2
# Run this after your domain is pointing to your EC2 instance

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "Usage: ./ssl-setup.sh yourdomain.com"
    exit 1
fi

echo "=========================================="
echo "Setting up SSL for: $DOMAIN"
echo "=========================================="

# Install Certbot
echo "Installing Certbot..."
sudo yum install -y certbot python3-certbot-nginx || \
sudo amazon-linux-extras install epel -y && sudo yum install -y certbot

# Stop nginx temporarily
docker-compose stop frontend || true

# Get certificate
echo "Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email admin@$DOMAIN \
    -d $DOMAIN \
    -d www.$DOMAIN

# Create nginx SSL config
echo "Creating SSL nginx configuration..."
cat > nginx-ssl.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API Proxy
    location /api/ {
        proxy_pass http://user-service:8081/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # WebSocket for messaging
    location /ws-chat {
        proxy_pass http://messaging-service:8091/ws-chat;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

echo ""
echo "=========================================="
echo "SSL Setup Complete!"
echo "=========================================="
echo ""
echo "Update docker-compose.yml to mount certificates:"
echo ""
echo "frontend:"
echo "  volumes:"
echo "    - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf"
echo "    - /etc/letsencrypt:/etc/letsencrypt:ro"
echo "  ports:"
echo "    - '80:80'"
echo "    - '443:443'"
echo ""
echo "Then restart: docker-compose up -d"
echo ""
echo "Auto-renewal cron job:"
echo "sudo crontab -e"
echo "0 0 * * * certbot renew --quiet && docker-compose restart frontend"
echo ""
