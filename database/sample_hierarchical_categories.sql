-- Sample Data for Hierarchical Categories with Images
-- Run this after the main sample_data.sql

-- First, get the parent category IDs
SET @electronics_id = (SELECT id FROM categories WHERE slug = 'electronics');
SET @machinery_id = (SELECT id FROM categories WHERE slug = 'machinery');
SET @textiles_id = (SELECT id FROM categories WHERE slug = 'textiles');

-- ============================================
-- ELECTRONICS SUBCATEGORIES (Level 1)
-- ============================================

INSERT INTO categories (name, slug, description, icon, image_url, parent_id, display_order, is_active) VALUES
('Computers & Laptops', 'computers-laptops', 'Desktop computers, laptops, and accessories', '💻', 
 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', @electronics_id, 1, TRUE),
('Mobile Devices', 'mobile-devices', 'Smartphones, tablets, and accessories', '📱', 
 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', @electronics_id, 2, TRUE),
('Audio & Video', 'audio-video', 'Audio equipment, headphones, and video devices', '🎧', 
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', @electronics_id, 3, TRUE),
('Cameras & Photography', 'cameras-photography', 'Digital cameras, lenses, and photography equipment', '📷', 
 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400', @electronics_id, 4, TRUE),
('Home Appliances', 'home-appliances', 'Household electronic appliances', '🏠', 
 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400', @electronics_id, 5, TRUE),
('Gaming & Consoles', 'gaming-consoles', 'Gaming consoles, accessories, and equipment', '🎮', 
 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400', @electronics_id, 6, TRUE);

-- Get Level 1 subcategory IDs
SET @computers_id = (SELECT id FROM categories WHERE slug = 'computers-laptops');
SET @mobile_id = (SELECT id FROM categories WHERE slug = 'mobile-devices');
SET @audio_video_id = (SELECT id FROM categories WHERE slug = 'audio-video');
SET @cameras_id = (SELECT id FROM categories WHERE slug = 'cameras-photography');
SET @appliances_id = (SELECT id FROM categories WHERE slug = 'home-appliances');
SET @gaming_id = (SELECT id FROM categories WHERE slug = 'gaming-consoles');

-- ============================================
-- ELECTRONICS SUBCATEGORIES (Level 2)
-- ============================================

-- Under Computers & Laptops
INSERT INTO categories (name, slug, description, icon, image_url, parent_id, display_order, is_active) VALUES
('Desktop Computers', 'desktop-computers', 'Complete desktop systems and towers', '🖥️', 
 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400', @computers_id, 1, TRUE),
('Laptops', 'laptops', 'Notebook computers and ultrabooks', '💻', 
 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', @computers_id, 2, TRUE),
('Computer Components', 'computer-components', 'CPUs, RAM, motherboards, and parts', '🔧', 
 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400', @computers_id, 3, TRUE),
('Monitors & Displays', 'monitors-displays', 'Computer monitors and display screens', '🖥️', 
 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400', @computers_id, 4, TRUE),
('Keyboards & Mice', 'keyboards-mice', 'Input devices and peripherals', '⌨️', 
 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', @computers_id, 5, TRUE);

-- Under Mobile Devices
INSERT INTO categories (name, slug, description, icon, image_url, parent_id, display_order, is_active) VALUES
('Smartphones', 'smartphones', 'Mobile phones and smartphones', '📱', 
 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', @mobile_id, 1, TRUE),
('Tablets', 'tablets', 'Tablet computers and e-readers', '📱', 
 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400', @mobile_id, 2, TRUE),
('Phone Accessories', 'phone-accessories', 'Cases, chargers, and mobile accessories', '🔌', 
 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400', @mobile_id, 3, TRUE),
('Smartwatches', 'smartwatches', 'Wearable smart devices', '⌚', 
 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', @mobile_id, 4, TRUE);

-- Under Audio & Video
INSERT INTO categories (name, slug, description, icon, image_url, parent_id, display_order, is_active) VALUES
('Headphones & Earbuds', 'headphones-earbuds', 'Wired and wireless headphones', '🎧', 
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', @audio_video_id, 1, TRUE),
('Speakers', 'speakers', 'Bluetooth and portable speakers', '🔊', 
 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', @audio_video_id, 2, TRUE),
('Home Theater Systems', 'home-theater', 'Sound systems and home theaters', '🎬', 
 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400', @audio_video_id, 3, TRUE),
('Televisions', 'televisions', 'Smart TVs and displays', '📺', 
 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', @audio_video_id, 4, TRUE);

-- Under Cameras & Photography
INSERT INTO categories (name, slug, description, icon, image_url, parent_id, display_order, is_active) VALUES
('DSLR Cameras', 'dslr-cameras', 'Digital SLR cameras', '📷', 
 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400', @cameras_id, 1, TRUE),
('Mirrorless Cameras', 'mirrorless-cameras', 'Compact mirrorless camera systems', '📸', 
 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400', @cameras_id, 2, TRUE),
('Camera Lenses', 'camera-lenses', 'Camera lenses and optics', '🔭', 
 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400', @cameras_id, 3, TRUE),
('Action Cameras', 'action-cameras', 'Sports and action cameras', '🎥', 
 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4?w=400', @cameras_id, 4, TRUE);

-- Under Home Appliances
INSERT INTO categories (name, slug, description, icon, image_url, parent_id, display_order, is_active) VALUES
('Kitchen Appliances', 'kitchen-appliances', 'Microwaves, refrigerators, and kitchen equipment', '🍳', 
 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400', @appliances_id, 1, TRUE),
('Cleaning Appliances', 'cleaning-appliances', 'Vacuum cleaners and cleaning devices', '🧹', 
 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400', @appliances_id, 2, TRUE),
('Air Conditioners', 'air-conditioners', 'Cooling and climate control', '❄️', 
 'https://images.unsplash.com/photo-1631545806609-1e6f2968e4d8?w=400', @appliances_id, 3, TRUE),
('Water Purifiers', 'water-purifiers', 'Water filtration systems', '💧', 
 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', @appliances_id, 4, TRUE);

-- Under Gaming & Consoles
INSERT INTO categories (name, slug, description, icon, image_url, parent_id, display_order, is_active) VALUES
('PlayStation Consoles', 'playstation-consoles', 'Sony PlayStation gaming systems', '🎮', 
 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400', @gaming_id, 1, TRUE),
('Xbox Consoles', 'xbox-consoles', 'Microsoft Xbox gaming systems', '🎮', 
 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400', @gaming_id, 2, TRUE),
('Nintendo Consoles', 'nintendo-consoles', 'Nintendo Switch and gaming devices', '🎮', 
 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400', @gaming_id, 3, TRUE),
('Gaming Accessories', 'gaming-accessories', 'Controllers, headsets, and gaming gear', '🕹️', 
 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400', @gaming_id, 4, TRUE);

-- ============================================
-- MACHINERY SUBCATEGORIES (Example)
-- ============================================

INSERT INTO categories (name, slug, description, icon, image_url, parent_id, display_order, is_active) VALUES
('Industrial Machinery', 'industrial-machinery', 'Heavy industrial equipment', '🏭', 
 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', @machinery_id, 1, TRUE),
('Agricultural Equipment', 'agricultural-equipment', 'Farm and agricultural machinery', '🚜', 
 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400', @machinery_id, 2, TRUE),
('Construction Equipment', 'construction-equipment', 'Heavy construction machinery', '🏗️', 
 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400', @machinery_id, 3, TRUE);

-- ============================================
-- TEXTILES SUBCATEGORIES (Example)
-- ============================================

INSERT INTO categories (name, slug, description, icon, image_url, parent_id, display_order, is_active) VALUES
('Cotton Fabrics', 'cotton-fabrics', 'Cotton and cotton blend fabrics', '🧵', 
 'https://images.unsplash.com/photo-1558769132-cb1aea27c2e2?w=400', @textiles_id, 1, TRUE),
('Synthetic Fabrics', 'synthetic-fabrics', 'Polyester and synthetic materials', '🧶', 
 'https://images.unsplash.com/photo-1586339320813-0ab70809c922?w=400', @textiles_id, 2, TRUE),
('Silk & Premium Fabrics', 'silk-premium-fabrics', 'Silk and luxury fabrics', '✨', 
 'https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?w=400', @textiles_id, 3, TRUE);
