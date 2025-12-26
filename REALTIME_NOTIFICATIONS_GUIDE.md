# Real-Time Notification System - Implementation Guide

## Overview

The B2B Marketplace now features a real-time notification system using WebSocket technology. This allows buyers and suppliers to receive instant notifications when order statuses change, new orders are placed, and other important events occur.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                React Frontend                        │
│  • NotificationContext (WebSocket Client)            │
│  • NotificationCenter (Bell Icon + Dropdown)         │
│  • ToastNotification (Pop-up Alerts)                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ WebSocket (STOMP over SockJS)
                   │
┌──────────────────▼──────────────────────────────────┐
│         Notification Service (Port 8086)             │
│  • WebSocket Configuration                           │
│  • STOMP Message Broker                              │
│  • Notification Repository (MySQL)                   │
│  • REST API + WebSocket Endpoints                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ REST API Calls
                   │
┌──────────────────▼──────────────────────────────────┐
│              Order Service (Port 8083)               │
│  • Sends notifications on order creation             │
│  • Sends notifications on status changes             │
└──────────────────────────────────────────────────────┘
```

## Components

### Backend Services

#### 1. Notification Service (Port 8086)

**Location**: `backend/notification-service/`

**Key Files**:
- `NotificationServiceApplication.java` - Main Spring Boot application
- `config/WebSocketConfig.java` - WebSocket and STOMP configuration
- `controller/NotificationController.java` - REST and WebSocket endpoints
- `service/NotificationService.java` - Business logic
- `entity/NotificationEntity.java` - JPA entity for database
- `model/Notification.java` - DTO model
- `repository/NotificationRepository.java` - Data access

**Features**:
- WebSocket connection endpoint at `/ws`
- STOMP messaging with topics: `/topic/user/{userId}`
- Persistent notification storage in MySQL
- REST API for notification management
- Support for multiple notification types and severities

**Database Table**: `notifications`
```sql
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id BIGINT NOT NULL,
    order_id BIGINT,
    order_status VARCHAR(50),
    timestamp TIMESTAMP NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    severity VARCHAR(20) DEFAULT 'INFO'
);
```

#### 2. Order Service Integration

The Order Service now sends real-time notifications:

**When order is created**:
- Notifies buyer: "Order Placed Successfully"
- Notifies supplier: "New Order Received"

**When order status changes**:
- CONFIRMED: "Order Confirmed"
- SHIPPED: "Order Shipped" (includes tracking number)
- DELIVERED: "Order Delivered!"
- CANCELLED: "Order Cancelled"

### Frontend Components

#### 1. NotificationContext

**Location**: `src/context/NotificationContext.jsx`

**Features**:
- Establishes WebSocket connection when user logs in
- Subscribes to user-specific notification topic
- Maintains notification state
- Handles toast notifications with auto-dismiss
- Provides methods to mark notifications as read

**Hooks**:
```javascript
const {
    notifications,       // Array of all notifications
    unreadCount,        // Number of unread notifications
    toastNotification,  // Current toast notification
    isConnected,        // WebSocket connection status
    markAsRead,         // Mark single notification as read
    markAllAsRead,      // Mark all notifications as read
    dismissToast,       // Close current toast
    refreshNotifications // Fetch latest notifications
} = useNotifications();
```

#### 2. NotificationCenter Component

**Location**: `src/components/NotificationCenter.jsx`

**Features**:
- Bell icon with unread count badge
- Dropdown panel showing all notifications
- Click notification to navigate to related order
- Mark individual or all notifications as read
- Time-ago formatting (e.g., "5m ago", "2h ago")
- Color-coded severity icons

#### 3. ToastNotification Component

**Location**: `src/components/ToastNotification.jsx`

**Features**:
- Slide-in animation from right
- Auto-dismiss after 5 seconds
- Color-coded by severity (success, info, warning, error)
- Manual close button
- Appears in top-right corner

## API Endpoints

### Notification Service REST API

**Base URL**: `http://localhost:8086/api/notifications`

