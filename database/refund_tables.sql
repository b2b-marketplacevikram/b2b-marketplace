-- ============================================
-- Refund Transaction Table for Dispute Resolution
-- ============================================
-- This table stores refund transaction details submitted by suppliers
-- and buyer confirmation of receipt

CREATE TABLE IF NOT EXISTS refund_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dispute_id BIGINT NOT NULL,
    ticket_number VARCHAR(50) NOT NULL,
    supplier_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    
    -- Transaction Details from Supplier
    transaction_id VARCHAR(100) NOT NULL COMMENT 'Bank transaction/UTR number',
    bank_name VARCHAR(100) COMMENT 'Bank from which refund was sent',
    transaction_date DATETIME COMMENT 'Date when refund was processed',
    proof_url VARCHAR(500) COMMENT 'URL to transaction proof/screenshot',
    notes TEXT COMMENT 'Additional notes from supplier',
    
    -- Buyer Confirmation
    buyer_confirmed BOOLEAN DEFAULT FALSE COMMENT 'Buyer confirmed receipt of refund',
    confirmed_at DATETIME COMMENT 'When buyer confirmed',
    confirmation_notes TEXT COMMENT 'Notes from buyer during confirmation',
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_dispute_id (dispute_id),
    INDEX idx_supplier_id (supplier_id),
    INDEX idx_buyer_id (buyer_id),
    
    -- Foreign Keys (uncomment if foreign key constraints are needed)
    -- CONSTRAINT fk_refund_dispute FOREIGN KEY (dispute_id) REFERENCES disputes(id),
    -- CONSTRAINT fk_refund_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    -- CONSTRAINT fk_refund_buyer FOREIGN KEY (buyer_id) REFERENCES users(id)
    
    UNIQUE KEY uk_ticket_number (ticket_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Buyer Bank Details Table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS buyer_bank_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_holder_name VARCHAR(200) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) COMMENT 'IFSC code for Indian banks',
    upi_id VARCHAR(100) COMMENT 'UPI ID for quick payments',
    swift_code VARCHAR(20) COMMENT 'SWIFT code for international transfers',
    branch_name VARCHAR(200),
    is_primary BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_buyer_id (buyer_id),
    
    -- Foreign Key (uncomment if needed)
    -- CONSTRAINT fk_bank_buyer FOREIGN KEY (buyer_id) REFERENCES users(id)
    
    UNIQUE KEY uk_buyer_primary (buyer_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- Sample Data for Testing
-- ============================================
-- INSERT INTO buyer_bank_details (buyer_id, bank_name, account_holder_name, account_number, ifsc_code, upi_id)
-- VALUES (1, 'HDFC Bank', 'John Buyer', '1234567890123456', 'HDFC0001234', 'john@upi');
