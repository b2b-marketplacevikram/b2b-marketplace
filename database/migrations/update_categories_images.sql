-- Update existing categories with image URLs
-- This script adds image_url to existing categories if not present

-- Update top-level categories with images
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400' WHERE slug = 'electronics' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400' WHERE slug = 'machinery' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1558769132-cb1aea27c2e2?w=400' WHERE slug = 'textiles' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400' WHERE slug = 'chemicals' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400' WHERE slug = 'construction-materials' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400' WHERE slug = 'automotive-parts' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' WHERE slug = 'food-beverages' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400' WHERE slug = 'packaging' AND image_url IS NULL;

-- Verify the update
SELECT id, name, slug, image_url, parent_id FROM categories ORDER BY display_order;
