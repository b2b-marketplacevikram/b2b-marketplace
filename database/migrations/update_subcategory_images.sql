-- Update subcategory images for Electronics hierarchy
-- This ensures all subcategories have proper image URLs

-- Update Level 2 categories under Computers & Laptops
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400' WHERE slug = 'desktop-computers' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' WHERE slug = 'laptops' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400' WHERE slug = 'computer-components' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400' WHERE slug = 'monitors-displays' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' WHERE slug = 'keyboards-mice' AND image_url IS NULL;

-- Update Level 2 categories under Mobile Devices
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' WHERE slug = 'smartphones' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400' WHERE slug = 'tablets' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400' WHERE slug = 'phone-accessories' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' WHERE slug = 'smartwatches' AND image_url IS NULL;

-- Update Level 2 categories under Audio & Video
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' WHERE slug = 'headphones-earbuds' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400' WHERE slug = 'speakers' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400' WHERE slug = 'home-theater' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400' WHERE slug = 'televisions' AND image_url IS NULL;

-- Update Level 2 categories under Cameras & Photography
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400' WHERE slug = 'dslr-cameras' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400' WHERE slug = 'mirrorless-cameras' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400' WHERE slug = 'camera-lenses' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4?w=400' WHERE slug = 'action-cameras' AND image_url IS NULL;

-- Update Level 2 categories under Home Appliances
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400' WHERE slug = 'kitchen-appliances' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400' WHERE slug = 'cleaning-appliances' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1631545806609-1e6f2968e4d8?w=400' WHERE slug = 'air-conditioners' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400' WHERE slug = 'water-purifiers' AND image_url IS NULL;

-- Update Level 2 categories under Gaming & Consoles
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400' WHERE slug = 'playstation-consoles' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400' WHERE slug = 'xbox-consoles' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400' WHERE slug = 'nintendo-consoles' AND image_url IS NULL;
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400' WHERE slug = 'gaming-accessories' AND image_url IS NULL;

-- Verify all categories have images
SELECT 
    id, 
    name, 
    slug, 
    CASE 
        WHEN image_url IS NOT NULL THEN '✓ Has Image'
        ELSE '✗ Missing Image'
    END as image_status,
    parent_id
FROM categories 
ORDER BY parent_id NULLS FIRST, display_order;
