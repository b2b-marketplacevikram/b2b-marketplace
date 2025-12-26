# Buyer-Supplier Messaging System - Implementation Guide

## Overview

The B2B Marketplace now features a complete real-time messaging system that enables direct communication between buyers and suppliers. Built with WebSocket technology, it provides instant message delivery, typing indicators, read receipts, and conversation management.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                React Frontend                        │
│  • MessagingContext (WebSocket Client)               │
│  • Messages Page (Chat UI)                           │
│  • MessageButton Component                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ WebSocket (STOMP over SockJS)
                   │
┌──────────────────▼──────────────────────────────────┐
│          Messaging Service (Port 8088)               │
│  • WebSocket Configuration                           │
│  • STOMP Message Broker                              │
│  • Conversation Management                           │
│  • Message Persistence (MySQL)                       │
│  • REST API + WebSocket Endpoints                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ REST API (Fetch User Details)
                   │
┌──────────────────▼──────────────────────────────────┐
│              User Service (Port 8081)                │
│  • User profile information                          │
└──────────────────────────────────────────────────────┘
```

## Features

### ✅ Core Messaging
- Real-time message delivery via WebSocket
- Conversation threads between buyers and suppliers
- Message persistence in MySQL database
- Message history retrieval

### ✅ Real-Time Indicators
- **Typing indicators**: See when the other person is typing
- **Read receipts**: Double checkmark when messages are read
- **Online status**: Connection status indicator

### ✅ User Experience
- **Conversation list**: View all active conversations
- **Unread counts**: Badge showing unread message count
- **Time stamps**: "Just now", "5m ago", relative time formatting
- **Message bubbles**: WhatsApp-style chat interface
- **Auto-scroll**: Messages scroll to bottom automatically

### ✅ Integration Points
- **Supplier Profile**: Message button to start conversations
- **Header Navigation**: Messages link in main menu
- **Order Pages**: Can add message buttons (future enhancement)

## Database Schema

### Tables Created

#### conversations
```sql
CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    last_message TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    last_message_id BIGINT,
    unread_count_buyer INT DEFAULT 0,
    unread_count_supplier INT DEFAULT 0,
    INDEX idx_buyer (buyer_id),
    INDEX idx_supplier (supplier_id),
    UNIQUE KEY unique_conversation (buyer_id, supplier_id)
);
```

#### messages
```sql
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

## Backend Components

### 1. Messaging Service (Port 8088)

**Location**: `backend/messaging-service/`

**Key Files**:
- `MessagingServiceApplication.java` - Main Spring Boot application
- `config/WebSocketConfig.java` - WebSocket and STOMP configuration
- `controller/MessagingController.java` - REST and WebSocket endpoints
- `service/MessagingService.java` - Business logic
- `entity/Conversation.java` - Conversation JPA entity
- `entity/Message.java` - Message JPA entity
- `model/ChatMessage.java` - DTO for message transfer
- `model/ConversationDTO.java` - DTO for conversation display
- `repository/ConversationRepository.java` - Conversation data access
- `repository/MessageRepository.java` - Message data access

**WebSocket Endpoints**:
- **Connection**: `ws://localhost:8088/ws-chat`
- **Send Message**: `/app/chat.send`
- **Typing Indicator**: `/app/chat.typing`
- **Subscribe to Messages**: `/user/{userId}/queue/messages`

**REST API Endpoints**:
```
POST   /api/messages/send                    - Send message (REST fallback)
GET    /api/conversations/user/{userId}       - Get user's conversations
GET    /api/conversations/{id}/messages       - Get conversation messages
PUT    /api/conversations/{id}/read           - Mark messages as read
GET    /api/conversations/between             - Get specific conversation
POST   /api/conversations/create              - Create new conversation
GET    /api/messaging/health                  - Health check
```

### 2. Message Types

```java
public enum MessageType {
    CHAT,           // Regular text message
    TYPING,         // Typing indicator
    READ_RECEIPT,   // Message read confirmation
    JOIN,           // User joined conversation
    LEAVE           // User left conversation
}
```

## Frontend Components

### 1. MessagingContext

**Location**: `src/context/MessagingContext.jsx`

**Purpose**: Manages WebSocket connection and messaging state

**Hooks**:
```javascript
const {
    conversations,          // Array of all conversations
    currentConversation,    // Currently selected conversation
    messages,              // Messages in current conversation
    isConnected,           // WebSocket connection status
    typingUsers,           // Set of user IDs currently typing
    loadConversations,     // Refresh conversation list
    sendMessage,           // Send a message
    sendTypingIndicator,   // Send typing indicator
    startConversation,     // Create new conversation
    selectConversation,    // Select a conversation to view
    markConversationAsRead,// Mark conversation as read
    getTotalUnreadCount    // Get total unread count
} = useMessaging();
```

