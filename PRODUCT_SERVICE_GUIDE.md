# Product Service - Complete Guide

## Overview
The Product Service is a Spring Boot microservice responsible for managing the product catalog, categories, and product images in the B2B marketplace platform.

## Architecture
- **Framework**: Spring Boot 3.2.0
- **Database**: MySQL 8.0+
- **Port**: 8082
- **Base URL**: `http://localhost:8082`

## Features
- ✅ Complete CRUD operations for products
- ✅ Category management with hierarchical structure
- ✅ Product image handling
- ✅ Advanced product search
- ✅ Price range filtering
- ✅ Category-based filtering
- ✅ Featured products
- ✅ Top-rated products
- ✅ Supplier-specific product listing

## Project Structure
```
product-service/
├── src/main/java/com/b2b/marketplace/product/
│   ├── ProductServiceApplication.java
│   ├── config/
│   │   └── CorsConfig.java
│   ├── controller/
│   │   ├── ProductController.java
│   │   └── CategoryController.java
│   ├── dto/
│   │   ├── ApiResponse.java
│   │   ├── ProductRequest.java
│   │   ├── ProductResponse.java
│   │   ├── ProductImageResponse.java
│   │   ├── CategoryRequest.java
│   │   └── CategoryResponse.java
│   ├── entity/
│   │   ├── Product.java
│   │   ├── Category.java
│   │   └── ProductImage.java
│   ├── repository/
│   │   ├── ProductRepository.java
│   │   ├── CategoryRepository.java
│   │   └── ProductImageRepository.java
│   └── service/
│       ├── ProductService.java
│       └── CategoryService.java
└── src/main/resources/
    └── application.properties
```

## Database Schema

### Products Table
```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    supplier_id BIGINT NOT NULL,
    category_id BIGINT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    unit_price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50),
    moq INT,
    stock_quantity INT,
    lead_time_days INT,
    origin VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(50),
    specifications TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(3,2),
    review_count INT DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);
```

### Categories Table
```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    icon_url VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);
```

### Product Images Table
```sql
CREATE TABLE product_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at DATETIME NOT NULL
);
```

## API Endpoints

### Product Endpoints

#### 1. Get All Products
```http
GET /api/products
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "supplierId": 1,
      "categoryId": 1,
      "categoryName": "Electronics",
      "name": "Industrial Laptop",
      "description": "High-performance laptop for industrial use",
      "unitPrice": 1299.99,
      "unit": "piece",
      "moq": 10,
      "stockQuantity": 500,
      "leadTimeDays": 15,
      "origin": "China",
      "brand": "TechCorp",
      "model": "TL-5000",
      "specifications": "16GB RAM, 512GB SSD",
      "isActive": true,
      "isFeatured": true,
      "averageRating": 4.5,
      "reviewCount": 23,
      "images": [
        {
          "id": 1,
          "imageUrl": "https://example.com/image1.jpg",
          "isPrimary": true,
          "sortOrder": 0
        }
      ],
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-20T14:45:00"
    }
  ]
}
```

#### 2. Get Product by ID
```http
GET /api/products/{id}
```

**Example:**
```bash
curl http://localhost:8082/api/products/1
```

#### 3. Get Products by Supplier
```http
GET /api/products/supplier/{supplierId}
```

**Example:**
```bash
curl http://localhost:8082/api/products/supplier/1
```

#### 4. Get Products by Category
```http
GET /api/products/category/{categoryId}
```

**Example:**
```bash
curl http://localhost:8082/api/products/category/1
```

#### 5. Get Featured Products
```http
GET /api/products/featured
```

**Example:**
```bash
curl http://localhost:8082/api/products/featured
```

#### 6. Get Top Rated Products
```http
GET /api/products/top-rated
```

**Example:**
```bash
curl http://localhost:8082/api/products/top-rated
```

#### 7. Search Products
```http
GET /api/products/search?keyword={keyword}&categoryId={categoryId}
```

**Parameters:**
- `keyword` (required): Search term
- `categoryId` (optional): Filter by category

**Example:**
```bash
curl "http://localhost:8082/api/products/search?keyword=laptop"
curl "http://localhost:8082/api/products/search?keyword=laptop&categoryId=1"
```

