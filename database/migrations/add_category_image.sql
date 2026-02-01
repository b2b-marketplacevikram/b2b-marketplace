-- Add image_url field to categories table
ALTER TABLE categories ADD COLUMN image_url VARCHAR(500) NULL AFTER icon;

-- Update existing categories with placeholder images
UPDATE categories SET image_url = 'https://via.placeholder.com/300x200?text=Electronics' WHERE name = 'Electronics';
UPDATE categories SET image_url = 'https://via.placeholder.com/300x200?text=Machinery' WHERE name = 'Machinery';
UPDATE categories SET image_url = 'https://via.placeholder.com/300x200?text=Textiles' WHERE name = 'Textiles';
UPDATE categories SET image_url = 'https://via.placeholder.com/300x200?text=Chemicals' WHERE name = 'Chemicals';
UPDATE categories SET image_url = 'https://via.placeholder.com/300x200?text=Construction' WHERE name = 'Construction Materials';
UPDATE categories SET image_url = 'https://via.placeholder.com/300x200?text=Automotive' WHERE name = 'Automotive Parts';
UPDATE categories SET image_url = 'https://via.placeholder.com/300x200?text=Food' WHERE name = 'Food & Beverages';
UPDATE categories SET image_url = 'https://via.placeholder.com/300x200?text=Packaging' WHERE name = 'Packaging';