**Key Features**:
- Automatic WebSocket connection when user logs in
- Real-time message handling
- Typing indicator debouncing
- Read receipt tracking
- Conversation synchronization

### 2. Messages Page

**Location**: `src/pages/buyer/Messages.jsx`

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Messages                    [Connected]         │
├──────────────────┬──────────────────────────────┤
│ Conversations    │  Chat Window                  │
│                  │  ┌─────────────────────────┐  │
│ ┌──────────────┐ │  │ User Name               │  │
│ │ Avatar  Name │ │  │ Supplier/Buyer          │  │
│ │ Last message │ │  └─────────────────────────┘  │
│ │ Time    [2]  │ │                               │
│ └──────────────┘ │  Message bubbles...           │
│                  │                               │
│ ┌──────────────┐ │  Typing indicator...          │
│ │ Active Conv  │ │                               │
│ └──────────────┘ │  ┌─────────────────────────┐  │
│                  │  │ Type a message...  [Send]│  │
│                  │  └─────────────────────────┘  │
└──────────────────┴──────────────────────────────┘
```

**Features**:
- Two-column layout (conversations + chat)
- Active conversation highlighting
- Unread count badges
- Relative timestamp formatting
- Message status indicators (✓/✓✓)
- Typing animation
- Auto-scroll to latest message
- Empty state handling

### 3. MessageButton Component

**Location**: `src/components/MessageButton.jsx`

**Usage**:
```jsx
<MessageButton 
    userId={supplierId} 
    userName="Supplier Name"
    className="custom-class"
/>
```

**Behavior**:
- Checks if conversation exists
- Creates new conversation if needed
- Navigates to Messages page
- Auto-selects conversation

**Styling Variants**:
- Default (green button with icon + text)
- Compact (smaller size)
- Icon-only (circular button)
- Secondary (gray color)

## Setup Instructions

### 1. Start Messaging Service

**Option A: Using PowerShell Script**
```powershell
.\START_MESSAGING_SERVICE.ps1
```

**Option B: Manual Start**
```powershell
cd C:\b2b_sample\backend\messaging-service
mvn clean install -DskipTests
mvn spring-boot:run
```

The service will start on **port 8088**.

### 2. Verify Service Health

```powershell
Invoke-RestMethod http://localhost:8088/api/messaging/health
```

Expected response:
```json
{
    "status": "UP",
    "service": "messaging-service",
    "websocket": "enabled"
}
```

### 3. Restart Frontend

The WebSocket dependencies are already installed. Just restart:
```powershell
cd c:\b2b_sample
npm run dev
```

## User Guide

### For Buyers

#### Starting a Conversation
1. Navigate to a supplier profile
2. Click the **"Message"** button (green button with 💬 icon)
3. You'll be redirected to the Messages page
4. Start typing your message

#### Viewing Messages
1. Click **"Messages"** in the header navigation
2. See all your conversations in the left panel
3. Click any conversation to view messages
4. Unread conversations show a badge with count

#### Sending Messages
1. Select a conversation
2. Type your message in the input field at the bottom
3. Press **Enter** or click **"Send"**
4. Your message appears immediately with ✓ (sent)
5. When read by supplier, it shows ✓✓ (read)

### For Suppliers

#### Receiving Messages
1. When a buyer messages you, the conversation appears in your list
2. Unread conversations show a badge
3. Click the conversation to read and reply

#### Responding
1. Click **"Messages"** in header
2. Select the buyer's conversation
3. Type and send your response
4. Messages are delivered in real-time

## API Reference

### REST API

#### Send Message
```http
POST /api/messages/send
Content-Type: application/json

