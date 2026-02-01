-- Sample Data for B2B Marketplace
USE b2b_marketplace;

-- Insert Categories
INSERT INTO categories (name, slug, description, icon, image_url, display_order) VALUES
('Electronics', 'electronics', 'Electronic components and devices', '💻', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400', 1),
('Machinery', 'machinery', 'Industrial machinery and equipment', '⚙️', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', 2),
('Textiles', 'textiles', 'Fabrics and textile products', '🧵', 'https://images.unsplash.com/photo-1558769132-cb1aea27c2e2?w=400', 3),
('Chemicals', 'chemicals', 'Industrial chemicals and raw materials', '🧪', 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400', 4),
('Construction Materials', 'construction-materials', 'Building and construction supplies', '🏗️', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400', 5),
('Automotive Parts', 'automotive-parts', 'Auto parts and accessories', '🚗', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', 6),
('Food & Beverages', 'food-beverages', 'Food products and ingredients', '🍎', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', 7),
('Packaging', 'packaging', 'Packaging materials and solutions', '📦', 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400', 8);

-- Insert Certifications
INSERT INTO certifications (name, description) VALUES
('ISO 9001', 'Quality Management System'),
('ISO 14001', 'Environmental Management System'),
('CE Certification', 'European Conformity'),
('FDA Approved', 'Food and Drug Administration Approval'),
('RoHS', 'Restriction of Hazardous Substances'),
('OEKO-TEX', 'Textile Safety Standard');

-- Insert Sample Users (Buyers)
INSERT INTO users (email, password_hash, user_type, full_name, phone, is_verified) VALUES
('buyer1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'BUYER', 'John Smith', '+1-555-0101', TRUE),
('buyer2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'BUYER', 'Sarah Johnson', '+1-555-0102', TRUE),
('buyer3@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'BUYER', 'Michael Chen', '+86-138-0000-1234', TRUE);

-- Insert Sample Users (Suppliers)
INSERT INTO users (email, password_hash, user_type, full_name, phone, is_verified) VALUES
('supplier1@techcorp.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUPPLIER', 'David Wang', '+86-138-1111-2222', TRUE),
('supplier2@globalmanuf.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUPPLIER', 'Lisa Anderson', '+1-555-0201', TRUE),
('supplier3@easttrade.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUPPLIER', 'Robert Kim', '+82-10-1234-5678', TRUE),
('supplier4@eurosupply.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUPPLIER', 'Emma Mueller', '+49-172-9876543', TRUE);

-- Insert Buyers
INSERT INTO buyers (user_id, company_name, country, city, shipping_address) VALUES
(1, 'Tech Solutions Inc', 'United States', 'New York', '123 Business Ave, New York, NY 10001'),
(2, 'Global Imports LLC', 'United States', 'Los Angeles', '456 Commerce St, Los Angeles, CA 90001'),
(3, 'Shanghai Trading Co', 'China', 'Shanghai', '789 Trade Road, Pudong District, Shanghai');

-- Insert Suppliers
INSERT INTO suppliers (user_id, company_name, business_type, country, city, address, description, rating, total_orders, total_customers, response_rate, on_time_delivery_rate, years_in_business, verified) VALUES
(4, 'Shenzhen TechCorp Electronics', 'Manufacturer', 'China', 'Shenzhen', 'Building A, Industrial Park, Nanshan District', 'Leading manufacturer of electronic components and consumer electronics with 15+ years of experience', 4.8, 5420, 892, 98.5, 96.2, 15, TRUE),
(5, 'Global Manufacturing Solutions', 'Trading Company', 'United States', 'Chicago', '1000 Manufacturing Blvd, Chicago, IL', 'Premium industrial machinery supplier serving North America', 4.6, 3210, 456, 95.3, 94.8, 12, TRUE),
(6, 'East Asia Trading Group', 'Manufacturer', 'South Korea', 'Seoul', '50 Industrial Complex, Gangnam-gu', 'Textile and apparel manufacturing with sustainable practices', 4.7, 2890, 654, 96.8, 95.5, 10, TRUE),
(7, 'Euro Supply Chain', 'Distributor', 'Germany', 'Munich', 'Industriestrasse 45, Munich', 'Chemical and raw material distribution across Europe', 4.5, 1567, 287, 93.2, 92.7, 8, TRUE);

-- Insert Supplier Certifications
INSERT INTO supplier_certifications (supplier_id, certification_id, certificate_number, issue_date, expiry_date, is_verified) VALUES
(1, 1, 'ISO9001-2023-001', '2023-01-15', '2026-01-15', TRUE),
(1, 3, 'CE-2023-5678', '2023-03-20', '2028-03-20', TRUE),
(2, 1, 'ISO9001-2022-450', '2022-06-10', '2025-06-10', TRUE),
(3, 6, 'OEKO-TEX-2023-789', '2023-02-28', '2024-02-28', TRUE),
(4, 2, 'ISO14001-2023-100', '2023-05-15', '2026-05-15', TRUE);

-- Insert Products
INSERT INTO products (supplier_id, category_id, name, slug, description, unit_price, moq, stock_quantity, unit, lead_time_days, sku, origin_country, warranty_period, status, views_count, orders_count, rating, reviews_count) VALUES
(1, 1, 'Wireless Bluetooth Earbuds TWS-5000', 'wireless-bluetooth-earbuds-tws-5000', 'Premium wireless earbuds with active noise cancellation, 30-hour battery life, and IPX7 waterproof rating. Perfect for retail or corporate gifts.', 12.50, 500, 50000, 'piece', 14, 'TWS-5000-BLK', 'China', '12 months', 'ACTIVE', 15420, 342, 4.7, 89),
(1, 1, 'Smartphone Charging Cable USB-C', 'smartphone-charging-cable-usb-c', 'Fast charging USB-C cable with 100W power delivery support, braided nylon design, 6ft length. Bulk orders available.', 2.80, 1000, 100000, 'piece', 7, 'CABLE-USBC-6FT', 'China', '6 months', 'ACTIVE', 8932, 567, 4.5, 134),
(1, 1, 'Portable Power Bank 20000mAh', 'portable-power-bank-20000mah', 'High-capacity power bank with dual USB ports and USB-C input/output. LED display shows remaining battery. Ideal for promotional products.', 15.99, 300, 25000, 'piece', 10, 'PWR-BANK-20K', 'China', '12 months', 'ACTIVE', 12567, 289, 4.8, 76),
(2, 2, 'Industrial CNC Milling Machine', 'industrial-cnc-milling-machine', 'Precision CNC milling machine with 3-axis control, suitable for metal and plastic manufacturing. Includes training and installation.', 28500.00, 1, 15, 'unit', 45, 'CNC-MILL-3X-500', 'United States', '24 months', 'ACTIVE', 3421, 12, 4.9, 8),
(2, 2, 'Hydraulic Press 100 Ton', 'hydraulic-press-100-ton', 'Heavy-duty hydraulic press for metal forming, stamping, and compression operations. CE certified with safety features.', 35000.00, 1, 8, 'unit', 60, 'HYD-PRESS-100T', 'United States', '24 months', 'ACTIVE', 2156, 5, 4.6, 3),
(3, 3, 'Organic Cotton Fabric Roll', 'organic-cotton-fabric-roll', 'GOTS certified organic cotton fabric, 150cm width, 200gsm weight. Available in various colors. Perfect for apparel manufacturing.', 8.50, 500, 50000, 'meter', 15, 'COT-ORG-150-200', 'South Korea', 'N/A', 'ACTIVE', 6789, 234, 4.6, 45),
(3, 3, 'Polyester Blend Textile', 'polyester-blend-textile', 'Durable polyester-cotton blend fabric (65/35), wrinkle-resistant, 140cm width. Ideal for workwear and uniforms.', 5.20, 1000, 80000, 'meter', 12, 'POLY-BLEND-140', 'South Korea', 'N/A', 'ACTIVE', 5432, 198, 4.4, 34),
(4, 4, 'Industrial Grade Acetone', 'industrial-grade-acetone', 'High purity acetone (99.5%) in bulk quantities. Suitable for manufacturing, cleaning, and laboratory use. Proper shipping documentation included.', 3.20, 1000, 500000, 'liter', 20, 'CHEM-ACET-IND', 'Germany', 'N/A', 'ACTIVE', 4234, 87, 4.7, 12),
(1, 1, 'Smart Watch Fitness Tracker', 'smart-watch-fitness-tracker', 'Multi-function smart watch with heart rate monitor, sleep tracking, waterproof design. Compatible with iOS and Android.', 18.75, 200, 30000, 'piece', 12, 'WATCH-FIT-2024', 'China', '12 months', 'ACTIVE', 9876, 187, 4.6, 52),
(2, 6, 'Automotive Brake Pads Set', 'automotive-brake-pads-set', 'Premium ceramic brake pads compatible with most sedan models. Low dust formula, excellent stopping power. OEM quality.', 25.00, 100, 5000, 'set', 7, 'BRAKE-PAD-CER', 'United States', '12 months', 'ACTIVE', 3421, 156, 4.8, 28);

-- Insert Product Images
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df', TRUE, 1),
(1, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7', FALSE, 2),
(2, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261', TRUE, 1),
(5, 'https://images.unsplash.com/photo-1513828583688-c52646db42da', TRUE, 1),
(6, 'https://images.unsplash.com/photo-1558769132-cb1aea3c638d', TRUE, 1),
(7, 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1', TRUE, 1),
(8, 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69', TRUE, 1),
(9, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a', TRUE, 1),
(10, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3', TRUE, 1);

-- Insert Sample Orders
INSERT INTO orders (order_number, buyer_id, supplier_id, status, payment_status, payment_method, subtotal, tax_amount, shipping_cost, total_amount, shipping_address, tracking_number, shipping_method, estimated_delivery_date) VALUES
('ORD-2024-001', 1, 1, 'DELIVERED', 'PAID', 'Bank Transfer', 6250.00, 562.50, 150.00, 6962.50, '123 Business Ave, New York, NY 10001', 'TRK-US-20240115-001', 'Express Shipping', '2024-02-01'),
('ORD-2024-002', 2, 2, 'SHIPPED', 'PAID', 'Letter of Credit', 28500.00, 2565.00, 500.00, 31565.00, '456 Commerce St, Los Angeles, CA 90001', 'TRK-US-20240120-045', 'Freight', '2024-03-15'),
('ORD-2024-003', 1, 3, 'PROCESSING', 'PAID', 'PayPal', 4250.00, 382.50, 200.00, 4832.50, '123 Business Ave, New York, NY 10001', NULL, 'Standard Shipping', '2024-02-28'),
('ORD-2024-004', 3, 1, 'PENDING', 'PENDING', 'Bank Transfer', 3749.25, 337.43, 180.00, 4266.68, '789 Trade Road, Pudong District, Shanghai', NULL, 'Sea Freight', '2024-03-30'),
('ORD-2024-005', 2, 4, 'CONFIRMED', 'PAID', 'Credit Card', 3200.00, 288.00, 120.00, 3608.00, '456 Commerce St, Los Angeles, CA 90001', 'TRK-US-20240125-089', 'Air Freight', '2024-02-20');

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
(1, 1, 'Wireless Bluetooth Earbuds TWS-5000', 500, 12.50, 6250.00),
(2, 4, 'Industrial CNC Milling Machine', 1, 28500.00, 28500.00),
(3, 6, 'Organic Cotton Fabric Roll', 500, 8.50, 4250.00),
(4, 2, 'Smartphone Charging Cable USB-C', 1000, 2.80, 2800.00),
(4, 9, 'Smart Watch Fitness Tracker', 50, 18.99, 949.50),
(5, 8, 'Industrial Grade Acetone', 1000, 3.20, 3200.00);

-- Insert Reviews
INSERT INTO reviews (product_id, buyer_id, order_id, rating, title, comment, is_verified_purchase) VALUES
(1, 1, 1, 5, 'Excellent Quality Earbuds', 'Great sound quality and battery life. Our customers love them. Fast shipping and good communication from supplier.', TRUE),
(1, 2, 1, 4, 'Good value for bulk order', 'Quality is consistent across the batch. Minor packaging improvements needed but overall satisfied.', TRUE),
(4, 2, 2, 5, 'Professional Service', 'Machine arrived well-packaged. Installation support was excellent. Already producing quality parts.', TRUE),
(6, 1, 3, 5, 'Premium Organic Fabric', 'GOTS certification verified. Fabric quality is exceptional. Will reorder soon.', TRUE),
(2, 3, 4, 4, 'Reliable USB-C Cables', 'Good build quality. Fast charging works well. One star off for slightly longer lead time than expected.', TRUE);

-- Insert Cart Items
INSERT INTO cart_items (buyer_id, product_id, quantity) VALUES
(1, 3, 300),
(1, 9, 200),
(2, 10, 150),
(3, 7, 1000);

-- Insert Favorites
INSERT INTO favorites (buyer_id, product_id) VALUES
(1, 1),
(1, 4),
(1, 9),
(2, 2),
(2, 4),
(2, 10),
(3, 6),
(3, 7);

-- Insert Messages
INSERT INTO messages (sender_id, receiver_id, product_id, subject, message, is_read) VALUES
(1, 4, 1, 'Bulk Order Inquiry', 'Hello, I am interested in ordering 5000 units of the TWS-5000 earbuds. Can you provide a better price for this quantity?', TRUE),
(4, 1, 1, 'RE: Bulk Order Inquiry', 'Thank you for your inquiry. For 5000 units, we can offer $11.80 per unit. Lead time would be 18 days. Would you like to proceed?', TRUE),
(2, 5, 4, 'Machine Specifications', 'Could you provide detailed specifications and power requirements for the CNC milling machine?', FALSE);

-- Insert Notifications
INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type, is_read) VALUES
(1, 'ORDER', 'Order Confirmed', 'Your order ORD-2024-001 has been confirmed by the supplier.', 1, 'ORDER', TRUE),
(1, 'ORDER', 'Order Shipped', 'Your order ORD-2024-001 has been shipped. Tracking: TRK-US-20240115-001', 1, 'ORDER', TRUE),
(4, 'ORDER', 'New Order Received', 'You have received a new order ORD-2024-004', 4, 'ORDER', FALSE),
(2, 'MESSAGE', 'New Message', 'You have a new message from Global Manufacturing Solutions', 3, 'MESSAGE', FALSE);

-- Insert Payment Transactions
INSERT INTO payment_transactions (order_id, transaction_id, payment_method, amount, status) VALUES
(1, 'TXN-20240115-001', 'Bank Transfer', 6962.50, 'SUCCESS'),
(2, 'TXN-20240120-045', 'Letter of Credit', 31565.00, 'SUCCESS'),
(3, 'TXN-20240122-089', 'PayPal', 4832.50, 'SUCCESS'),
(5, 'TXN-20240125-123', 'Credit Card', 3608.00, 'SUCCESS');

-- ====================================================================
-- CLASSIFICATION SYSTEM SAMPLE DATA
-- ====================================================================

-- Insert default Classification Classes
INSERT INTO classification_classes (name, display_name, description, display_order) VALUES
('AdditionalDetails', 'Additional Details', 'General product information', 1),
('Memory', 'Memory & Storage', 'Memory and storage specifications', 2),
('Display', 'Display', 'Screen and display specifications', 3),
('Camera', 'Camera', 'Camera specifications', 4);

-- Additional Details Attributes
INSERT INTO classification_attributes (class_id, name, display_name, data_type, unit, is_required, display_order) VALUES
((SELECT id FROM classification_classes WHERE name = 'AdditionalDetails'), 'operating_system', 'Operating System', 'TEXT', NULL, TRUE, 1),
((SELECT id FROM classification_classes WHERE name = 'AdditionalDetails'), 'processor_speed', 'Processor Speed', 'TEXT', 'GHz', FALSE, 2),
((SELECT id FROM classification_classes WHERE name = 'AdditionalDetails'), 'form_factor', 'Form Factor', 'TEXT', NULL, FALSE, 3),
((SELECT id FROM classification_classes WHERE name = 'AdditionalDetails'), 'color', 'Colour', 'TEXT', NULL, FALSE, 4),
((SELECT id FROM classification_classes WHERE name = 'AdditionalDetails'), 'sim_card_slot', 'SIM Card Slot Count', 'TEXT', NULL, FALSE, 5),
((SELECT id FROM classification_classes WHERE name = 'AdditionalDetails'), 'connector_type', 'Connector Type', 'TEXT', NULL, FALSE, 6),
((SELECT id FROM classification_classes WHERE name = 'AdditionalDetails'), 'biometric_security', 'Biometric Security Feature', 'TEXT', NULL, FALSE, 7),
((SELECT id FROM classification_classes WHERE name = 'AdditionalDetails'), 'human_interface', 'Human Interface Types', 'TEXT', NULL, FALSE, 8),
((SELECT id FROM classification_classes WHERE name = 'AdditionalDetails'), 'sim_card_size', 'Sim Card Size', 'TEXT', NULL, FALSE, 9);

-- Memory Attributes
INSERT INTO classification_attributes (class_id, name, display_name, data_type, unit, is_required, display_order) VALUES
((SELECT id FROM classification_classes WHERE name = 'Memory'), 'ram', 'RAM Memory Installed', 'TEXT', 'GB', TRUE, 1),
((SELECT id FROM classification_classes WHERE name = 'Memory'), 'storage_capacity', 'Memory Storage Capacity', 'TEXT', 'GB', TRUE, 2),
((SELECT id FROM classification_classes WHERE name = 'Memory'), 'storage_type', 'Storage Type', 'TEXT', NULL, FALSE, 3),
((SELECT id FROM classification_classes WHERE name = 'Memory'), 'expandable_storage', 'Expandable Storage', 'TEXT', 'GB', FALSE, 4);

-- Display Attributes
INSERT INTO classification_attributes (class_id, name, display_name, data_type, unit, is_required, display_order) VALUES
((SELECT id FROM classification_classes WHERE name = 'Display'), 'screen_size', 'Screen Size', 'TEXT', 'inches', TRUE, 1),
((SELECT id FROM classification_classes WHERE name = 'Display'), 'resolution', 'Resolution', 'TEXT', 'pixels', TRUE, 2),
((SELECT id FROM classification_classes WHERE name = 'Display'), 'refresh_rate', 'Refresh Rate', 'TEXT', 'Hz', FALSE, 3),
((SELECT id FROM classification_classes WHERE name = 'Display'), 'display_type', 'Display Type', 'TEXT', NULL, FALSE, 4),
((SELECT id FROM classification_classes WHERE name = 'Display'), 'touch_screen', 'Touch Screen', 'TEXT', NULL, FALSE, 5);

-- Camera Attributes  
INSERT INTO classification_attributes (class_id, name, display_name, data_type, unit, is_required, display_order) VALUES
((SELECT id FROM classification_classes WHERE name = 'Camera'), 'rear_camera', 'Rear Facing Camera Photo Sensor Resolution', 'TEXT', 'MP', TRUE, 1),
((SELECT id FROM classification_classes WHERE name = 'Camera'), 'front_camera', 'Front Photo Sensor Resolution', 'TEXT', 'MP', TRUE, 2),
((SELECT id FROM classification_classes WHERE name = 'Camera'), 'camera_description', 'Camera Description', 'TEXT', NULL, FALSE, 3),
((SELECT id FROM classification_classes WHERE name = 'Camera'), 'video_capture_resolution', 'Video Capture Resolution', 'TEXT', NULL, FALSE, 4);
