-- Add subcategories to categories table

-- Electronics subcategories
INSERT INTO categories (name, slug, parent_id, icon, description) VALUES
('Computers & Laptops', 'computers-laptops', 1, '💻', 'Desktop and laptop computers'),
('Mobile Phones', 'mobile-phones', 1, '📱', 'Smartphones and mobile devices'),
('Audio & Video', 'audio-video', 1, '🎧', 'Headphones, speakers, and media equipment'),
('Cameras & Photography', 'cameras-photography', 1, '📷', 'Cameras and photography equipment'),
('Home Appliances', 'home-appliances', 1, '🏠', 'Home electronic appliances');

-- Machinery subcategories
INSERT INTO categories (name, slug, parent_id, icon, description) VALUES
('Industrial Machines', 'industrial-machines', 2, '🏭', 'Heavy industrial machinery'),
('Construction Equipment', 'construction-equipment', 2, '🚜', 'Construction and earthmoving equipment'),
('Agricultural Machinery', 'agricultural-machinery', 2, '🌾', 'Farm and agricultural equipment'),
('Tools & Hardware', 'tools-hardware', 2, '🔧', 'Power tools and hardware');

-- Textiles subcategories
INSERT INTO categories (name, slug, parent_id, icon, description) VALUES
('Fabrics', 'fabrics', 3, '🧵', 'Various fabric materials'),
('Yarns', 'yarns', 3, '🪡', 'Textile yarns'),
('Garments', 'garments', 3, '👕', 'Ready-made garments'),
('Home Textiles', 'home-textiles', 3, '🛏️', 'Curtains, bedding, and home fabrics');

-- Chemicals subcategories
INSERT INTO categories (name, slug, parent_id, icon, description) VALUES
('Industrial Chemicals', 'industrial-chemicals', 4, '⚗️', 'Industrial chemical products'),
('Plastics & Polymers', 'plastics-polymers', 4, '🔬', 'Plastic materials and polymers'),
('Additives', 'additives', 4, '🧪', 'Chemical additives'),
('Cleaning Chemicals', 'cleaning-chemicals', 4, '🧼', 'Cleaning and maintenance chemicals');

-- Construction Materials subcategories
INSERT INTO categories (name, slug, parent_id, icon, description) VALUES
('Building Materials', 'building-materials', 5, '🧱', 'Bricks, cement, and building materials'),
('Plumbing & HVAC', 'plumbing-hvac', 5, '🚰', 'Plumbing and HVAC equipment'),
('Electrical Supplies', 'electrical-supplies', 5, '💡', 'Electrical wiring and supplies'),
('Safety Equipment', 'safety-equipment', 5, '🦺', 'Construction safety equipment');

-- Automotive Parts subcategories
INSERT INTO categories (name, slug, parent_id, icon, description) VALUES
('Engine Parts', 'engine-parts', 6, '🔩', 'Engine components and parts'),
('Tires & Wheels', 'tires-wheels', 6, '🛞', 'Tires and wheel accessories'),
('Body & Exterior', 'body-exterior', 6, '🚗', 'Body parts and exterior accessories'),
('Maintenance Products', 'maintenance-products', 6, '🛠️', 'Automotive maintenance products');

-- Food & Beverages subcategories
INSERT INTO categories (name, slug, parent_id, icon, description) VALUES
('Raw Ingredients', 'raw-ingredients', 7, '🌾', 'Raw food ingredients'),
('Processed Foods', 'processed-foods', 7, '🍽️', 'Processed food products'),
('Beverages', 'beverages', 7, '🥤', 'Drinks and beverages'),
('Food Packaging', 'food-packaging', 7, '📦', 'Food packaging materials');

-- Packaging subcategories
INSERT INTO categories (name, slug, parent_id, icon, description) VALUES
('Boxes & Containers', 'boxes-containers', 8, '📦', 'Shipping boxes and containers'),
('Bags & Films', 'bags-films', 8, '🛍️', 'Plastic bags and films'),
('Labels & Stickers', 'labels-stickers', 8, '🏷️', 'Labels and sticker products'),
('Protective Packaging', 'protective-packaging', 8, '📮', 'Bubble wrap and protective materials');
