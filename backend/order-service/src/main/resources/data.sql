-- Seed data for supplier bank details
-- This file runs on application startup if spring.sql.init.mode=always is set

-- Create table if not exists (for safety)
CREATE TABLE IF NOT EXISTS supplier_bank_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_holder_name VARCHAR(200) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    upi_id VARCHAR(100),
    swift_code VARCHAR(20),
    branch_name VARCHAR(100),
    branch_address VARCHAR(500),
    is_primary BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_supplier_primary (supplier_id, is_primary)
);

-- Delete existing test data to avoid duplicates
DELETE FROM supplier_bank_details WHERE supplier_id IN (1, 2, 3, 4, 5, 39);

-- Supplier 1: TechVision Electronics
INSERT INTO supplier_bank_details 
(supplier_id, bank_name, account_holder_name, account_number, ifsc_code, upi_id, branch_name, is_primary, is_verified)
VALUES 
(1, 'State Bank of India', 'TechVision Electronics Pvt Ltd', '31245678901234', 'SBIN0001234', 'techvision@sbi', 'MG Road Branch, Bangalore', TRUE, TRUE);

-- Supplier 2: Global Industrial Supplies
INSERT INTO supplier_bank_details 
(supplier_id, bank_name, account_holder_name, account_number, ifsc_code, upi_id, branch_name, is_primary, is_verified)
VALUES 
(2, 'HDFC Bank', 'Global Industrial Supplies Ltd', '50100458723456', 'HDFC0002345', 'globalindustrial@hdfc', 'Andheri East Branch, Mumbai', TRUE, TRUE);

-- Supplier 3: Premium Textiles Co
INSERT INTO supplier_bank_details 
(supplier_id, bank_name, account_holder_name, account_number, ifsc_code, upi_id, branch_name, is_primary, is_verified)
VALUES 
(3, 'ICICI Bank', 'Premium Textiles Company', '124578963214', 'ICIC0003456', 'premiumtex@icici', 'Ring Road Branch, Surat', TRUE, TRUE);

-- Supplier 4: Heavy Machinery Corp
INSERT INTO supplier_bank_details 
(supplier_id, bank_name, account_holder_name, account_number, ifsc_code, upi_id, branch_name, is_primary, is_verified)
VALUES 
(4, 'Axis Bank', 'Heavy Machinery Corporation', '917020012345678', 'UTIB0004567', 'heavymachinery@axis', 'Industrial Area Branch, Chennai', TRUE, TRUE);

-- Supplier 5: ChemPro Solutions
INSERT INTO supplier_bank_details 
(supplier_id, bank_name, account_holder_name, account_number, ifsc_code, upi_id, branch_name, is_primary, is_verified)
VALUES 
(5, 'Kotak Mahindra Bank', 'ChemPro Solutions India Pvt Ltd', '4112345678901', 'KKBK0005678', 'chempro@kotak', 'MIDC Branch, Pune', TRUE, TRUE);

-- Supplier 39: (from your screenshot)
INSERT INTO supplier_bank_details 
(supplier_id, bank_name, account_holder_name, account_number, ifsc_code, upi_id, branch_name, is_primary, is_verified)
VALUES 
(39, 'Punjab National Bank', 'Supplier 39 Enterprises', '0846123456789012', 'PUNB0123400', 'supplier39@pnb', 'Main Branch, Delhi', TRUE, TRUE);