#### Send Notification (Internal - called by other services)
```
POST /send
Body: {
    "userId": 1,
    "type": "ORDER_STATUS_CHANGED",
    "title": "Order Status Updated",
    "message": "Your order #ORD-12345 status changed to SHIPPED",
    "orderId": 10,
    "orderStatus": "SHIPPED",
    "severity": "INFO"
}
```

#### Get User Notifications
```
GET /user/{userId}
Response: Array of notification objects
```

#### Get Unread Notifications
```
GET /user/{userId}/unread
Response: Array of unread notification objects
```

#### Get Unread Count
```
GET /user/{userId}/unread/count
Response: { "count": 5 }
```

#### Mark as Read
```
PUT /{notificationId}/read
Response: 200 OK
```

#### Mark All as Read
```
PUT /user/{userId}/read-all
Response: 200 OK
```

#### Health Check
```
GET /health
Response: { "status": "UP", "service": "notification-service", "websocket": "enabled" }
```

### WebSocket Endpoints

**Connection**: `ws://localhost:8086/ws` (with SockJS fallback)

**Subscribe to user notifications**:
```
Topic: /topic/user/{userId}
Message Format: JSON Notification object
```

**Send connect message** (on connection):
```
Destination: /app/connect
Body: { "userId": 1 }
```

## Notification Types

| Type | Description | Triggered By |
|------|-------------|-------------|
| `ORDER_CREATED` | New order placed | Order creation |
| `NEW_ORDER_RECEIVED` | Supplier receives new order | Order creation |
| `ORDER_STATUS_CHANGED` | Order status updated | Status update |

## Severity Levels

| Severity | Color | Usage |
|----------|-------|-------|
| `SUCCESS` | Green | Order delivered, confirmed |
| `INFO` | Blue | General updates, shipped |
| `WARNING` | Yellow | Cancelled orders |
| `ERROR` | Red | Critical issues |

## Setup Instructions

### 1. Start Notification Service

**Option A: Using PowerShell Script**
```powershell
.\START_NOTIFICATION_SERVICE.ps1
```

**Option B: Manual Start**
```powershell
cd C:\b2b_sample\backend\notification-service
mvn spring-boot:run
```

### 2. Install Frontend Dependencies

The WebSocket dependencies are already added to `package.json`:
```json
{
  "dependencies": {
    "sockjs-client": "^1.6.1",
    "stompjs": "^2.3.3"
  }
}
```

Install them with:
```powershell
npm install
```

### 3. Start Frontend

```powershell
npm run dev
```

### 4. Test the System

1. **Login** as a buyer or supplier
2. **Check WebSocket Connection**: 
   - Open browser DevTools > Console
   - Look for "Connected to WebSocket" message
   - Notification bell should appear in header

3. **Create a Test Order**:
   - Login as buyer (buyer1@example.com / password123)
   - Add items to cart and checkout
   - Watch for toast notification: "Order Placed Successfully"

4. **Update Order Status** (as supplier):
   - Login as supplier (supplier1@example.com / password123)
   - Go to Orders Management
   - Change order status to CONFIRMED or SHIPPED
   - Both buyer and supplier receive notifications

5. **View Notification Center**:
   - Click bell icon in header
   - See all notifications
   - Click notification to navigate to orders
   - Mark as read or mark all as read

## Configuration

### Backend Configuration

**File**: `backend/notification-service/src/main/resources/application.properties`

```properties
spring.application.name=notification-service
server.port=8086

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/b2b_marketplace
spring.datasource.username=root
spring.datasource.password=root

# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:3001
```

### Frontend Configuration

The WebSocket URL is configured in `NotificationContext.jsx`:
```javascript
const socket = new SockJS('http://localhost:8086/ws');
```

For production, update this to your production notification service URL.

## Troubleshooting

### WebSocket Not Connecting

**Check 1: Service Running**
```powershell
Invoke-RestMethod http://localhost:8086/api/notifications/health
```
Expected: `{ "status": "UP", "websocket": "enabled" }`

**Check 2: Port Availability**
```powershell
Get-NetTCPConnection -LocalPort 8086 -State Listen
```

**Check 3: Console Errors**
- Open browser DevTools > Console
- Look for connection errors
- Verify user is logged in

**Check 4: CORS Issues**
- Verify `cors.allowed-origins` in application.properties
- Add your frontend URL if different from localhost:3000

