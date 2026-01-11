# Schema vs Entity Mismatches

## CRITICAL ENUM MISMATCHES

### 1. **orders.status** ENUM
**Schema.sql:**
```sql
ENUM('PENDING', 'AWAITING_PAYMENT', 'PAYMENT_VERIFIED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')
```
**Order.java:**
```java
PENDING, AWAITING_PAYMENT, PAYMENT_VERIFIED, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
```
✅ **FIXED - Now matches!**

---

### 2. **orders.payment_status** ENUM
**Schema.sql:**
```sql
ENUM('PENDING', 'AWAITING_VERIFICATION', 'PAID', 'FAILED', 'REFUND_PENDING', 'REFUNDED')
```
**Order.java:**
```java
PENDING, AWAITING_VERIFICATION, PAID, FAILED, REFUND_PENDING, REFUNDED
```
✅ **FIXED - Now matches!**

---

### 3. **orders.payment_type** ENUM
**Schema.sql:**
```sql
ENUM('URGENT_ONLINE', 'BANK_TRANSFER', 'UPI', 'CREDIT_TERMS')
```
**Order.java:**
```java
URGENT_ONLINE, BANK_TRANSFER, UPI, CREDIT_TERMS
```
✅ **FIXED - Now matches!**

---

### 4. **orders.payment_commission_paid_by** ENUM
**Schema.sql:**
```sql
ENUM('BUYER', 'PLATFORM')
```
**Order.java:**
```java
BUYER, PLATFORM
```
✅ **FIXED - Now matches!**

---

### 5. ❌ **disputes.dispute_type** ENUM - MAJOR MISMATCH!

**Schema.sql:**
```sql
ENUM('PRODUCT_NOT_AS_DESCRIBED', 'PRODUCT_DAMAGED', 'PRODUCT_NOT_DELIVERED', 
     'WRONG_PRODUCT', 'QUALITY_ISSUE', 'QUANTITY_MISMATCH', 'LATE_DELIVERY',
     'PAYMENT_ISSUE', 'REFUND_NOT_RECEIVED', 'OTHER')
```

**Dispute.java:**
```java
PRODUCT_QUALITY, WRONG_PRODUCT, DAMAGED_PRODUCT, MISSING_ITEMS, DELIVERY_ISSUE, 
DELAYED_DELIVERY, NOT_AS_DESCRIBED, PAYMENT_ISSUE, REFUND_REQUEST, WARRANTY_CLAIM, OTHER
```

**Missing in schema.sql:**
- `PRODUCT_QUALITY`
- `DAMAGED_PRODUCT`
- `MISSING_ITEMS`
- `DELIVERY_ISSUE`
- `DELAYED_DELIVERY`
- `NOT_AS_DESCRIBED`
- `REFUND_REQUEST`
- `WARRANTY_CLAIM`

**Extra in schema.sql (not in entity):**
- `PRODUCT_NOT_AS_DESCRIBED`
- `PRODUCT_DAMAGED`
- `PRODUCT_NOT_DELIVERED`
- `QUALITY_ISSUE`
- `QUANTITY_MISMATCH`
- `LATE_DELIVERY`
- `REFUND_NOT_RECEIVED`

---

### 6. ❌ **disputes.status** ENUM - MAJOR MISMATCH!

**Schema.sql:**
```sql
ENUM('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'AWAITING_BUYER', 'AWAITING_SUPPLIER',
     'ESCALATED', 'RESOLVED', 'CLOSED', 'REJECTED')
```

**Dispute.java:**
```java
OPEN, ACKNOWLEDGED, UNDER_REVIEW, SUPPLIER_RESPONDED, AWAITING_BUYER, ESCALATED, 
RESOLUTION_PROPOSED, RESOLVED, CLOSED, REOPENED
```

**Missing in schema.sql:**
- `UNDER_REVIEW`
- `SUPPLIER_RESPONDED`
- `RESOLUTION_PROPOSED`
- `REOPENED`

**Extra in schema.sql (not in entity):**
- `IN_PROGRESS`
- `AWAITING_SUPPLIER`
- `REJECTED`

