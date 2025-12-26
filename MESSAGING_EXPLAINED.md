# Messaging System Explanation

## Understanding Company Names in Messages

### What is "Test Buyer Corp"?

"Test Buyer Corp" (or similar names like "Tech Solutions Inc", "Global Imports LLC", etc.) are **company names** that appear in the messaging system. These are different from personal user names.

### Database Structure

The B2B marketplace has a two-tier user system:

1. **Users Table** - Contains login credentials and personal information:
   - `email` - Login email
   - `full_name` - Individual person's name (e.g., "John Smith", "Sarah Johnson")
   - `user_type` - Either BUYER or SUPPLIER

2. **Buyers/Suppliers Tables** - Contains business/company information:
   - `user_id` - Links to the users table
   - `company_name` - The actual business name (e.g., "Test Buyer Corp", "Tech Solutions Inc")
   - Business details like address, tax ID, etc.

### Sample Companies in the Database

Based on the sample data, here are the companies:

#### Buyers (Customer Companies):
1. **Tech Solutions Inc** - John Smith (buyer1@example.com)
2. **Global Imports LLC** - Sarah Johnson (buyer2@example.com)
3. **Shanghai Trading Co** - Michael Chen (buyer3@example.com)

#### Suppliers (Seller Companies):
1. **Shenzhen TechCorp Electronics** - David Wang (supplier1@techcorp.com)
2. **Global Manufacturing Solutions** - Lisa Anderson (supplier2@globalmanuf.com)
3. **East Asia Trading Group** - Robert Kim (supplier3@easttrade.com)
4. **Euro Supply Chain** - Emma Mueller (supplier4@eurosupply.com)

### How Messaging Works

#### Before the Fix:
When a buyer messaged a supplier, the system showed:
- ❌ **Personal names**: "John Smith is chatting with David Wang"
- This was confusing in B2B context where you're representing companies

#### After the Fix:
Now the system shows:
- ✅ **Company names**: "Tech Solutions Inc is chatting with Shenzhen TechCorp Electronics"
- Falls back to personal name if company name is not set
- This makes more sense for business-to-business communication

### Example Conversation Flow

1. **Buyer browses products**:
   - Sees "Wireless Bluetooth Earbuds" from "Shenzhen TechCorp Electronics"
   
2. **Buyer clicks "Contact Supplier"**:
   - System creates a conversation between:
     - Buyer company: "Tech Solutions Inc" (John Smith's company)
     - Supplier company: "Shenzhen TechCorp Electronics" (David Wang's company)

3. **In the Messages page**:
   - **Conversation list shows**: "Shenzhen TechCorp Electronics"
   - **Chat header shows**: "Shenzhen TechCorp Electronics" (Supplier)
   - **Messages are filtered**: Only messages from THIS conversation appear
   - **Typing indicator**: Only shows when the other person in THIS chat is typing

### Common Scenarios

#### Scenario 1: Buyer with Company Name
- User: John Smith
- Company: Tech Solutions Inc
- Messages show: "Tech Solutions Inc" ✓

#### Scenario 2: Buyer without Company Name
- User: Jane Doe
- Company: (not set)
- Messages show: "Jane Doe" (fallback to personal name) ✓

#### Scenario 3: Multiple Conversations
- Buyer has conversations with 3 suppliers:
  - "Shenzhen TechCorp Electronics"
  - "Global Manufacturing Solutions"
  - "East Asia Trading Group"
- Each conversation stays separate
- Messages don't mix between conversations
- Switching conversations clears the chat window

### Testing the Messaging System

To test properly:

1. **Login as a Buyer** (e.g., buyer1@example.com / password)
   - Your company: "Tech Solutions Inc"

2. **Go to a Product** (e.g., "Wireless Bluetooth Earbuds")
   - Supplier: "Shenzhen TechCorp Electronics"

3. **Click "Contact Supplier"**
   - A conversation is created or opened
   - You are redirected to Messages page

4. **In Messages Page**:
   - Conversation list shows: "Shenzhen TechCorp Electronics"
   - Chat header shows: "Shenzhen TechCorp Electronics" (Supplier)
   - You can send messages
   - The supplier will see your company name: "Tech Solutions Inc"

5. **Test Multiple Conversations**:
   - Contact different suppliers
   - Switch between conversations
   - Verify messages stay separate

### Why Company Names Matter in B2B

In a B2B (Business-to-Business) marketplace:

- **NOT like Facebook/WhatsApp**: Where you chat person-to-person
- **MORE like LinkedIn/Alibaba**: Where you represent your company
- **Business context**: "Tech Solutions Inc" ordering from "Shenzhen TechCorp"
- **Professional communication**: Buyers negotiate on behalf of their company
- **Order tracking**: Conversations linked to company accounts, not individuals

### Database Tables Involved

```
users (personal login info)
  ↓
buyers (buyer company info)
  ↓
conversations (chat between buyer & supplier)
  ↓
messages (individual chat messages)
```

### API Flow

1. **Buyer opens product page**
   - Product API: `/api/products/{id}` returns supplier info
   
2. **Buyer clicks "Contact Supplier"**
   - Messaging API: `POST /api/conversations/create`
   - Creates conversation between buyer.user_id and supplier.user_id
   
3. **System fetches company names**:
   - User Service: `GET /api/users/{userId}`
   - Returns: `{id, email, fullName, userType, companyName}`
   - `companyName` is fetched from buyers/suppliers table
   
4. **Messages display company names**:
   - Messaging Service populates conversation with company names
   - Frontend shows these in conversation list and chat header

### Troubleshooting

**Problem**: "I see 'John Smith' instead of 'Tech Solutions Inc'"
- **Cause**: Company name not set in buyers table
- **Fix**: User needs to complete their company profile

**Problem**: "Messages from different chats are mixed"
- **Cause**: Old messages not cleared when switching conversations
- **Fix**: Already implemented - messages are cleared on conversation switch

**Problem**: "I see messages from other people's chats"
- **Cause**: Conversation filtering not working
- **Fix**: Already implemented - only user's own conversations are loaded

---

## Summary

**"Test Buyer Corp"** is simply a company name that might appear in:
- A test account in your database
- Sample data for testing
- A buyer who registered with that company name

The messaging system now correctly shows **company names** instead of personal names, which is appropriate for a B2B marketplace where users represent businesses, not themselves.

If you're seeing "Test Buyer Corp" in your messages, it means there's a buyer in the system with that company name. This is expected behavior for testing the B2B messaging functionality.