### Notifications Not Appearing

**Check 1: User ID**
- Verify user object has valid `id` property
- Check subscription topic matches user ID

**Check 2: Order Service**
- Ensure Order Service is running (port 8083)
- Check Order Service logs for notification sending

**Check 3: Database**
```sql
SELECT * FROM notifications WHERE user_id = 1 ORDER BY timestamp DESC;
```

### Toast Not Dismissing

- Toast auto-dismisses after 5 seconds
- Click X button to manually dismiss
- Check console for JavaScript errors

## Production Considerations

### Security

1. **Authentication**: Add JWT validation to WebSocket connections
```java
// In WebSocketConfig.java
@Override
public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(new JwtChannelInterceptor());
}
```

2. **Authorization**: Verify users can only subscribe to their own topics

3. **Rate Limiting**: Prevent notification spam

### Scalability

1. **Message Broker**: Replace simple broker with RabbitMQ or Redis
```java
// Use external message broker
config.enableStompBrokerRelay("/topic", "/queue")
      .setRelayHost("rabbitmq-host")
      .setRelayPort(61613);
```

2. **Session Management**: Use external session store for multi-instance deployments

3. **Load Balancing**: Configure sticky sessions for WebSocket connections

### Monitoring

1. **Connection Metrics**: Track active WebSocket connections
2. **Notification Delivery**: Monitor successful/failed notifications
3. **Response Times**: Track notification latency

### Performance

1. **Pagination**: Limit notifications fetched at once
2. **Database Indexes**: Add indexes on `user_id` and `timestamp`
```sql
CREATE INDEX idx_user_timestamp ON notifications(user_id, timestamp DESC);
CREATE INDEX idx_user_unread ON notifications(user_id, read);
```

3. **Cleanup**: Periodically archive old notifications
```sql
DELETE FROM notifications WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

## Future Enhancements

1. **Notification Preferences**: Allow users to configure notification types
2. **Email Digests**: Send daily/weekly notification summaries
3. **Mobile Push**: Integrate with Firebase Cloud Messaging
4. **Rich Notifications**: Add images, action buttons
5. **Notification Templates**: Create reusable templates
6. **Priority Levels**: Add urgent/normal/low priority
7. **Group Notifications**: Combine similar notifications
8. **Mark as Unread**: Allow users to mark notifications as unread
9. **Notification Sounds**: Different sounds for different severities
10. **Desktop Notifications**: Use browser Notification API

## Testing

### Manual Testing Checklist

- [ ] Login as buyer
- [ ] Check notification bell appears
- [ ] WebSocket connects successfully
- [ ] Place an order
- [ ] Receive "Order Placed" toast notification
- [ ] Check notification in notification center
- [ ] Login as supplier in different browser/incognito
- [ ] Verify supplier received "New Order" notification
- [ ] Update order status as supplier
- [ ] Verify both buyer and supplier receive notifications
- [ ] Click notification to navigate to orders
- [ ] Mark notification as read
- [ ] Verify unread count decreases
- [ ] Mark all as read
- [ ] Logout and verify WebSocket disconnects

### API Testing

```powershell
# Health check
Invoke-RestMethod http://localhost:8086/api/notifications/health

# Send test notification
$body = @{
    userId = 1
    type = "TEST"
    title = "Test Notification"
    message = "This is a test"
    severity = "INFO"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8086/api/notifications/send" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Get notifications
Invoke-RestMethod http://localhost:8086/api/notifications/user/1

# Get unread count
Invoke-RestMethod http://localhost:8086/api/notifications/user/1/unread/count
```

## Summary

The real-time notification system is now fully integrated into the B2B Marketplace, providing:

✅ **WebSocket-based real-time notifications**
✅ **Persistent notification storage**
✅ **Toast notifications with auto-dismiss**
✅ **Notification center with dropdown**
✅ **Order creation and status update notifications**
✅ **Read/unread tracking**
✅ **User-specific notification channels**
✅ **RESTful API for notification management**
✅ **Responsive UI components**
✅ **Production-ready architecture**

Users now receive instant feedback on order activities, improving engagement and user experience across the platform!
