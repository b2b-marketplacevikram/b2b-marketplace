-- Product Specification Classification System - Sample Data
-- This populates the classification tables with default categories and attributes

-- Insert default Classification Classes
INSERT INTO classification_classes (name, display_name, description, display_order) VALUES
('AdditionalDetails', 'Additional Details', 'General product information', 1),
('Memory', 'Memory & Storage', 'Memory and storage specifications', 2),
('Display', 'Display', 'Screen and display specifications', 3),
('Camera', 'Camera', 'Camera specifications', 4);

-- Insert default Classification Attributes for each class

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
