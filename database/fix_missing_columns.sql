-- Fix Missing Database Tables and Columns
USE b2b_marketplace;

-- Add missing column to coupons table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS created_by BIGINT;

-- Add missing columns to promotions table
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS promotion_level VARCHAR(50);
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS min_order_amount DECIMAL(10, 2);
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS max_discount_amount DECIMAL(10, 2);
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS created_by BIGINT;

-- Create coupon_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS coupon_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    INDEX idx_coupon_id (coupon_id),
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_coupon_user (coupon_id, user_id)
);

SELECT 'Database fixes applied successfully!' AS Status;
