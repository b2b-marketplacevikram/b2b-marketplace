# Messaging System Fix Summary

## Issues Identified

1. **Company Name Not Displayed**: When buyers message suppliers, the supplier's company name was not showing - only the full name from the users table
2. **Message Filtering**: Messages from different conversations were appearing mixed together when switching between conversations

## Root Causes

### Issue 1: Missing Company Name
- The `UserDTO` class only returned `fullName` from the `users` table
- Company names are stored in separate tables:
  - `suppliers.company_name` for supplier companies
  - `buyers.company_name` for buyer companies
- The Messaging Service was fetching user details via `/api/users/{id}` but not getting company names

### Issue 2: Message Cross-Contamination
- Messages were not being cleared when switching conversations
- Typing indicator was showing for all conversations, not just the current one
- Incoming WebSocket messages weren't filtering by current conversation for typing indicators

## Solutions Implemented

### Backend Changes

#### 1. UserDTO Enhancement
**File**: `backend/user-service/src/main/java/com/b2b/marketplace/user/dto/UserDTO.java`

```java
@Data
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String userType;
    private Boolean isActive;
    private Boolean isVerified;
    private String companyName;  // ← NEW FIELD
    
    // ...
}
```

#### 2. UserController Update
**File**: `backend/user-service/src/main/java/com/b2b/marketplace/user/controller/UserController.java`

Added logic to fetch company name from buyer/supplier profiles:

```java
@GetMapping("/{id}")
public ResponseEntity<?> getUserById(@PathVariable Long id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    
    UserDTO userDTO = UserDTO.fromEntity(user);
    
    // Fetch company name based on user type
    if (user.getUserType() == User.UserType.SUPPLIER) {
        Optional<Supplier> supplierOpt = supplierRepository.findByUserId(user.getId());
        if (supplierOpt.isPresent()) {
            userDTO.setCompanyName(supplierOpt.get().getCompanyName());
        }
    } else if (user.getUserType() == User.UserType.BUYER) {
        Optional<Buyer> buyerOpt = buyerRepository.findByUserId(user.getId());
        if (buyerOpt.isPresent() && buyerOpt.get().getCompanyName() != null) {
            userDTO.setCompanyName(buyerOpt.get().getCompanyName());
        }
    }
    
    // Fallback to full name if no company name
    if (userDTO.getCompanyName() == null || userDTO.getCompanyName().isEmpty()) {
        userDTO.setCompanyName(user.getFullName());
    }
    
    return ResponseEntity.ok(userDTO);
}
```

#### 3. MessagingService Update
**File**: `backend/messaging-service/src/main/java/com/b2b/messaging/service/MessagingService.java`

Updated to use company name with fallback to full name:

```java
// In getUserConversations():
dto.setBuyerName(buyer != null ? 
    (buyer.get("companyName") != null ? (String) buyer.get("companyName") : (String) buyer.get("fullName")) 
    : "Unknown");
dto.setSupplierName(supplier != null ? 
    (supplier.get("companyName") != null ? (String) supplier.get("companyName") : (String) supplier.get("fullName")) 
    : "Unknown");

// In convertToDTO():
if (sender != null) {
    String companyName = (String) sender.get("companyName");
    String fullName = (String) sender.get("fullName");
    dto.setSenderName(companyName != null ? companyName : (fullName != null ? fullName : "Unknown"));
} else {
    dto.setSenderName("Unknown");
}
```

### Frontend Changes

#### 1. MessagingContext Update
**File**: `src/context/MessagingContext.jsx`

**Fix 1**: Clear messages when switching conversations

```javascript
const selectConversation = async (conversation) => {
    // Clear current messages when switching conversations
    setMessages([]);
    setCurrentConversation(conversation);
    await loadMessages(conversation.id);
};
```

**Fix 2**: Filter typing indicator by current conversation

