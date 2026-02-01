# Category Setup - Quick Reference

## Files Created

### 1. Database Schema Updates
- **File**: `database/schema.sql`
  - Updated categories table with `image_url VARCHAR(500)` field
  - Already has `parent_id BIGINT NULL` for hierarchy

### 2. Sample Data Files
- **File**: `database/sample_data.sql`
  - Updated 8 top-level categories with image URLs
  - Categories: Electronics, Machinery, Textiles, Chemicals, Construction Materials, Automotive Parts, Food & Beverages, Packaging

### 3. Migration Scripts
- **File**: `database/migrations/update_categories_images.sql`
  - Updates existing categories with image URLs
  - Safe to run multiple times (checks for NULL before updating)

- **File**: `database/migrations/hierarchical_electronics_categories.sql`
  - Adds 2-level hierarchical structure for Electronics category
  - 6 Level-1 subcategories
  - 4-5 Level-2 subcategories under each
  - All with proper image URLs

### 4. PowerShell Scripts
- **File**: `SETUP_CATEGORIES.ps1` ⭐ **RECOMMENDED**
  - Interactive setup script
  - Adds image_url column
  - Updates existing categories with images
  - Optionally adds hierarchical Electronics categories
  - Shows current database state

- **File**: `APPLY_CATEGORY_MIGRATIONS.ps1`
  - Applies both migrations automatically
  - Non-interactive version

## Quick Start

### Option 1: Interactive Setup (Recommended)
```powershell
.\SETUP_CATEGORIES.ps1
```
This will:
1. Check Docker and database
2. Add image_url column
3. Update existing categories
4. Ask if you want hierarchical categories
5. Show current database state

### Option 2: Direct SQL Execution
```powershell
# Add column and update images
Get-Content .\database\migrations\update_categories_images.sql | docker exec -i b2b-marketplace-postgres psql -U postgres -d b2bmarketplace

# Add hierarchical categories (optional)
Get-Content .\database\migrations\hierarchical_electronics_categories.sql | docker exec -i b2b-marketplace-postgres psql -U postgres -d b2bmarketplace
```

### Option 3: Fresh Database Setup
```powershell
# Drop and recreate database with updated schema
docker exec -i b2b-marketplace-postgres psql -U postgres < .\database\schema.sql
docker exec -i b2b-marketplace-postgres psql -U postgres -d b2bmarketplace < .\database\sample_data.sql
```

## Sample Data Overview

### Top-Level Categories (8)
All include image URLs from Unsplash:

1. **Electronics** - Photo of electronic components
2. **Machinery** - Industrial machinery photo
3. **Textiles** - Fabric/textile photo
4. **Chemicals** - Laboratory/chemicals photo
5. **Construction Materials** - Building materials photo
6. **Automotive Parts** - Auto parts photo
7. **Food & Beverages** - Food products photo
8. **Packaging** - Packaging materials photo

### Hierarchical Electronics Structure (Optional)

When you run the hierarchical migration:

```
Electronics (ID: 1)
├── Computers & Laptops
│   ├── Desktop Computers
│   ├── Laptops
│   ├── Computer Components
│   ├── Monitors & Displays
│   └── Keyboards & Mice
├── Mobile Devices
│   ├── Smartphones
│   ├── Tablets
│   ├── Phone Accessories
│   └── Smartwatches
├── Audio & Video
│   ├── Headphones & Earbuds
│   ├── Speakers
│   ├── Home Theater Systems
│   └── Televisions
├── Cameras & Photography
│   ├── DSLR Cameras
│   ├── Mirrorless Cameras
│   ├── Camera Lenses
│   └── Action Cameras
├── Home Appliances
│   ├── Kitchen Appliances
│   ├── Cleaning Appliances
│   ├── Air Conditioners
│   └── Water Purifiers
└── Gaming & Consoles
    ├── PlayStation Consoles
    ├── Xbox Consoles
    ├── Nintendo Consoles
    └── Gaming Accessories
```

## Verification Commands

### Check if image_url column exists
```powershell
docker exec b2b-marketplace-postgres psql -U postgres -d b2bmarketplace -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='categories';"
```

### View all categories with images
```powershell
docker exec b2b-marketplace-postgres psql -U postgres -d b2bmarketplace -c "SELECT id, name, parent_id, image_url FROM categories ORDER BY parent_id NULLS FIRST, display_order;"
```

### Count categories by level
```powershell
docker exec b2b-marketplace-postgres psql -U postgres -d b2bmarketplace -c "SELECT CASE WHEN parent_id IS NULL THEN 'Top Level' ELSE 'Subcategory' END as level, COUNT(*) FROM categories GROUP BY level;"
```

### Check hierarchical structure
```powershell
docker exec b2b-marketplace-postgres psql -U postgres -d b2bmarketplace -c "SELECT c1.name as parent, c2.name as child FROM categories c1 LEFT JOIN categories c2 ON c2.parent_id = c1.id WHERE c1.name = 'Electronics' ORDER BY c2.display_order;"
```

## Troubleshooting

### Column already exists error
If you see "column already exists", it's safe to ignore. The script checks before adding.

### Foreign key constraint error
This means you're trying to insert a child category before its parent. Run the hierarchical script which handles dependencies correctly.

### Images not showing in UI
1. Check if image_url is populated: `SELECT name, image_url FROM categories;`
2. Verify frontend is using the updated CategoryBrowser component
3. Check browser console for CORS errors
4. Ensure backend is returning imageUrl in CategoryResponse

## Image URLs Used

All images are from Unsplash (free to use):
- High quality, professional photos
- 400px width (optimized for cards)
- Covers various product categories
- Can be replaced with your own images by updating the URLs

To use your own images:
```sql
UPDATE categories SET image_url = 'https://your-cdn.com/electronics.jpg' WHERE slug = 'electronics';
```

## Next Steps After Setup

1. **Restart Product Service**
   ```powershell
   cd backend/product-service
   mvn spring-boot:run
   ```

2. **Restart Frontend**
   ```powershell
   npm run dev
   ```

3. **Test the UI**
   - Visit http://localhost:3000
   - Click on category cards
   - Navigate through hierarchical categories
   - Verify images display correctly

4. **Add Products to Categories**
   Ensure your products have correct `category_id` pointing to leaf categories.
