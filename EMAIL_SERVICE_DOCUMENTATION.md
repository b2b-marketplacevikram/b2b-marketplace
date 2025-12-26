# Email Service Documentation

## Overview
The Email Service is a dedicated microservice for handling all email communications in the B2B Marketplace platform. It provides templated emails for various scenarios including user registration, order confirmations, status updates, and password resets.

## Features
- **Templated Emails**: Professional HTML email templates using Thymeleaf
- **Multiple Email Types**: Registration, order confirmation, order status, password reset, supplier notifications
- **Email Logging**: Track all sent emails with status and error messages
- **Async Sending**: Non-blocking email delivery using @Async
- **Gmail SMTP Support**: Configured for Gmail with app-specific password support
- **Email Statistics**: Track sent, failed, and pending emails
- **Retry Mechanism**: Built-in retry count tracking for failed emails

## Architecture

### Port
- **8087** - Email Service HTTP port

### Components
1. **EmailService** - Core service for sending emails with template processing
2. **EmailController** - REST API endpoints for email operations
3. **EmailLog** - Entity for tracking email history
4. **EmailLogRepository** - JPA repository for email logs
5. **Templates** - Thymeleaf HTML templates for different email types

### Dependencies
- Spring Boot Mail (SMTP email sending)
- Spring Boot Thymeleaf (HTML templating)
- Spring Data JPA (email log persistence)
- MySQL (database storage)
- Spring Cloud OpenFeign (service-to-service communication)

## Email Templates

### 1. Registration Email
**Template:** `registration.html`
**Purpose:** Welcome new users and provide account activation link
**Variables:**
- `name` - User's full name
- `activationLink` - Account activation URL
- `supportEmail` - Support contact email

### 2. Order Confirmation Email
**Template:** `order-confirmation.html`
**Purpose:** Confirm order placement with full order details
**Variables:**
- `buyerName` - Customer name
- `orderNumber` - Order reference number
- `orderDate` - When order was placed
- `totalAmount` - Total order value
- `currency` - Currency code (USD, EUR, etc.)
- `items` - List of ordered items with details
- `shippingAddress` - Delivery address
- `paymentMethod` - Payment method used

### 3. Order Status Update Email
**Template:** `order-status.html`
**Purpose:** Notify customers of order status changes
**Variables:**
- `buyerName` - Customer name
- `orderNumber` - Order reference number
- `previousStatus` - Previous order status
- `currentStatus` - New order status
- `orderDate` - Order date
- `totalAmount` - Order value

**Status Badges:**
- PENDING (yellow)
- CONFIRMED (blue)
- PROCESSING (purple)
- SHIPPED (orange)
- DELIVERED (green)
- CANCELLED (red)

### 4. Password Reset Email
**Template:** `password-reset.html`
**Purpose:** Provide secure password reset link
**Variables:**
- `name` - User's name
- `resetLink` - Password reset URL
- `expiryTime` - Link expiration time (e.g., "24 hours")

**Security Features:**
- Expiration warning
- Security tips
- "Didn't request this?" section

### 5. Supplier Order Notification
**Template:** `supplier-order-notification.html`
**Purpose:** Notify suppliers of new orders
**Variables:**
- `supplierName` - Supplier company name
- `orderNumber` - Order reference
- `buyerName` - Customer who placed order
- `orderDate` - Order timestamp
- `totalAmount` - Order value
- `items` - Ordered products with quantities

### 6. Generic Email
**Template:** `generic.html`
**Purpose:** Fallback template for custom emails
**Variables:**
- `content` - Email body HTML

## API Endpoints

### Base URL
```
http://localhost:8087/api/email
```

### 1. Send Generic Email
```http
POST /send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Subject Line",
  "emailType": "REGISTRATION",
  "recipientName": "John Doe",
  "templateData": {
    "name": "John Doe",
    "activationLink": "https://..."
  },
  "orderId": 123,
  "userId": 456
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "emailLogId": 789,
  "status": "SENT"
}
```

### 2. Send Registration Email
```http
POST /registration?email=user@example.com&name=John Doe&activationLink=https://...
```

**Response:** Same as generic email

