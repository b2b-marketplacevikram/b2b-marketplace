-- Product Specification Classification System
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

-- Step 5: Insert default Classification Classes
INSERT INTO classification_classes (name, display_name, description, display_order) VALUES
('AdditionalDetails', 'Additional Details', 'General product information', 1),
('Memory', 'Memory & Storage', 'Memory and storage specifications', 2),
('Display', 'Display', 'Screen and display specifications', 3),
('Camera', 'Camera', 'Camera specifications', 4);

-- Step 6: Insert default Classification Attributes for each class

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
