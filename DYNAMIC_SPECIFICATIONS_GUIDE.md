# Dynamic Product Specifications - Implementation Guide

## Overview
This implementation adds Amazon-style dynamic product specifications to the B2B Marketplace platform. Suppliers can now add unlimited custom specification attributes organized by categories, which are then displayed in a structured format on product detail pages.

## Features Implemented

### 1. **Backend Components**

#### Database Schema
- **Table**: `product_specifications`
- **Columns**:
  - `id` - Primary key
  - `product_id` - Foreign key to products table
  - `category` - Specification category (e.g., "Technical Details", "Display", "Camera")
  - `attribute_name` - The specification name (e.g., "Operating System", "RAM")
  - `attribute_value` - The specification value (e.g., "Android 16", "12 GB")
  - `display_order` - Order for displaying specifications
  - `created_at`, `updated_at` - Timestamps

#### Entity Model
- **File**: `ProductSpecification.java`
- **Purpose**: JPA entity mapping for product specifications
- **Relationships**: Many-to-one relationship with Product entity

#### Repository
- **File**: `ProductSpecificationRepository.java`
- **Methods**:
  - `findByProductIdOrderByDisplayOrderAsc()` - Get all specs for a product
  - `deleteByProductId()` - Delete all specs when updating product
  - `findByProductIdAndCategory()` - Get specs by category

#### DTOs
- **SpecificationDTO**: Transfer object for specification data
- **Updated ProductRequest**: Now includes `specificationsList` field
- **Updated ProductResponse**: Now includes `specificationsList` field

#### Service Updates
- **ProductService** now handles:
  - Saving specifications when creating products
  - Updating specifications when editing products
  - Loading specifications when fetching product details
  - Mapping specifications to DTOs

### 2. **Frontend Components**

#### Supplier Product Form
- **File**: `AddEditProductScreen.js`
- **Features**:
  - ✅ Dynamic specification entry with add/remove buttons
  - ✅ Category selection chips for organizing specs
  - ✅ Pre-defined categories matching Amazon's structure
  - ✅ Attribute name and value input fields
  - ✅ Validation before submission
  - ✅ Support for both create and edit modes
  - ✅ Image URL management
  - ✅ All standard product fields

**Pre-defined Categories**:
1. Technical Details
2. Additional Information
3. Display
4. Camera
5. Connectivity
6. Physical Specifications
7. Warranty & Support

#### Product Detail Display
- **File**: `EnhancedProductDetailScreen.js`
- **Features**:
  - ✅ Grouped specifications by category
  - ✅ Amazon-style category headers with accent borders
  - ✅ Clean key-value pair display
  - ✅ Fallback to legacy specifications format
  - ✅ Tab-based interface (Description, Specifications, Shipping)
  - ✅ Responsive design

### 3. **Navigation**

Updated `App.js` to include:
- New route: `AddEditProduct` screen
- Dynamic title based on edit/create mode
- Integration with ProductManagement screen

## Usage Guide

### For Suppliers - Adding Products with Specifications

1. **Navigate to Product Management**
   - From Supplier Dashboard → "Manage Products"
   - Click "+ Add Product" button

2. **Fill Basic Information**
   - Product Name (required)
   - Description
   - Price and MOQ (required)
   - Stock Quantity, Lead Time
   - Brand and Model

3. **Add Specifications**
   - Click "+ Add Specification" to add a new spec
   - Select a category from the chips (Technical Details, Display, etc.)
   - Enter Attribute Name (e.g., "Processor Speed", "RAM", "Color")
   - Enter Attribute Value (e.g., "3.8 GHz", "12 GB", "Mint Breeze")
   - Add more specifications as needed
   - Remove unwanted specs using the ✕ button

4. **Add Product Images**
   - Enter image URLs (first image becomes primary)
   - Click "+ Add Image" for multiple images

5. **Submit**
   - Click "Create Product" (or "Update Product" for edits)

### For Buyers - Viewing Specifications

1. **Browse Products**
   - Navigate to any product detail page

2. **View Specifications**
   - Click on "Specifications" tab
   - Specifications are grouped by category
   - Each category has a clear header
   - Specifications shown as attribute-value pairs

## Database Migration

### Apply the Migration

```powershell
# Run from the b2b-marketplace directory
.\APPLY_SPECIFICATIONS_MIGRATION.ps1
```

Or manually:
```sql
-- Create the table
source CREATE_PRODUCT_SPECIFICATIONS_TABLE.sql

-- Verify creation
SHOW TABLES LIKE 'product_specifications';
DESC product_specifications;
```

### Rebuild Backend

```bash
cd backend/product-service
mvn clean install
mvn spring-boot:run
```

## API Examples

### Creating a Product with Specifications

```json
POST /api/products

{
  "name": "OnePlus 15R",
  "description": "Latest flagship smartphone",
  "unitPrice": 599.99,
  "moq": 10,
  "stockQuantity": 500,
  "brand": "OnePlus",
  "model": "15R",
  "specificationsList": [
    {
      "category": "Technical Details",
      "attributeName": "Operating System",
      "attributeValue": "Android 16, OxygenOS 16",
      "displayOrder": 0
    },
    {
      "category": "Technical Details",
      "attributeName": "RAM Memory Installed",
      "attributeValue": "12 GB",
      "displayOrder": 1
    },
    {
      "category": "Display",
      "attributeName": "Screen Size",
      "attributeValue": "6.78 inches",
      "displayOrder": 0
    },
    {
      "category": "Display",
      "attributeName": "Resolution",
      "attributeValue": "2780 x 1264 pixels",
      "displayOrder": 1
    },
    {
      "category": "Camera",
      "attributeName": "Rear Camera",
      "attributeValue": "50 MP",
      "displayOrder": 0
    },
    {
      "category": "Camera",
      "attributeName": "Front Camera",
      "attributeValue": "32 MP",
      "displayOrder": 1
    }
  ],
  "imageUrls": [
    "https://example.com/oneplus-15r-front.jpg",
    "https://example.com/oneplus-15r-back.jpg"
  ]
}
```

