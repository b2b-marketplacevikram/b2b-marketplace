-- B2B Marketplace Database Schema
-- MySQL 8.0+

-- Drop existing database if needed
DROP DATABASE IF EXISTS b2b_marketplace;
CREATE DATABASE b2b_marketplace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE b2b_marketplace;

-- Users Table (Both Buyers and Suppliers)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('BUYER', 'SUPPLIER', 'ADMIN') NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- Supplier Details Table
CREATE TABLE suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    business_license VARCHAR(255),
    tax_id VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    total_customers INT DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 0.00,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0.00,
    years_in_business INT DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_company_name (company_name),
    INDEX idx_rating (rating),
    INDEX idx_verified (verified)
);

-- Buyer Details Table
CREATE TABLE buyers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    shipping_address TEXT,
    billing_address TEXT,
    tax_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories Table
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    parent_id BIGINT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_parent (parent_id)
);

-- Products Table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    description TEXT,
    specifications JSON,
    unit_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    moq INT NOT NULL DEFAULT 1,
    stock_quantity INT DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'piece',
    lead_time_days INT DEFAULT 7,
    sku VARCHAR(100),
    weight DECIMAL(10,2),
    dimensions VARCHAR(100),
    origin_country VARCHAR(100),
    country_of_origin VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(50),
    origin VARCHAR(100),
    warranty_period VARCHAR(100),
    certifications JSON,
    
    -- GST Compliance Fields
    mrp DECIMAL(10,2),
    hsn_code VARCHAR(10),
    gst_rate DECIMAL(5,2),
    
    -- Legal Metrology Fields
    manufacturing_date DATE,
    expiry_date DATE,
    net_quantity VARCHAR(50),
    weight_kg DECIMAL(10,3),
    length_cm DECIMAL(10,2),
    width_cm DECIMAL(10,2),
    height_cm DECIMAL(10,2),
    
    -- Warranty Information
    warranty_months INT,
    warranty_terms VARCHAR(500),
    
    -- Manufacturer Details
    manufacturer_name VARCHAR(200),
    manufacturer_address VARCHAR(500),
    
    -- Importer Details (for imported products)
    importer_name VARCHAR(200),
    importer_address VARCHAR(500),
    
    status ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED') DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    orders_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    reviews_count INT DEFAULT 0,
    average_rating DOUBLE,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_supplier (supplier_id),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_price (unit_price),
    INDEX idx_rating (rating),
    FULLTEXT idx_search (name, description)
);

-- Product Images Table
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url LONGTEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
);

-- Orders Table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    buyer_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    shipping_cost DECIMAL(12,2) DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    shipping_address TEXT,
    billing_address TEXT,
    tracking_number VARCHAR(100),
    shipping_method VARCHAR(100),
    estimated_delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    refund_reason TEXT,
    refund_amount DECIMAL(12,2),
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE RESTRICT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    INDEX idx_order_number (order_number),
    INDEX idx_buyer (buyer_id),
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Order Items Table
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(500) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    specifications JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Shopping Cart Table
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (buyer_id, product_id),
    INDEX idx_buyer (buyer_id)
);

-- Reviews Table
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    images JSON,
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_rating (rating),
    INDEX idx_created (created_at)
);

-- Conversations Table
CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    last_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_id BIGINT,
    unread_count_buyer INT NOT NULL DEFAULT 0,
    unread_count_supplier INT NOT NULL DEFAULT 0,
    cleared_by_buyer TIMESTAMP NULL,
    cleared_by_supplier TIMESTAMP NULL,
    INDEX idx_buyer (buyer_id),
    INDEX idx_supplier (supplier_id)
);

-- Messages Table
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    product_id BIGINT NULL,
    order_id BIGINT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_read (is_read)
);

-- Certifications Table
CREATE TABLE certifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supplier Certifications Table
CREATE TABLE supplier_certifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    certification_id BIGINT NOT NULL,
    certificate_number VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    document_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (certification_id) REFERENCES certifications(id) ON DELETE CASCADE,
    UNIQUE KEY unique_supplier_cert (supplier_id, certification_id)
);

-- Favorites/Wishlist Table
CREATE TABLE favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (buyer_id, product_id)
);

-- Notifications Table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_id BIGINT NULL,
    reference_type VARCHAR(50) NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_id BIGINT NULL,
    order_status VARCHAR(50) NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    notification_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
);

-- Payment Transactions Table
CREATE TABLE payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_transaction (transaction_id),
    INDEX idx_status (status)
);