```javascript
const handleIncomingMessage = (chatMessage) => {
    if (chatMessage.type === 'CHAT') {
        // Add message to current conversation ONLY if it matches
        if (currentConversation && chatMessage.conversationId === currentConversation.id) {
            setMessages(prev => [...prev, chatMessage]);
        }
        loadConversations();
    } else if (chatMessage.type === 'TYPING') {
        // Only show typing indicator for current conversation
        if (currentConversation && chatMessage.conversationId === currentConversation.id) {
            setTypingUsers(prev => new Set(prev).add(chatMessage.senderId));
        }
        // ... rest of typing logic
    }
    // ... rest of handler
};
```

## Testing Steps

1. **Build and Restart Services**:
   ```powershell
   .\REBUILD_MESSAGING_FIX.ps1
   ```

2. **Test Company Name Display**:
   - Login as a buyer
   - Navigate to a product page
   - Click "Contact Supplier"
   - Verify the supplier's **company name** appears (not just user name)
   - Send a message
   - Check that the chat header shows the company name

3. **Test Message Filtering**:
   - Start conversations with multiple suppliers
   - Switch between conversations
   - Verify that:
     - Messages are cleared when switching
     - Only messages from the selected conversation appear
     - Typing indicators only show for the current conversation
     - No messages from other conversations appear

## Database Schema Reference

### Relevant Tables

**users table**:
- `id` - Primary key
- `full_name` - Individual user's name
- `user_type` - ENUM('BUYER', 'SUPPLIER')

**suppliers table**:
- `id` - Primary key
- `user_id` - Foreign key to users
- `company_name` - Supplier company name ✓

**buyers table**:
- `id` - Primary key
- `user_id` - Foreign key to users
- `company_name` - Buyer company name ✓

**conversations table**:
- `id` - Primary key
- `buyer_id` - Foreign key to buyers
- `supplier_id` - Foreign key to suppliers
- `last_message` - Preview text
- `unread_count_buyer` - Unread count for buyer
- `unread_count_supplier` - Unread count for supplier

**messages table**:
- `id` - Primary key
- `conversation_id` - Foreign key to conversations
- `sender_id` - User who sent the message
- `receiver_id` - User who receives the message
- `content` - Message text
- `read` - Read status

## Expected Behavior After Fix

### Before:
- ❌ Messages showed "John Doe" (user's full name)
- ❌ Switching conversations sometimes showed mixed messages
- ❌ Typing indicator appeared for all conversations

### After:
- ✅ Messages show "TechSupply Co." (company name)
- ✅ Each conversation shows only its own messages
- ✅ Typing indicator only appears for current conversation
- ✅ Fallback to full name if company name not set
- ✅ Messages cleared immediately when switching conversations

## Files Modified

### Backend
1. `backend/user-service/src/main/java/com/b2b/marketplace/user/dto/UserDTO.java`
2. `backend/user-service/src/main/java/com/b2b/marketplace/user/controller/UserController.java`
3. `backend/messaging-service/src/main/java/com/b2b/messaging/service/MessagingService.java`

### Frontend
1. `src/context/MessagingContext.jsx`

### Scripts
1. `REBUILD_MESSAGING_FIX.ps1` (new)

## Verification Checklist

- [ ] User Service rebuilds successfully
- [ ] Messaging Service rebuilds successfully
- [ ] Both services restart without errors
- [ ] Company names appear in conversation list
- [ ] Company names appear in chat header
- [ ] Messages don't mix between conversations
- [ ] Typing indicator only shows for current chat
- [ ] Messages clear when switching conversations
- [ ] Fallback to full name works when no company name

## Notes

- Company names are optional for buyers, so some buyers may still show their full name
- All suppliers should have company names (required field during registration)
- The fix maintains backward compatibility - if company name is null, it falls back to full name
- WebSocket messages are now properly filtered by conversation ID

---

**Status**: ✅ IMPLEMENTED AND READY FOR TESTING

**Date**: December 16, 2025