### Response Format

```json
{
  "id": 123,
  "name": "OnePlus 15R",
  "specificationsList": [
    {
      "id": 1,
      "category": "Technical Details",
      "attributeName": "Operating System",
      "attributeValue": "Android 16, OxygenOS 16",
      "displayOrder": 0
    },
    ...
  ]
}
```

## Key Benefits

1. **Flexibility**: Suppliers can add any number of specifications
2. **Organization**: Category-based grouping like Amazon
3. **Consistency**: Standardized display across all products
4. **Scalability**: New categories and attributes can be added easily
5. **User Experience**: Clear, organized presentation of product details
6. **Backward Compatible**: Supports legacy `specifications` JSON field

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           Mobile App (React Native)             │
├─────────────────────────────────────────────────┤
│                                                 │
│  AddEditProductScreen     EnhancedProductDetail │
│  ┌──────────────────┐    ┌──────────────────┐  │
│  │ • Category chips │    │ • Grouped specs  │  │
│  │ • Add/Remove     │    │ • Category headers│  │
│  │ • Validation     │    │ • Key-value pairs│  │
│  └──────────────────┘    └──────────────────┘  │
└───────────────┬─────────────────┬───────────────┘
                │                 │
                ▼                 ▼
┌─────────────────────────────────────────────────┐
│              Product Service API                 │
├─────────────────────────────────────────────────┤
│  ProductController                              │
│    ├─ POST /api/products                        │
│    ├─ PUT /api/products/{id}                    │
│    └─ GET /api/products/{id}                    │
│                                                 │
│  ProductService                                 │
│    ├─ createProduct()                           │
│    ├─ updateProduct()                           │
│    └─ mapToResponse()                           │
│                                                 │
│  ProductSpecificationRepository                 │
│    ├─ save()                                    │
│    ├─ findByProductId()                         │
│    └─ deleteByProductId()                       │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│              MySQL Database                      │
├─────────────────────────────────────────────────┤
│  products                                       │
│  ├─ id, name, description, price, etc.          │
│                                                 │
│  product_specifications                         │
│  ├─ id                                          │
│  ├─ product_id (FK → products.id)               │
│  ├─ category                                    │
│  ├─ attribute_name                              │
│  ├─ attribute_value                             │
│  └─ display_order                               │
└─────────────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Apply database migration successfully
- [ ] Rebuild and restart product service
- [ ] Create a new product with specifications
- [ ] Edit an existing product's specifications
- [ ] View specifications on product detail page
- [ ] Verify specifications are grouped by category
- [ ] Test with multiple categories
- [ ] Test adding/removing specifications in the form
- [ ] Verify validation works (required fields)
- [ ] Test with no specifications (should show "No specifications available")

## Troubleshooting

### Issue: Table not found
**Solution**: Run the migration script: `.\APPLY_SPECIFICATIONS_MIGRATION.ps1`

### Issue: Foreign key constraint error
**Solution**: Ensure the `products` table exists and has records before adding specifications

### Issue: Specifications not displaying
**Solution**: 
1. Check API response includes `specificationsList` field
2. Verify specifications were saved to database
3. Check browser/app console for errors

### Issue: Can't add specifications in form
**Solution**: 
1. Verify `AddEditProductScreen` is properly imported in App.js
2. Check navigation route is configured
3. Ensure API endpoint is accessible

## Future Enhancements

1. **Specification Templates**: Pre-defined templates for common product types
2. **Bulk Import**: CSV/Excel upload for specifications
3. **Search by Specs**: Filter products by specification values
4. **Comparison**: Side-by-side specification comparison
5. **Admin Panel**: Manage category list and validation rules
6. **Multi-language**: Support for specification translations
7. **Rich Media**: Images/videos in specification values

## Related Files

### Backend
- `backend/product-service/src/main/java/com/b2b/marketplace/product/entity/ProductSpecification.java`
- `backend/product-service/src/main/java/com/b2b/marketplace/product/repository/ProductSpecificationRepository.java`
- `backend/product-service/src/main/java/com/b2b/marketplace/product/dto/SpecificationDTO.java`
- `backend/product-service/src/main/java/com/b2b/marketplace/product/service/ProductService.java`

### Frontend
- `b2bmarketplacemobile/src/screens/AddEditProductScreen.js`
- `b2bmarketplacemobile/src/screens/EnhancedProductDetailScreen.js`
- `b2bmarketplacemobile/src/screens/ProductManagementScreen.js`
- `b2bmarketplacemobile/App.js`

### Database
- `CREATE_PRODUCT_SPECIFICATIONS_TABLE.sql`
- `APPLY_SPECIFICATIONS_MIGRATION.ps1`

---

**Last Updated**: January 26, 2026
**Version**: 1.0
**Status**: ✅ Implementation Complete