-- Email Logs Table
CREATE TABLE email_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    retry_count INT DEFAULT 0,
    order_id BIGINT NULL,
    user_id BIGINT NULL,
    INDEX idx_recipient (recipient),
    INDEX idx_status (status),
    INDEX idx_email_type (email_type),
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id)
);

-- Bundles Table
CREATE TABLE bundles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage DECIMAL(5,2),
    original_price DECIMAL(12,2),
    bundle_price DECIMAL(12,2),
    min_order_quantity INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    INDEX idx_supplier (supplier_id),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured)
);

-- Bundle Items Table
CREATE TABLE bundle_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bundle_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bundle_id) REFERENCES bundles(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_bundle (bundle_id),
    INDEX idx_product (product_id)
);

-- Promotions Table
CREATE TABLE promotions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('PERCENTAGE_OFF', 'FIXED_AMOUNT_OFF', 'BUY_X_GET_Y', 'FLASH_SALE') NOT NULL,
    promotion_level ENUM('ORDER_LEVEL', 'PRODUCT_LEVEL') DEFAULT 'PRODUCT_LEVEL',
    min_order_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    buy_quantity INT,
    get_quantity INT,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    applicable_to VARCHAR(50) DEFAULT 'ALL',
    product_ids TEXT,
    category_ids TEXT,
    banner_image_url VARCHAR(500),
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_valid_dates (valid_from, valid_until),
    INDEX idx_type (type)
);

-- Coupons Table
CREATE TABLE coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    per_user_limit INT,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_to VARCHAR(50) DEFAULT 'ALL',
    product_ids TEXT,
    category_ids TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_valid_dates (valid_from, valid_until)
);

-- Coupon Usage Table
CREATE TABLE coupon_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_id BIGINT,
    discount_amount DECIMAL(10,2),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_coupon (coupon_id),
    INDEX idx_user (user_id),
    INDEX idx_order (order_id)
);

-- ==================== Quote (RFQ) Tables ====================

-- Quotes Table (Request for Quote)
CREATE TABLE quotes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id BIGINT NOT NULL,
    buyer_name VARCHAR(255),
    buyer_email VARCHAR(255),
    buyer_phone VARCHAR(50),
    buyer_company VARCHAR(255),
    supplier_id BIGINT NOT NULL,
    supplier_name VARCHAR(255),
    status ENUM('PENDING','SUPPLIER_RESPONDED','BUYER_REVIEWING','NEGOTIATING','APPROVED','CONVERTED','REJECTED','CANCELLED','EXPIRED') DEFAULT 'PENDING',
    original_total DECIMAL(12,2),
    quoted_total DECIMAL(12,2),
    final_total DECIMAL(12,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    shipping_address TEXT,
    buyer_requirements TEXT,
    supplier_notes TEXT,
    rejection_reason TEXT,
    validity_days INT DEFAULT 15,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    converted_to_order_at TIMESTAMP NULL,
    order_id BIGINT,
    order_number VARCHAR(50),
    is_from_cart BOOLEAN DEFAULT FALSE,
    negotiation_count INT DEFAULT 0,
    INDEX idx_buyer (buyer_id),
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status),
    INDEX idx_quote_number (quote_number)
);

-- Quote Items Table
CREATE TABLE quote_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quote_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(500) NOT NULL,
    product_image TEXT,
    quantity INT NOT NULL,
    requested_quantity INT,
    original_price DECIMAL(12,2) NOT NULL,
    quoted_price DECIMAL(12,2),
    final_price DECIMAL(12,2),
    unit VARCHAR(50) DEFAULT 'piece',
    specifications TEXT,
    supplier_notes TEXT,
    lead_time_days INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    INDEX idx_quote (quote_id)
);

-- Quote Messages Table (Negotiation thread)
CREATE TABLE quote_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quote_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    sender_name VARCHAR(255),
    sender_type ENUM('BUYER','SUPPLIER','SYSTEM') NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('TEXT','PRICE_UPDATE','COUNTER_OFFER','APPROVAL','REJECTION','EXTENSION','SYSTEM') DEFAULT 'TEXT',
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    INDEX idx_quote (quote_id)
);

-- ==================== Dispute Tables ====================