#### 8. Get Products by Price Range
```http
GET /api/products/price-range?minPrice={min}&maxPrice={max}
```

**Example:**
```bash
curl "http://localhost:8082/api/products/price-range?minPrice=100&maxPrice=1000"
```

#### 9. Create Product
```http
POST /api/products
Content-Type: application/json
```

**Request Body:**
```json
{
  "supplierId": 1,
  "categoryId": 1,
  "name": "Industrial Laptop",
  "description": "High-performance laptop for industrial use",
  "unitPrice": 1299.99,
  "unit": "piece",
  "moq": 10,
  "stockQuantity": 500,
  "leadTimeDays": 15,
  "origin": "China",
  "brand": "TechCorp",
  "model": "TL-5000",
  "specifications": "16GB RAM, 512GB SSD",
  "isActive": true,
  "isFeatured": false,
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:8082/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "categoryId": 1,
    "name": "Industrial Laptop",
    "description": "High-performance laptop",
    "unitPrice": 1299.99,
    "unit": "piece",
    "moq": 10,
    "stockQuantity": 500,
    "leadTimeDays": 15,
    "origin": "China",
    "brand": "TechCorp",
    "model": "TL-5000",
    "specifications": "16GB RAM, 512GB SSD",
    "isActive": true,
    "isFeatured": false,
    "imageUrls": ["https://example.com/image1.jpg"]
  }'
```

#### 10. Update Product
```http
PUT /api/products/{id}
Content-Type: application/json
```

**Request Body:** Same as Create Product

**Example:**
```bash
curl -X PUT http://localhost:8082/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "categoryId": 1,
    "name": "Updated Laptop Name",
    "unitPrice": 1399.99,
    "isActive": true
  }'
```

#### 11. Delete Product (Soft Delete)
```http
DELETE /api/products/{id}
```

**Example:**
```bash
curl -X DELETE http://localhost:8082/api/products/1
```

### Category Endpoints

#### 1. Get All Categories
```http
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic products",
      "parentId": null,
      "isActive": true,
      "sortOrder": 0,
      "iconUrl": "https://example.com/icons/electronics.png",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  ]
}
```

#### 2. Get Category by ID
```http
GET /api/categories/{id}
```

#### 3. Get Category by Slug
```http
GET /api/categories/slug/{slug}
```

**Example:**
```bash
curl http://localhost:8082/api/categories/slug/electronics
```

#### 4. Get Top Level Categories
```http
GET /api/categories/top-level
```

#### 5. Get Subcategories
```http
GET /api/categories/{parentId}/subcategories
```

**Example:**
```bash
curl http://localhost:8082/api/categories/1/subcategories
```

#### 6. Create Category
```http
POST /api/categories
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Electronics",
  "slug": "electronics",
  "description": "Electronic products and components",
  "parentId": null,
  "isActive": true,
  "sortOrder": 0,
  "iconUrl": "https://example.com/icons/electronics.png"
}
```

#### 7. Update Category
```http
PUT /api/categories/{id}
Content-Type: application/json
```

#### 8. Delete Category (Soft Delete)
```http
DELETE /api/categories/{id}
```

## Configuration

### application.properties
```properties
spring.application.name=product-service
server.port=8082

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/b2b_marketplace?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# CORS Configuration
cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

## Running the Service

### 1. Build the Service
```bash
cd backend/product-service
mvn clean install
```

### 2. Run the Service
```bash
mvn spring-boot:run
```

The service will start on `http://localhost:8082`

### 3. Verify Service is Running
```bash
curl http://localhost:8082/api/products
curl http://localhost:8082/api/categories
```

## Testing

### Test Product Creation
```bash
curl -X POST http://localhost:8082/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": 1,
    "categoryId": 1,
    "name": "Test Product",
    "description": "Test description",
    "unitPrice": 99.99,
    "unit": "piece",
    "moq": 5,
    "stockQuantity": 100,
    "leadTimeDays": 7,
    "origin": "USA",
    "brand": "TestBrand",
    "isActive": true,
    "isFeatured": false,
    "imageUrls": ["https://via.placeholder.com/300"]
  }'
```

