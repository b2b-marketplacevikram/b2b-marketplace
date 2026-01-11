-- ========================================
-- COMPREHENSIVE SCHEMA FIX SCRIPT
-- Fixes ALL entity-schema mismatches
-- ========================================

USE b2b_marketplace;

-- ========================================
-- FIX 1: orders table ENUM mismatches
-- ========================================
ALTER TABLE orders
MODIFY COLUMN status ENUM('PENDING', 'AWAITING_PAYMENT', 'PAYMENT_VERIFIED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
MODIFY COLUMN payment_status ENUM('PENDING', 'AWAITING_VERIFICATION', 'PAID', 'FAILED', 'REFUND_PENDING', 'REFUNDED') DEFAULT 'PENDING',
MODIFY COLUMN payment_type ENUM('URGENT_ONLINE', 'BANK_TRANSFER', 'UPI', 'CREDIT_TERMS') DEFAULT 'BANK_TRANSFER',
MODIFY COLUMN payment_commission_paid_by ENUM('BUYER', 'PLATFORM') DEFAULT 'BUYER';

SELECT '✅ orders table ENUMs fixed' AS Status;

-- ========================================
-- FIX 2: order_items missing columns
-- ========================================
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_image TEXT AFTER product_name,
ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(10) AFTER total_price,
ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5,2) AFTER hsn_code;

SELECT '✅ order_items columns added' AS Status;

-- ========================================
-- FIX 3: disputes table ENUM mismatches
-- ========================================
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
) NOT NULL,
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
) DEFAULT 'OPEN',
MODIFY COLUMN priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
MODIFY COLUMN refund_status ENUM('NOT_REQUESTED', 'REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'PARTIAL'),
MODIFY COLUMN resolution_type ENUM('FULL_REFUND', 'PARTIAL_REFUND', 'REPLACEMENT', 'REPAIR', 'CREDIT_NOTE', 'REDELIVERY', 'EXPLANATION', 'NO_ACTION', 'BUYER_WITHDREW');

SELECT '✅ disputes table ENUMs fixed' AS Status;

-- ========================================
-- VERIFICATION: Check all critical ENUMs
-- ========================================
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'b2b_marketplace'
  AND TABLE_NAME IN ('orders', 'order_items', 'disputes', 'quotes', 'promotions', 'coupons')
  AND DATA_TYPE = 'enum'
ORDER BY TABLE_NAME, COLUMN_NAME;

SELECT '========================================' AS '';
SELECT '✅ ALL SCHEMA FIXES APPLIED SUCCESSFULLY!' AS Status;
SELECT '========================================' AS '';
SELECT '' AS '';
SELECT 'You can now restart order-service with ddl-auto=validate' AS NextStep;