---

### 7. ❌ **disputes.priority** ENUM - MISMATCH!

**Schema.sql:**
```sql
ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
```

**Dispute.java:**
```java
LOW, MEDIUM, HIGH, URGENT
```

**Missing in schema.sql:**
- `URGENT`

**Extra in schema.sql (not in entity):**
- `CRITICAL`

---

### 8. ❌ **disputes.refund_status** ENUM - MISMATCH!

**Schema.sql:**
```sql
ENUM('NOT_REQUESTED', 'PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED')
```

**Dispute.java:**
```java
NOT_REQUESTED, REQUESTED, APPROVED, PROCESSING, COMPLETED, REJECTED, PARTIAL
```

**Missing in schema.sql:**
- `REQUESTED`
- `PARTIAL`

**Extra in schema.sql (not in entity):**
- `PENDING`

---

### 9. ❌ **disputes.resolution_type** ENUM - MISMATCH!

**Schema.sql:**
```sql
ENUM('REFUND_FULL', 'REFUND_PARTIAL', 'REPLACEMENT', 'CREDIT_NOTE', 'NO_ACTION', 'OTHER')
```

**Dispute.java:**
```java
FULL_REFUND, PARTIAL_REFUND, REPLACEMENT, REPAIR, CREDIT_NOTE, REDELIVERY, 
EXPLANATION, NO_ACTION, BUYER_WITHDREW
```

**Missing in schema.sql:**
- `FULL_REFUND`
- `PARTIAL_REFUND`
- `REPAIR`
- `REDELIVERY`
- `EXPLANATION`
- `BUYER_WITHDREW`

**Extra in schema.sql (not in entity):**
- `REFUND_FULL`
- `REFUND_PARTIAL`
- `OTHER`

---

## MISSING COLUMNS

### order_items table
✅ **FIXED - Added:**
- `product_image VARCHAR(512)`
- `hsn_code VARCHAR(10)`
- `gst_rate DECIMAL(5,2)`

---

## SQL FIX SCRIPT

```sql
USE b2b_marketplace;

-- Fix disputes.dispute_type ENUM
ALTER TABLE disputes
MODIFY COLUMN dispute_type ENUM(
    'PRODUCT_QUALITY',
    'WRONG_PRODUCT',
    'DAMAGED_PRODUCT',
    'MISSING_ITEMS',
    'DELIVERY_ISSUE',
    'DELAYED_DELIVERY',
    'NOT_AS_DESCRIBED',
    'PAYMENT_ISSUE',
    'REFUND_REQUEST',
    'WARRANTY_CLAIM',
    'OTHER'
) NOT NULL;

-- Fix disputes.status ENUM
ALTER TABLE disputes
MODIFY COLUMN status ENUM(
    'OPEN',
    'ACKNOWLEDGED',
    'UNDER_REVIEW',
    'SUPPLIER_RESPONDED',
    'AWAITING_BUYER',
    'ESCALATED',
    'RESOLUTION_PROPOSED',
    'RESOLVED',
    'CLOSED',
    'REOPENED'
) DEFAULT 'OPEN';

-- Fix disputes.priority ENUM
ALTER TABLE disputes
MODIFY COLUMN priority ENUM(
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
) DEFAULT 'MEDIUM';

-- Fix disputes.refund_status ENUM
ALTER TABLE disputes
MODIFY COLUMN refund_status ENUM(
    'NOT_REQUESTED',
    'REQUESTED',
    'APPROVED',
    'PROCESSING',
    'COMPLETED',
    'REJECTED',
    'PARTIAL'
);

-- Fix disputes.resolution_type ENUM
ALTER TABLE disputes
MODIFY COLUMN resolution_type ENUM(
    'FULL_REFUND',
    'PARTIAL_REFUND',
    'REPLACEMENT',
    'REPAIR',
    'CREDIT_NOTE',
    'REDELIVERY',
    'EXPLANATION',
    'NO_ACTION',
    'BUYER_WITHDREW'
);

SELECT 'All disputes table ENUMs fixed!' AS Result;
```