{
    "conversationId": 1,
    "senderId": 2,
    "receiverId": 3,
    "content": "Hello! I'm interested in your LED products",
    "type": "CHAT"
}
```

#### Get User Conversations
```http
GET /api/conversations/user/2
```

Response:
```json
[
    {
        "id": 1,
        "buyerId": 2,
        "buyerName": "John Buyer",
        "supplierId": 3,
        "supplierName": "TechLight Co.",
        "lastMessage": "Sure, I can provide a quote",
        "createdAt": "2025-12-02T10:30:00",
        "updatedAt": "2025-12-02T14:45:00",
        "unreadCount": 2,
        "isOnline": true
    }
]
```

#### Get Conversation Messages
```http
GET /api/conversations/1/messages?userId=2
```

Response:
```json
[
    {
        "id": 1,
        "conversationId": 1,
        "senderId": 2,
        "senderName": "John Buyer",
        "receiverId": 3,
        "content": "Hello! I'm interested in your LED products",
        "sentAt": "2025-12-02T10:30:00",
        "read": true,
        "readAt": "2025-12-02T10:31:00",
        "type": "CHAT"
    }
]
```

#### Mark as Read
```http
PUT /api/conversations/1/read?userId=2
```

#### Create Conversation
```http
POST /api/conversations/create
Content-Type: application/json

{
    "user1Id": 2,
    "user2Id": 3
}
```

### WebSocket API

#### Connection
```javascript
const socket = new SockJS('http://localhost:8088/ws-chat');
const stompClient = Stomp.over(socket);

stompClient.connect({}, () => {
    console.log('Connected');
    
    // Subscribe to messages
    stompClient.subscribe(`/user/${userId}/queue/messages`, (message) => {
        const chatMessage = JSON.parse(message.body);
        handleIncomingMessage(chatMessage);
    });
});
```

#### Send Message
```javascript
stompClient.send('/app/chat.send', {}, JSON.stringify({
    conversationId: 1,
    senderId: 2,
    receiverId: 3,
    content: "Hello!",
    type: "CHAT"
}));
```

#### Send Typing Indicator
```javascript
stompClient.send('/app/chat.typing', {}, JSON.stringify({
    conversationId: 1,
    senderId: 2,
    receiverId: 3
}));
```

## Styling

### CSS Files
- `src/styles/Messages.css` - Main messaging page styles
- `src/styles/MessageButton.css` - Message button component styles

### Key CSS Classes
```css
.messages-page              /* Main container */
.conversations-list         /* Left panel */
.conversation-item         /* Conversation in list */
.conversation-item.active  /* Selected conversation */
.unread-badge              /* Unread count badge */
.chat-window               /* Right panel */
.chat-messages             /* Messages container */
.message.sent              /* Sent message (right) */
.message.received          /* Received message (left) */
.message-bubble            /* Message bubble */
.typing-indicator          /* Typing animation */
.chat-input-form           /* Input area */
```

### Color Scheme
- **Primary**: #007bff (blue)
- **Success**: #28a745 (green) - for message button
- **Sent messages**: #007bff (blue background)
- **Received messages**: white with shadow
- **Unread badge**: #007bff (blue)
- **Typing indicator**: #6c757d (gray)

## Testing

### Manual Test Flow

1. **Setup**
   ```powershell
   # Start all services
   .\START_MESSAGING_SERVICE.ps1    # Terminal 1
   npm run dev                       # Terminal 2
   ```

2. **Test as Buyer**
   - Login as buyer1@example.com
   - Navigate to any supplier profile
   - Click "Message" button
   - Verify redirect to Messages page
   - Send a test message
   - Verify message appears with ✓ status

3. **Test as Supplier** (use incognito/different browser)
   - Login as supplier1@example.com
   - Click "Messages" in header
   - Verify conversation appears with unread badge
   - Click conversation
   - Verify messages load
   - Verify unread badge clears
   - Start typing a response
   - Send message

4. **Test Real-Time Features** (switch between windows)
   - With both users logged in
   - Send message from buyer
   - Verify it appears instantly on supplier's screen
   - Start typing on buyer's side
   - Verify typing indicator appears on supplier's screen
   - Mark messages as read
   - Verify ✓✓ appears on sender's screen

### API Testing

```powershell
# Health check
Invoke-RestMethod http://localhost:8088/api/messaging/health

# Get conversations (replace userId)
Invoke-RestMethod "http://localhost:8088/api/conversations/user/2"

