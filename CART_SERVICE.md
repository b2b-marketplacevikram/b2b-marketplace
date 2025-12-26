# Cart Service Implementation

## Overview
The Cart Service is a Spring Boot microservice that manages shopping cart functionality for the B2B marketplace. It provides RESTful APIs for adding, updating, removing, and retrieving cart items.

## Service Details
- **Port**: 8085
- **Base URL**: `http://localhost:8085/api/cart`
- **Database**: MySQL (b2b_marketplace.cart_items table)

## Architecture

### Components Created

#### 1. Entity Layer
- **CartItem.java** - JPA entity mapping to `cart_items` table
  - Fields: id, buyerId, productId, quantity, createdAt, updatedAt

#### 2. Repository Layer
- **CartItemRepository.java** - Spring Data JPA repository
  - Custom queries for finding cart items by buyer
  - Methods for cart management and item counting

#### 3. Service Layer
- **CartService.java** - Business logic for cart operations
  - Integrates with Product Service (port 8082) to fetch product details
  - Calculates cart totals and subtotals
  - Handles graceful degradation if Product Service unavailable

#### 4. Controller Layer
- **CartController.java** - REST API endpoints
  - CORS enabled for frontend integration
  - Comprehensive logging for debugging

#### 5. DTOs
- **AddToCartRequest** - Request body for adding items
- **UpdateCartRequest** - Request body for updating quantity
- **CartItemDTO** - Enhanced cart item with product details
- **CartSummaryDTO** - Complete cart with totals
- **ProductDTO** - Product information from Product Service

## API Endpoints

### 1. Add to Cart
```http
POST /api/cart
Content-Type: application/json

{
  "buyerId": 1,
  "productId": 5,
  "quantity": 50
}
```

### 2. Get Cart
```http
GET /api/cart/{buyerId}
```
Returns:
```json
{
  "buyerId": 1,
  "items": [...],
  "totalItems": 150,
  "totalAmount": 2500.00
}
```

### 3. Get Cart Item Count
```http
GET /api/cart/{buyerId}/count
```

### 4. Update Cart Item
```http
PUT /api/cart/items/{cartItemId}
Content-Type: application/json

{
  "quantity": 100
}
```

### 5. Remove from Cart
```http
DELETE /api/cart/items/{cartItemId}
```

### 6. Clear Cart
```http
DELETE /api/cart/{buyerId}
```

### 7. Health Check
```http
GET /api/cart/health
```

## Frontend Integration

### CartContext Updates
The `CartContext.jsx` has been updated to:
- Connect to Cart Service backend (port 8085)
- Load cart data from database on mount
- Sync cart operations with backend
- Provide fallback to localStorage if backend unavailable
- Transform backend DTOs to frontend cart format

### Key Features
1. **Persistent Storage**: Cart data stored in MySQL database
2. **Real-time Sync**: All cart operations immediately reflected in database
3. **Product Enrichment**: Cart items automatically enriched with current product details
4. **Graceful Degradation**: Falls back to localStorage if backend unavailable
5. **Loading States**: Provides loading indicators during API calls

## Database Schema
```sql
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (buyer_id, product_id),
    INDEX idx_buyer (buyer_id)
);
```

## Configuration
**application.properties**:
```properties
spring.application.name=cart-service
server.port=8085
spring.datasource.url=jdbc:mysql://localhost:3306/b2b_marketplace
spring.datasource.username=root
spring.datasource.password=1234
```

## Dependencies
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- MySQL Connector
- Lombok
- RestTemplate (for Product Service integration)

## Build & Run

### Build
```bash
cd backend/cart-service
mvn clean install -DskipTests
```

### Run
```bash
mvn spring-boot:run
```

Or use the provided script:
```bash
.\START_CART_SERVICE.ps1
```

### Run All Services
```bash
.\START_ALL_SERVICES.ps1
```

## Service Integration

### Product Service Integration
The Cart Service calls Product Service to enrich cart items with:
- Product name
- Current price
- Product image
- Supplier information
- Available stock

**Product Service URL**: `http://localhost:8082/api/products/{productId}`

## Error Handling
- Returns appropriate HTTP status codes (200, 201, 204, 404, 500)
- Logs errors with detailed context
- Provides fallback behavior in CartContext if backend unavailable
- Validates required fields in requests

## Testing

### Manual Testing
1. Start MySQL service
2. Start Product Service (port 8082)
3. Start Cart Service (port 8085)
4. Test endpoints using curl or Postman

### Example Test
```bash
# Add item to cart
curl -X POST http://localhost:8085/api/cart \
  -H "Content-Type: application/json" \
  -d '{"buyerId":1,"productId":1,"quantity":50}'

# Get cart
curl http://localhost:8085/api/cart/1

# Health check
curl http://localhost:8085/api/cart/health
```

## Files Created
```
backend/cart-service/
├── pom.xml
├── src/main/
│   ├── java/com/b2b/marketplace/cart/
│   │   ├── CartServiceApplication.java
│   │   ├── entity/
│   │   │   └── CartItem.java
│   │   ├── repository/
│   │   │   └── CartItemRepository.java
│   │   ├── service/
│   │   │   └── CartService.java
│   │   ├── controller/
│   │   │   └── CartController.java
│   │   ├── dto/
│   │   │   ├── AddToCartRequest.java
│   │   │   ├── UpdateCartRequest.java
│   │   │   ├── CartItemDTO.java
│   │   │   ├── CartSummaryDTO.java
│   │   │   └── ProductDTO.java
│   │   └── config/
│   │       └── WebConfig.java
│   └── resources/
│       └── application.properties
└── START_CART_SERVICE.ps1
```

## Status
✅ **Service Status**: Running on port 8085
✅ **Build Status**: Successfully compiled
✅ **Database**: Connected to MySQL
✅ **Frontend Integration**: CartContext updated
✅ **API Endpoints**: All 7 endpoints operational

## Next Steps
1. Test cart functionality in the frontend
2. Verify cart persistence across page refreshes
3. Test add to cart from Product Details page
4. Test cart operations (update quantity, remove items)
5. Test checkout flow with cart integration
