-- Product Specification Classification System - Schema Only
-- This creates a hierarchical structure:
-- Classification Classes → Classification Attributes → Product Attribute Values

-- Step 1: Create Classification Classes table (e.g., Memory, Display, Camera, etc.)
CREATE TABLE IF NOT EXISTS classification_classes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
);

-- Step 2: Create Classification Attributes table (predefined attributes for each class)
-- e.g., Memory class has: RAM, ROM, Storage Type
-- e.g., Display class has: Screen Size, Resolution, Refresh Rate
CREATE TABLE IF NOT EXISTS classification_attributes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    data_type ENUM('TEXT', 'NUMBER', 'DROPDOWN', 'MULTISELECT') DEFAULT 'TEXT',
    unit VARCHAR(50), -- e.g., 'GB', 'inches', 'MP', 'Hz'
    allowed_values TEXT, -- JSON array for dropdown/multiselect options
    is_required BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    help_text VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classification_classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_attribute (class_id, name),
    INDEX idx_class_id (class_id),
    INDEX idx_is_active (is_active)
);

-- Step 3: Create Product-Classification mapping (which classes apply to this product)
CREATE TABLE IF NOT EXISTS product_classifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classification_classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_class (product_id, class_id),
    INDEX idx_product_id (product_id),
    INDEX idx_class_id (class_id)
);

-- Step 4: Create Product Attribute Values (supplier enters values here)
CREATE TABLE IF NOT EXISTS product_attribute_values (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    attribute_id BIGINT NOT NULL,
    attribute_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES classification_attributes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_attribute (product_id, attribute_id),
    INDEX idx_product_id (product_id),
    INDEX idx_attribute_id (attribute_id)
);