-- Disputes Table (Compliant with Indian E-Commerce Laws - Consumer Protection Act 2019)
CREATE TABLE disputes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    order_id BIGINT NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    buyer_id BIGINT NOT NULL,
    buyer_name VARCHAR(255),
    buyer_email VARCHAR(255),
    buyer_phone VARCHAR(50),
    supplier_id BIGINT NOT NULL,
    supplier_name VARCHAR(255),
    
    -- Dispute Details
    dispute_type ENUM('PRODUCT_NOT_AS_DESCRIBED', 'PRODUCT_DAMAGED', 'PRODUCT_NOT_DELIVERED', 
                      'WRONG_PRODUCT', 'QUALITY_ISSUE', 'QUANTITY_MISMATCH', 'LATE_DELIVERY',
                      'PAYMENT_ISSUE', 'REFUND_NOT_RECEIVED', 'OTHER') NOT NULL,
    status ENUM('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'AWAITING_BUYER', 'AWAITING_SUPPLIER',
                'ESCALATED', 'RESOLVED', 'CLOSED', 'REJECTED') DEFAULT 'OPEN',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Affected Items (JSON array of product IDs/names)
    affected_items TEXT,
    evidence_urls TEXT, -- JSON array of image/document URLs
    
    -- Refund Request
    refund_requested BOOLEAN DEFAULT FALSE,
    refund_amount DECIMAL(12, 2),
    refund_status ENUM('NOT_REQUESTED', 'PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED'),
    refund_processed_at TIMESTAMP NULL,
    
    -- Resolution Details
    resolution_type ENUM('REFUND_FULL', 'REFUND_PARTIAL', 'REPLACEMENT', 'CREDIT_NOTE', 
                         'NO_ACTION', 'OTHER'),
    resolution_notes TEXT,
    resolved_by BIGINT,
    resolved_by_name VARCHAR(255),
    
    -- Compliance Tracking (Indian E-Commerce Rules 2020)
    acknowledgment_deadline TIMESTAMP, -- 48 hours from creation
    acknowledged_at TIMESTAMP NULL,
    resolution_deadline TIMESTAMP, -- 30 days from creation
    resolved_at TIMESTAMP NULL,
    escalated_at TIMESTAMP NULL,
    escalation_level INT DEFAULT 0, -- 0=None, 1=Senior Support, 2=Management, 3=Legal/Nodal Officer
    escalation_reason VARCHAR(500),
    
    -- Satisfaction
    buyer_satisfaction_rating INT CHECK (buyer_satisfaction_rating BETWEEN 1 AND 5),
    buyer_feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    
    INDEX idx_ticket (ticket_number),
    INDEX idx_order (order_id),
    INDEX idx_buyer (buyer_id),
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Dispute Messages Table (Communication thread for dispute resolution)
CREATE TABLE dispute_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dispute_id BIGINT NOT NULL,
    sender_id BIGINT,
    sender_name VARCHAR(255),
    sender_type ENUM('BUYER', 'SUPPLIER', 'ADMIN', 'SYSTEM') NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('TEXT', 'EVIDENCE', 'RESOLUTION_OFFER', 'STATUS_UPDATE', 'SYSTEM') DEFAULT 'TEXT',
    attachments TEXT, -- JSON array of URLs
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to buyer
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    INDEX idx_dispute (dispute_id),
    INDEX idx_sender (sender_id)
);

-- ==================== Bank Details Tables ====================

-- Buyer Bank Details Table (for refunds)
CREATE TABLE buyer_bank_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20),
    upi_id VARCHAR(100),
    swift_code VARCHAR(20),
    branch_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    INDEX idx_buyer (buyer_id)
);

-- Supplier Bank Details Table (for payouts)
CREATE TABLE supplier_bank_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    upi_id VARCHAR(100),
    swift_code VARCHAR(20),
    branch_name VARCHAR(255),
    branch_address VARCHAR(500),
    is_primary BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    INDEX idx_supplier (supplier_id)
);

-- ==================== Refund Tables ====================

-- Refund Requests Table
CREATE TABLE refund_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    buyer_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,
    refund_amount DECIMAL(12, 2) NOT NULL,
    refund_method ENUM('ORIGINAL_PAYMENT', 'BANK_TRANSFER', 'WALLET_CREDIT') NOT NULL,
    reason VARCHAR(500) NOT NULL,
    status ENUM('PENDING', 'BUYER_CONFIRMED', 'PROCESSING', 'COMPLETED', 'REJECTED') DEFAULT 'PENDING',
    buyer_bank_details_id BIGINT,
    original_payment_ref VARCHAR(255),
    supplier_notes VARCHAR(500),
    buyer_notes VARCHAR(500),
    initiated_by BIGINT,
    confirmed_at TIMESTAMP NULL,
    processed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE RESTRICT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    FOREIGN KEY (buyer_bank_details_id) REFERENCES buyer_bank_details(id) ON DELETE SET NULL,
    INDEX idx_order (order_id),
    INDEX idx_buyer (buyer_id),
    INDEX idx_supplier (supplier_id),
    INDEX idx_status (status)
);
