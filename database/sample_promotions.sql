-- Sample Order-Level Promotions
INSERT INTO promotions (name, description, type, promotion_level, discount_percentage, discount_amount, 
                        min_order_amount, max_discount_amount, valid_from, valid_until, is_active, 
                        priority, applicable_to) VALUES
-- 10% off orders above $500
('Order Discount 10%', 'Get 10% off on orders above $500', 'PERCENTAGE_OFF', 'ORDER_LEVEL', 
 10.00, NULL, 500.00, 100.00, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 10, 'ALL'),

-- $50 flat discount on orders above $1000
('Flat $50 Off', 'Save $50 on orders above $1000', 'FIXED_AMOUNT_OFF', 'ORDER_LEVEL', 
 NULL, 50.00, 1000.00, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 8, 'ALL'),

-- Flash Sale: 15% off on all orders above $300 (limited time)
('Flash Sale 15%', 'Limited time: 15% off on orders above $300', 'FLASH_SALE', 'ORDER_LEVEL', 
 15.00, NULL, 300.00, 150.00, '2024-12-01 00:00:00', '2025-12-31 23:59:59', TRUE, 15, 'ALL'),

-- 20% off orders above $2000 (Premium discount)
('Premium Order Discount', 'Get 20% off on orders above $2000', 'PERCENTAGE_OFF', 'ORDER_LEVEL', 
 20.00, NULL, 2000.00, 300.00, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 12, 'ALL');

-- Sample Product-Level Promotions
INSERT INTO promotions (name, description, type, promotion_level, discount_percentage, discount_amount, 
                        buy_quantity, get_quantity, valid_from, valid_until, is_active, 
                        priority, applicable_to, product_ids) VALUES
-- Buy 2 Get 1 Free on specific products
('Buy 2 Get 1 Free', 'Purchase 2 items and get 1 free', 'BUY_X_GET_Y', 'PRODUCT_LEVEL', 
 NULL, NULL, 2, 1, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 10, 'SPECIFIC_PRODUCTS', '1,2,3'),

-- 25% off on specific product category
('Electronics Sale', '25% off on all electronics', 'PERCENTAGE_OFF', 'PRODUCT_LEVEL', 
 25.00, NULL, NULL, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 8, 'SPECIFIC_CATEGORIES', NULL),

-- Flash Sale on products: 30% off
('Product Flash Sale', 'Flash sale: 30% off on selected products', 'FLASH_SALE', 'PRODUCT_LEVEL', 
 30.00, NULL, NULL, NULL, '2024-12-01 00:00:00', '2025-12-31 23:59:59', TRUE, 15, 'SPECIFIC_PRODUCTS', '4,5,6,7'),

-- $20 off on specific products
('Flat $20 Off Products', 'Save $20 on selected products', 'FIXED_AMOUNT_OFF', 'PRODUCT_LEVEL', 
 NULL, 20.00, NULL, NULL, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 7, 'SPECIFIC_PRODUCTS', '8,9,10'),

-- Buy 3 Get 2 Free (bulk purchase offer)
('Buy 3 Get 2 Free', 'Buy 3 and get 2 additional items free', 'BUY_X_GET_Y', 'PRODUCT_LEVEL', 
 NULL, NULL, 3, 2, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 12, 'ALL', NULL);

-- Sample Coupons (Order-level discounts via codes)
INSERT INTO coupons (code, name, description, discount_type, discount_value, min_order_amount, 
                     max_discount_amount, usage_limit, per_user_limit, valid_from, valid_until, 
                     is_active, applicable_to) VALUES
-- 15% off coupon with $200 min order
('SAVE15', 'Save 15% Coupon', 'Get 15% off on orders above $200', 'PERCENTAGE', 15.00, 200.00, 
 75.00, 1000, 3, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 'ALL'),

-- $30 flat discount coupon
('FLAT30', 'Flat $30 Off', 'Save $30 on your order', 'FIXED_AMOUNT', 30.00, 150.00, 
 NULL, 500, 2, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 'ALL'),

-- Free shipping coupon
('FREESHIP', 'Free Shipping', 'Get free shipping on all orders', 'FREE_SHIPPING', 0.00, 50.00, 
 NULL, NULL, 5, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 'ALL'),

-- Welcome coupon for new users
('WELCOME20', 'Welcome Coupon', 'Welcome! Get 20% off your first order', 'PERCENTAGE', 20.00, 100.00, 
 100.00, NULL, 1, '2024-01-01 00:00:00', '2025-12-31 23:59:59', TRUE, 'ALL');
