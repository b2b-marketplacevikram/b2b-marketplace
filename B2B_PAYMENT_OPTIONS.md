# B2B Payment Options - Implementation Guide

## Overview

This feature implements PO-based ordering with multiple payment options to avoid or minimize commission charges for B2B transactions.

## Payment Options

### 1. 🏦 Bank Transfer (0% Fee)
- **Commission**: None
- **Process**: 
  1. Buyer places order with PO number
  2. Buyer receives supplier's bank details
  3. Buyer transfers funds and uploads proof
  4. Supplier verifies payment
  5. Order is processed

### 2. 📱 UPI Payment (0% Fee)
- **Commission**: None
- **Process**: Same as Bank Transfer, using UPI ID instead
- Supports all UPI apps (GPay, PhonePe, Paytm, etc.)

### 3. 📝 Credit Terms (0% Fee)
- **Commission**: None
- **For**: Trusted buyers with approved credit limits
- **Options**: Net 15, Net 30, Net 45, Net 60 days
- Order ships immediately, payment due later

### 4. ⚡ Urgent - Pay Now (2% Fee)
- **Commission**: 2% on order total
- **For**: Buyers who need instant processing
- **Process**: Immediate Razorpay payment, instant order confirmation

## Database Schema Changes

### Orders Table - New Columns
```sql
ALTER TABLE orders ADD COLUMN po_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN payment_type ENUM('URGENT_ONLINE', 'BANK_TRANSFER', 'UPI', 'CREDIT_TERMS');
ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(255);
ALTER TABLE orders ADD COLUMN payment_proof_url VARCHAR(500);
ALTER TABLE orders ADD COLUMN payment_verified_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN payment_verified_by VARCHAR(100);
ALTER TABLE orders ADD COLUMN credit_terms_days INT;
ALTER TABLE orders ADD COLUMN credit_limit DECIMAL(15,2);
ALTER TABLE orders ADD COLUMN payment_commission_rate DECIMAL(5,4) DEFAULT 0.0200;
ALTER TABLE orders ADD COLUMN payment_commission_amount DECIMAL(15,2);
ALTER TABLE orders ADD COLUMN payment_commission_paid_by ENUM('BUYER', 'SUPPLIER');
ALTER TABLE orders ADD COLUMN is_urgent BOOLEAN DEFAULT FALSE;
```

### New Tables

#### supplier_bank_details
```sql
CREATE TABLE supplier_bank_details (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  supplier_id BIGINT NOT NULL,
  account_name VARCHAR(255),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  bank_name VARCHAR(100),
  branch_name VARCHAR(100),
  upi_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

#### buyer_credit_terms
```sql
CREATE TABLE buyer_credit_terms (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  buyer_id BIGINT NOT NULL,
  supplier_id BIGINT NOT NULL,
  credit_limit DECIMAL(15,2),
  terms_days INT,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP,
  approved_by VARCHAR(100),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

## API Endpoints

### Order Service (Port 8083)

#### Submit Payment Proof
```http
POST /api/orders/{orderNumber}/payment-proof
Content-Type: application/json

{
  "paymentReference": "UTR123456789",
  "paymentProofUrl": "/uploads/proofs/proof.jpg"
}
```

#### Verify Payment (Supplier)
```http
POST /api/orders/{orderNumber}/verify-payment
Content-Type: application/json

{
  "verified": true,
  "verifiedBy": "supplier@example.com",
  "rejectionReason": null
}
```

#### Get Awaiting Verification Orders
```http
GET /api/orders/supplier/{supplierId}/awaiting-verification
```

#### Get Supplier Bank Details
```http
GET /api/orders/supplier/{supplierId}/bank-details
```

## Frontend Components

### Buyer Components
- **Checkout.jsx**: Updated with 4 payment options
- **PaymentInstructions.jsx**: New page for bank/UPI payment instructions
- **PaymentInstructions.css**: Styling for payment instructions

### Supplier Components
- **PaymentVerification.jsx**: New page to verify payments
- **PaymentVerification.css**: Styling for verification panel

### Routes Added
- `/orders/:orderNumber/payment-instructions` - Buyer payment instructions
- `/supplier/payments` - Supplier payment verification

## Order Flow by Payment Type

### Bank Transfer / UPI
```
Order Placed → Status: AWAITING_PAYMENT
       ↓
Buyer Uploads Proof → paymentProofUrl, paymentReference set
       ↓
Supplier Verifies → Status: PAYMENT_VERIFIED → Status: PROCESSING
       ↓
Order Shipped → Status: SHIPPED → Status: DELIVERED
```

### Credit Terms
```
Order Placed → Status: PROCESSING (immediate)
       ↓
Shipped → Status: SHIPPED
       ↓
Delivered → Status: DELIVERED
       ↓
Payment Due → creditTermsDays from order date
```

### Urgent Online
```
Order Placed → Razorpay Payment
       ↓
Payment Success → Status: PROCESSING (immediate)
       ↓
Commission calculated and stored
       ↓
Order Shipped → Status: SHIPPED → Status: DELIVERED
```

## Commission Calculation

```javascript
// Only for URGENT_ONLINE
const COMMISSION_RATE = 0.02  // 2%
const baseTotal = subtotal + shipping + tax
const commission = formData.paymentType === 'URGENT_ONLINE' 
  ? baseTotal * COMMISSION_RATE 
  : 0
const total = baseTotal + commission
```

## Testing

### Test Checkout Flow
1. Add products to cart
2. Go to checkout
3. Fill shipping details
4. Select payment method:
   - Bank Transfer: Complete, see payment instructions
   - UPI: Complete, see payment instructions  
   - Credit Terms: Only for approved buyers
   - Urgent: Razorpay payment with 2% fee shown

### Test Payment Verification
1. Login as supplier
2. Go to Payments page (`/supplier/payments`)
3. Select order awaiting verification
4. Review payment proof
5. Approve or reject with reason

## Files Modified/Created

### Modified
- `backend/order-service/src/main/java/com/b2b/orderservice/model/Order.java`
- `backend/order-service/src/main/java/com/b2b/orderservice/dto/CreateOrderRequest.java`
- `backend/order-service/src/main/java/com/b2b/orderservice/controller/OrderController.java`
- `backend/order-service/src/main/java/com/b2b/orderservice/service/OrderService.java`
- `backend/order-service/src/main/java/com/b2b/orderservice/repository/OrderRepository.java`
- `src/pages/buyer/Checkout.jsx`
- `src/App.jsx`
- `src/components/Header.jsx`

### Created
- `backend/order-service/src/main/java/com/b2b/orderservice/dto/PaymentProofRequest.java`
- `backend/order-service/src/main/java/com/b2b/orderservice/dto/VerifyPaymentRequest.java`
- `backend/order-service/src/main/java/com/b2b/orderservice/dto/SupplierBankDetailsResponse.java`
- `src/pages/buyer/PaymentInstructions.jsx`
- `src/pages/buyer/PaymentInstructions.css`
- `src/pages/supplier/PaymentVerification.jsx`
- `src/pages/supplier/PaymentVerification.css`

## Benefits

1. **Cost Savings**: Buyers save 2% on non-urgent orders
2. **Flexibility**: Multiple payment options for different needs
3. **Trust Building**: Credit terms for established relationships
4. **Transparency**: Clear commission display for urgent payments
5. **Verification**: Supplier-controlled payment verification
6. **PO Support**: B2B standard purchase order tracking