### 3. Send Order Confirmation
```http
POST /order/confirmation
Content-Type: application/json

{
  "orderId": 123,
  "orderNumber": "ORD-2024-001",
  "buyerName": "John Doe",
  "buyerEmail": "buyer@example.com",
  "supplierName": "Tech Supplier Co.",
  "totalAmount": 1234.56,
  "currency": "USD",
  "status": "CONFIRMED",
  "orderDate": "2024-12-02T10:30:00",
  "shippingAddress": "123 Main St, City, State 12345",
  "paymentMethod": "Credit Card",
  "items": [
    {
      "productName": "Laptop Computer",
      "sku": "SKU001",
      "quantity": 10,
      "unitPrice": 899.99,
      "subtotal": 8999.90
    }
  ]
}
```

### 4. Send Order Status Update
```http
POST /order/status?previousStatus=CONFIRMED
Content-Type: application/json

{
  "orderId": 123,
  "orderNumber": "ORD-2024-001",
  "buyerName": "John Doe",
  "buyerEmail": "buyer@example.com",
  "status": "SHIPPED",
  "orderDate": "2024-12-02T10:30:00",
  "totalAmount": 1234.56
}
```

### 5. Send Password Reset Email
```http
POST /password-reset?email=user@example.com&name=John Doe&resetLink=https://...
```

### 6. Send Supplier Order Notification
```http
POST /supplier/order-notification
Content-Type: application/json

{
  "orderId": 123,
  "orderNumber": "ORD-2024-001",
  "supplierName": "Tech Supplier Co.",
  "buyerName": "John Doe",
  "buyerEmail": "supplier@example.com",
  "orderDate": "2024-12-02T10:30:00",
  "totalAmount": 1234.56,
  "items": [...]
}
```

### 7. Get Email Logs
```http
GET /logs
GET /logs?status=SENT
GET /logs?status=FAILED
```

**Response:**
```json
[
  {
    "id": 1,
    "recipient": "user@example.com",
    "subject": "Welcome to B2B Marketplace",
    "emailType": "REGISTRATION",
    "status": "SENT",
    "errorMessage": null,
    "sentAt": "2024-12-02T10:30:00",
    "createdAt": "2024-12-02T10:29:55",
    "retryCount": 0,
    "orderId": null,
    "userId": 123
  }
]
```

### 8. Get Email Log by ID
```http
GET /logs/1
```

### 9. Get User Email Logs
```http
GET /logs/user/123
```

### 10. Get Order Email Logs
```http
GET /logs/order/456
```

### 11. Get Email Statistics
```http
GET /stats
```

**Response:**
```json
{
  "totalSent": 1250,
  "totalFailed": 15,
  "totalPending": 3
}
```

### 12. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "UP",
  "service": "Email Service",
  "port": "8087"
}
```

## Configuration

### Gmail SMTP Setup

#### Step 1: Enable 2-Step Verification
1. Go to Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

#### Step 2: Create App Password
1. Go to Google Account > Security > 2-Step Verification
2. Scroll to "App passwords"
3. Select "Mail" and your device
4. Copy the 16-character password

#### Step 3: Update application.properties
```properties
# Replace with your Gmail credentials
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-char-app-password

# Update sender information
email.from.address=noreply@yourdomain.com
email.from.name=Your Company Name
```

### Environment Variables (Production)
```bash
# Set these in production environment
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

### application.properties
```properties
# Server
server.port=8087
spring.application.name=email-service

# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/b2b_marketplace
spring.datasource.username=root
spring.datasource.password=1234

# Email SMTP (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME:your-email@gmail.com}
spring.mail.password=${EMAIL_PASSWORD:your-app-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.ssl.trust=smtp.gmail.com

# Sender Info
email.from.address=${EMAIL_FROM_ADDRESS:noreply@b2bmarketplace.com}
email.from.name=B2B Marketplace

# Thymeleaf
spring.thymeleaf.cache=false
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
```

## Database Schema

### email_logs Table
```sql
CREATE TABLE email_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    sent_at DATETIME,
    created_at DATETIME NOT NULL,
    retry_count INT DEFAULT 0,
    order_id BIGINT,
    user_id BIGINT,
    INDEX idx_recipient (recipient),
    INDEX idx_status (status),
    INDEX idx_email_type (email_type),
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_sent_at (sent_at)
);
```

