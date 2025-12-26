# Order Status Update Testing Guide

## Overview
The Order Status Update feature allows suppliers to update order statuses and automatically sends email notifications to buyers.

## Backend Implementation

### Order Service (Port 8083)
**Endpoint:** `PUT /api/orders/{id}/status`

**Request Body:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRACK123456" 
}
```

**Status Flow:**
1. `PENDING` → Initial order state
2. `CONFIRMED` → Payment confirmed
3. `PROCESSING` → Order being prepared
4. `SHIPPED` → Order dispatched
5. `DELIVERED` → Order received
6. `CANCELLED` → Order cancelled

### Email Notification
When status is updated, an email is automatically sent to the buyer with:
- Previous status
- New status
- Order details
- Tracking information (if available)

## Frontend Implementation

### Supplier Order Management
**Location:** `src/pages/supplier/OrderManagement.jsx`

**Features:**
- View all orders for supplier
- Filter by status
- Update order status with dropdown
- Add tracking number
- View order details

### Buyer Order Tracking
**Location:** `src/pages/buyer/OrderTracking.jsx`

**Features:**
- Real-time order status tracking
- Visual progress timeline
- Tracking number display
- Estimated delivery date
- Order history

## Testing Steps

### 1. Start Services
```powershell
# Start all backend services
cd c:\b2b_sample\backend
.\START_ALL_SERVICES.ps1

# Start frontend
cd c:\b2b_sample
npm run dev
```

### 2. Create Test Order
1. Login as buyer
2. Add products to cart
3. Proceed to checkout
4. Complete order

### 3. Update Order Status (Supplier)
1. Login as supplier (or navigate to supplier order management)
2. Go to Order Management page
3. Find the test order
4. Click "Update Status"
5. Select new status (e.g., "SHIPPED")
6. Add tracking number (optional)
7. Submit

### 4. Verify Email Sent
Check email logs in database:
```sql
USE b2b_marketplace;
SELECT * FROM email_logs 
WHERE email_type = 'ORDER_STATUS' 
ORDER BY created_at DESC 
LIMIT 5;
```

### 5. Verify Buyer View
1. Login as buyer
2. Go to Order Tracking
3. Verify status is updated
4. Check if tracking number is displayed

## API Testing with PowerShell

### Get Order by Number
```powershell
$orderNumber = "ORD-12345678"
Invoke-RestMethod -Uri "http://localhost:8083/api/orders/number/$orderNumber" -Method Get
```

### Update Order Status
```powershell
$orderNumber = "ORD-12345678"

# First get the order to find its database ID
$order = Invoke-RestMethod -Uri "http://localhost:8083/api/orders/number/$orderNumber" -Method Get
$orderId = $order.id

# Update status
$statusData = @{
    status = "SHIPPED"
    trackingNumber = "TRACK123456789"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8083/api/orders/$orderId/status" `
    -Method Put `
    -Body $statusData `
    -ContentType "application/json"
```

### Check Email Logs
```powershell
Invoke-RestMethod -Uri "http://localhost:8087/api/email/logs?limit=5" -Method Get
```

## Status Update Email Template

The email includes:
- **Subject:** Order Status Update - Order #{orderNumber}
- **Content:**
  - Buyer name
  - Order number
  - Previous status → New status
  - Order date
  - Total amount
  - Link to track order

## Troubleshooting

### Email Not Sent
1. Check if Email Service is running (port 8087)
2. Check email logs: `SELECT * FROM email_logs WHERE status = 'FAILED'`
3. Verify buyer email is not null in users table
4. Check Order Service logs for errors

### Status Not Updating
1. Verify Order Service is running (port 8083)
2. Check order ID is correct
3. Verify status value is valid enum
4. Check Order Service logs

### Frontend Not Showing Update
1. Clear browser cache
2. Check browser console for errors
3. Verify API response in Network tab
4. Restart frontend dev server

## Expected Behavior

### Successful Status Update:
1. ✅ Order status updated in database
2. ✅ Timestamps updated (shippedAt, deliveredAt, etc.)
3. ✅ Email sent to buyer
4. ✅ Email log created in database
5. ✅ Frontend reflects new status
6. ✅ Tracking number visible (if provided)

### Email Notification:
- **Status:** SENT
- **Recipient:** Buyer's email
- **Type:** ORDER_STATUS
- **Template:** order-status.html

## Additional Features

### Bulk Status Update (Future Enhancement)
```javascript
// Update multiple orders at once
orderAPI.bulkUpdateStatus([orderId1, orderId2], "SHIPPED")
```

### Status Change History (Future Enhancement)
```sql
-- Track all status changes
CREATE TABLE order_status_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  changed_by BIGINT,
  changed_at DATETIME,
  notes TEXT
);
```

## Summary

✅ **Backend:** Order Service updates status and sends email via Email Service
✅ **Email:** Automatic notification sent to buyer with status change details
✅ **Frontend:** Supplier can update status; Buyer can track status in real-time
✅ **Database:** Status changes logged in orders table and email_logs table