# Send message via REST
$body = @{
    conversationId = 1
    senderId = 2
    receiverId = 3
    content = "Test message"
    type = "CHAT"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8088/api/messages/send" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

## Troubleshooting

### WebSocket Not Connecting

**Check 1: Service Running**
```powershell
Invoke-RestMethod http://localhost:8088/api/messaging/health
```

**Check 2: Port Available**
```powershell
Get-NetTCPConnection -LocalPort 8088 -State Listen
```

**Check 3: Console Errors**
Open browser DevTools > Console and look for:
- "Connected to messaging WebSocket" (success)
- Connection errors or CORS issues

**Check 4: User Logged In**
Messaging only connects when user is authenticated

### Messages Not Appearing

**Check 1: Conversation Exists**
```powershell
Invoke-RestMethod "http://localhost:8088/api/conversations/user/{userId}"
```

**Check 2: Database Tables**
```sql
SHOW TABLES LIKE '%conversation%';
SHOW TABLES LIKE '%message%';
SELECT * FROM conversations;
SELECT * FROM messages;
```

**Check 3: Service Logs**
Check the PowerShell window running messaging service for errors

### Typing Indicator Not Working

- Typing indicators clear after 3 seconds automatically
- Only appears when typing in input field
- Requires active WebSocket connection
- Check browser console for WebSocket errors

### Read Receipts Not Updating

- Read receipts only work for messages sent while both users are connected
- Requires WebSocket connection
- Check that READ_RECEIPT messages are being sent
- Verify messages are marked as read in database

## Performance Considerations

### Database Optimization

**Add Indexes**:
```sql
CREATE INDEX idx_conv_buyer_supplier ON conversations(buyer_id, supplier_id);
CREATE INDEX idx_msg_conversation_sent ON messages(conversation_id, sent_at);
CREATE INDEX idx_msg_unread ON messages(receiver_id, read);
```

**Archive Old Messages** (optional):
```sql
-- Archive messages older than 1 year
INSERT INTO messages_archive 
SELECT * FROM messages WHERE sent_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

DELETE FROM messages WHERE sent_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### WebSocket Scalability

For production with multiple instances:

1. **Use External Message Broker**
```java
// In WebSocketConfig.java
@Override
public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableStompBrokerRelay("/topic", "/queue")
          .setRelayHost("rabbitmq-host")
          .setRelayPort(61613);
    config.setApplicationDestinationPrefixes("/app");
}
```

2. **Session Management**
- Use Redis for session storage
- Enable sticky sessions on load balancer

3. **Message Queuing**
- Implement message queue for offline delivery
- Store unsent messages in queue

## Security Enhancements

### Authentication

Add JWT validation to WebSocket connections:

```java
@Configuration
public class WebSocketSecurityConfig {
    @Bean
    public ChannelInterceptor jwtChannelInterceptor() {
        return new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
                
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = accessor.getFirstNativeHeader("Authorization");
                    // Validate JWT token
                    // Set user in session
                }
                
                return message;
            }
        };
    }
}
```

### Authorization

Verify users can only:
- View their own conversations
- Send messages to conversations they're part of
- Not access other users' messages

### Input Sanitization

```java
public String sanitizeMessage(String content) {
    return content
        .replaceAll("<script>", "")
        .replaceAll("javascript:", "")
        .trim();
}
```

### Rate Limiting

Prevent message spam:
```java
@RateLimiter(name = "messaging", fallbackMethod = "messagingFallback")
public ChatMessage sendMessage(ChatMessage message) {
    // Send message
}
```

## Future Enhancements

### Planned Features
1. **File Attachments** - Send images, documents
2. **Voice Messages** - Audio message support
3. **Message Search** - Search within conversations
4. **Message Reactions** - Like, emoji reactions
5. **Group Chats** - Multi-user conversations
6. **Message Forwarding** - Forward messages
7. **Delete Messages** - Delete sent messages
8. **Edit Messages** - Edit sent messages
9. **Push Notifications** - Browser/mobile notifications
10. **Conversation Archive** - Archive old conversations
11. **Blocked Users** - Block unwanted contacts
12. **Message Templates** - Quick response templates
13. **Auto-responses** - Business hours auto-replies
14. **Translation** - Auto-translate messages
15. **Video Calls** - WebRTC video chat

### Integration Opportunities
- Link conversations to specific products
- Link conversations to orders
- Auto-create conversation from inquiry form
- Integrate with CRM systems
- Email notifications for offline messages

## Summary

The messaging system is now fully operational with:

✅ **Real-time WebSocket communication**
✅ **Persistent message storage in MySQL**
✅ **Conversation management**
✅ **Typing indicators and read receipts**
✅ **Unread message tracking**
✅ **Clean, modern chat interface**
✅ **Integration with supplier profiles**
✅ **Mobile-responsive design**
✅ **REST API fallback**
✅ **Production-ready architecture**

Buyers and suppliers can now communicate directly within the platform, improving engagement, facilitating negotiations, and enhancing the overall B2B experience!

---

**Service URL**: http://localhost:8088
**Messages Page**: http://localhost:3000/messages
**WebSocket Endpoint**: ws://localhost:8088/ws-chat