**Columns:**
- `id` - Primary key
- `recipient` - Email address
- `subject` - Email subject line
- `email_type` - Type (REGISTRATION, ORDER_CONFIRMATION, etc.)
- `status` - SENT, FAILED, or PENDING
- `error_message` - Error details if failed
- `sent_at` - Timestamp when sent
- `created_at` - Timestamp when queued
- `retry_count` - Number of retry attempts
- `order_id` - Associated order ID (nullable)
- `user_id` - Associated user ID (nullable)

## Testing

### 1. Start Email Service
```powershell
.\START_EMAIL_SERVICE.ps1
```

### 2. Test Health Endpoint
```powershell
Invoke-RestMethod http://localhost:8087/api/email/health
```

### 3. Send Test Registration Email
```powershell
$params = @{
    email = "test@example.com"
    name = "Test User"
    activationLink = "http://localhost:3000/activate?token=abc123"
}

Invoke-RestMethod -Method POST -Uri "http://localhost:8087/api/email/registration" `
    -Body ($params | ConvertTo-Json) -ContentType "application/json"
```

### 4. Send Test Order Confirmation
```powershell
$orderData = @{
    orderId = 1
    orderNumber = "ORD-TEST-001"
    buyerName = "John Doe"
    buyerEmail = "test@example.com"
    supplierName = "Test Supplier"
    totalAmount = 999.99
    currency = "USD"
    status = "CONFIRMED"
    orderDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    shippingAddress = "123 Test St, Test City"
    paymentMethod = "Credit Card"
    items = @(
        @{
            productName = "Test Product"
            sku = "SKU001"
            quantity = 2
            unitPrice = 499.99
            subtotal = 999.98
        }
    )
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
    -Uri "http://localhost:8087/api/email/order/confirmation" `
    -Body $orderData -ContentType "application/json"
```

### 5. Check Email Logs
```powershell
# All logs
Invoke-RestMethod http://localhost:8087/api/email/logs

# Only sent emails
Invoke-RestMethod "http://localhost:8087/api/email/logs?status=SENT"

# Only failed emails
Invoke-RestMethod "http://localhost:8087/api/email/logs?status=FAILED"
```

### 6. Get Statistics
```powershell
Invoke-RestMethod http://localhost:8087/api/email/stats
```

## Frontend Integration

### Import emailAPI
```javascript
import { emailAPI } from './services/api';
```

### Send Registration Email
```javascript
const sendWelcomeEmail = async (user) => {
  const activationLink = `${window.location.origin}/activate?token=${user.activationToken}`;
  const response = await emailAPI.sendRegistrationEmail(
    user.email,
    user.name,
    activationLink
  );
  
  if (response.success) {
    console.log('Welcome email sent successfully');
  }
};
```

### Send Order Confirmation
```javascript
const sendOrderConfirmation = async (order) => {
  const orderData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    buyerName: order.buyer.name,
    buyerEmail: order.buyer.email,
    supplierName: order.supplier.name,
    totalAmount: order.totalAmount,
    currency: 'USD',
    status: order.status,
    orderDate: order.createdAt,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    items: order.items.map(item => ({
      productName: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.quantity * item.unitPrice
    }))
  };
  
  const response = await emailAPI.sendOrderConfirmation(orderData);
  return response;
};
```

### Send Order Status Update
```javascript
const notifyOrderStatusChange = async (order, previousStatus) => {
  const orderData = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    buyerName: order.buyer.name,
    buyerEmail: order.buyer.email,
    status: order.status,
    orderDate: order.createdAt,
    totalAmount: order.totalAmount
  };
  
  await emailAPI.sendOrderStatusUpdate(orderData, previousStatus);
};
```

### Send Password Reset
```javascript
const sendPasswordResetEmail = async (user) => {
  const resetLink = `${window.location.origin}/reset-password?token=${user.resetToken}`;
  await emailAPI.sendPasswordReset(user.email, user.name, resetLink);
};
```

## Troubleshooting

### Email Not Sending

**Problem:** Emails stuck in PENDING status  
**Solutions:**
1. Check Gmail credentials in application.properties
2. Verify App Password (not regular password)
3. Check internet connection
4. Review application logs for SMTP errors

### Authentication Failed

**Problem:** "535 Authentication failed"  
**Solutions:**
1. Enable 2-Step Verification in Google Account
2. Generate new App Password
3. Update `spring.mail.password` with App Password
4. Verify `spring.mail.username` is correct

### Emails Going to Spam

**Problem:** Emails delivered to spam folder  
**Solutions:**
1. Set proper `email.from.address` (use your domain)
2. Configure SPF, DKIM, and DMARC records
3. Avoid spam trigger words in subject/content
4. Include unsubscribe link (for production)

### Template Not Found

**Problem:** "TemplateInputException"  
**Solutions:**
1. Verify template file exists in `src/main/resources/templates/`
2. Check template name matches in `getTemplateName()` method
3. Ensure `.html` extension is present
4. Rebuild service after adding templates

### Slow Email Sending

**Problem:** Emails take too long to send  
**Solutions:**
1. Verify @Async is enabled (@EnableAsync in main class)
2. Check AsyncConfig thread pool settings
3. Increase core pool size if needed
4. Monitor SMTP server response times

## Best Practices

### 1. Use Async Sending
Always send emails asynchronously to avoid blocking API responses:
```java
@Async
public EmailResponse sendEmail(EmailRequest request) {
    // Email sending logic
}
```

### 2. Log All Emails
Every email is automatically logged for:
- Debugging delivery issues
- Compliance and audit trails
- Analytics and reporting

### 3. Handle Failures Gracefully
```java
try {
    emailService.sendOrderConfirmation(orderData);
} catch (Exception e) {
    log.error("Failed to send order confirmation", e);
    // Continue with order processing
}
```

### 4. Use Templates
Never hardcode email HTML. Always use templates for:
- Consistent branding
- Easy updates
- Localization support

### 5. Test with Real Emails
Before production, test with:
- Different email providers (Gmail, Outlook, Yahoo)
- Mobile devices
- Desktop clients
- Webmail interfaces

### 6. Monitor Email Stats
Regularly check `/stats` endpoint:
- Track delivery success rate
- Identify patterns in failures
- Monitor volume trends

## Production Considerations

### 1. Use Professional SMTP Service
For production, consider:
- SendGrid
- Amazon SES
- Mailgun
- Postmark

Benefits:
- Higher delivery rates
- Better spam reputation
- Detailed analytics
- Scalability

### 2. Environment Variables
Never commit credentials. Use environment variables:
```bash
export EMAIL_USERNAME=production@yourcompany.com
export EMAIL_PASSWORD=secure-app-password
export EMAIL_FROM_ADDRESS=noreply@yourcompany.com
```

### 3. Rate Limiting
Implement rate limiting to avoid:
- SMTP server bans
- Spam complaints
- Resource exhaustion

### 4. Retry Logic
Implement exponential backoff for failed emails:
```java
@Scheduled(fixedRate = 300000) // Every 5 minutes
public void retryFailedEmails() {
    List<EmailLog> failed = repository.findByStatusAndRetryCountLessThan("FAILED", 3);
    failed.forEach(this::retryEmail);
}
```

### 5. Unsubscribe Links
For marketing emails, include unsubscribe links to comply with:
- CAN-SPAM Act (US)
- GDPR (EU)
- CASL (Canada)

## Support

For issues or questions:
1. Check email logs: `GET /email/logs`
2. Review application logs for errors
3. Verify SMTP configuration
4. Test with curl/PowerShell before frontend integration
5. Check Gmail App Password validity

## Quick Reference

**Service URL:** http://localhost:8087  
**Port:** 8087  
**SMTP:** Gmail (smtp.gmail.com:587)  
**Templates:** src/main/resources/templates/  
**Database Table:** email_logs  

**Email Types:**
- REGISTRATION
- ORDER_CONFIRMATION
- ORDER_STATUS
- PASSWORD_RESET
- SUPPLIER_ORDER_NOTIFICATION

**Statuses:**
- SENT - Successfully delivered
- FAILED - Delivery failed
- PENDING - Queued for sending