### Test Product Search
```bash
# Search by keyword
curl "http://localhost:8082/api/products/search?keyword=laptop"

# Search by category and keyword
curl "http://localhost:8082/api/products/search?keyword=laptop&categoryId=1"

# Search by price range
curl "http://localhost:8082/api/products/price-range?minPrice=0&maxPrice=1000"
```

### Test Category Operations
```bash
# Get all categories
curl http://localhost:8082/api/categories

# Get top level categories
curl http://localhost:8082/api/categories/top-level

# Get subcategories
curl http://localhost:8082/api/categories/1/subcategories
```

## Integration with Frontend

The frontend already has the API configuration in `src/services/api.js`. Update it to use the Product Service:

```javascript
// Product APIs
export const productAPI = {
  getAll: () => productAPIInstance.get('/products'),
  getById: (id) => productAPIInstance.get(`/products/${id}`),
  getBySupplier: (supplierId) => productAPIInstance.get(`/products/supplier/${supplierId}`),
  getByCategory: (categoryId) => productAPIInstance.get(`/products/category/${categoryId}`),
  getFeatured: () => productAPIInstance.get('/products/featured'),
  getTopRated: () => productAPIInstance.get('/products/top-rated'),
  search: (keyword, categoryId) => {
    const params = { keyword };
    if (categoryId) params.categoryId = categoryId;
    return productAPIInstance.get('/products/search', { params });
  },
  getPriceRange: (minPrice, maxPrice) => 
    productAPIInstance.get('/products/price-range', { params: { minPrice, maxPrice } }),
  create: (productData) => productAPIInstance.post('/products', productData),
  update: (id, productData) => productAPIInstance.put(`/products/${id}`, productData),
  delete: (id) => productAPIInstance.delete(`/products/${id}`),
};

// Category APIs
export const categoryAPI = {
  getAll: () => productAPIInstance.get('/categories'),
  getById: (id) => productAPIInstance.get(`/categories/${id}`),
  getBySlug: (slug) => productAPIInstance.get(`/categories/slug/${slug}`),
  getTopLevel: () => productAPIInstance.get('/categories/top-level'),
  getSubcategories: (parentId) => productAPIInstance.get(`/categories/${parentId}/subcategories`),
  create: (categoryData) => productAPIInstance.post('/categories', categoryData),
  update: (id, categoryData) => productAPIInstance.put(`/categories/${id}`, categoryData),
  delete: (id) => productAPIInstance.delete(`/categories/${id}`),
};
```

## Common Issues & Solutions

### Issue 1: Port Already in Use
**Error:** `Port 8082 is already in use`

**Solution:**
```bash
# Windows
netstat -ano | findstr :8082
taskkill /PID <PID> /F

# Change port in application.properties
server.port=8083
```

### Issue 2: Database Connection Failed
**Error:** `Unable to connect to database`

**Solution:**
- Verify MySQL is running
- Check database credentials in application.properties
- Ensure database `b2b_marketplace` exists
- Run schema.sql to create tables

### Issue 3: CORS Error
**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Verify cors.allowed-origins in application.properties
- Ensure frontend URL is included
- Check CorsConfig.java is loaded

## Performance Optimization

### 1. Add Database Indexes
```sql
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(unit_price);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_product_images_product ON product_images(product_id);
```

### 2. Enable Query Caching
Add to application.properties:
```properties
spring.jpa.properties.hibernate.cache.use_second_level_cache=true
spring.jpa.properties.hibernate.cache.region.factory_class=org.hibernate.cache.jcache.JCacheRegionFactory
```

### 3. Pagination Support
Add pagination to list endpoints:
```java
@GetMapping
public ResponseEntity<Page<ProductResponse>> getAllProducts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size) {
    Pageable pageable = PageRequest.of(page, size);
    Page<ProductResponse> products = productService.getAllProducts(pageable);
    return ResponseEntity.ok(products);
}
```

## Next Steps
1. ✅ Product Service fully implemented
2. ⏳ Update frontend to use real product APIs
3. ⏳ Add image upload functionality
4. ⏳ Implement product reviews and ratings
5. ⏳ Add Elasticsearch for advanced search
6. ⏳ Implement caching with Redis

## Additional Resources
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

**Service Status**: ✅ Fully Implemented and Ready for Use
