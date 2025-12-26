# Promotion System - Order Level & Product Level

## Overview
The B2B Marketplace now supports two distinct types of promotions:
1. **Order-Level Promotions** - Applied to the entire order based on order total
2. **Product-Level Promotions** - Applied to specific products or categories

## Promotion Levels

### 1. ORDER_LEVEL Promotions
Applied to the entire order when certain conditions are met (e.g., minimum order amount).

**Use Cases:**
- "Get 10% off on orders above $500"
- "Save $50 on orders above $1000"
- "Flash Sale: 15% off on all orders"

**Key Features:**
- `minOrderAmount` - Minimum order value required to activate promotion
- `maxDiscountAmount` - Cap on discount amount for percentage-based promotions
- Automatically calculated at checkout based on cart total

**Example:**
```json
{
  "name": "Order Discount 10%",
  "description": "Get 10% off on orders above $500",
  "type": "PERCENTAGE_OFF",
  "promotionLevel": "ORDER_LEVEL",
  "discountPercentage": 10.00,
  "minOrderAmount": 500.00,
  "maxDiscountAmount": 100.00,
  "validFrom": "2024-01-01T00:00:00",
  "validUntil": "2025-12-31T23:59:59",
  "isActive": true,
  "priority": 10,
  "applicableTo": "ALL"
}
```

### 2. PRODUCT_LEVEL Promotions
Applied to specific products, categories, or all products individually.

**Use Cases:**
- "Buy 2 Get 1 Free on selected items"
- "25% off on electronics category"
- "Flash Sale: 30% off on featured products"

**Key Features:**
- Applied per product in cart
- Can target specific products via `productIds`
- Can target categories via `categoryIds`
- Supports quantity-based promotions (Buy X Get Y)

**Example:**
```json
{
  "name": "Buy 2 Get 1 Free",
  "description": "Purchase 2 items and get 1 free",
  "type": "BUY_X_GET_Y",
  "promotionLevel": "PRODUCT_LEVEL",
  "buyQuantity": 2,
  "getQuantity": 1,
  "validFrom": "2024-01-01T00:00:00",
  "validUntil": "2025-12-31T23:59:59",
  "isActive": true,
  "priority": 10,
  "applicableTo": "SPECIFIC_PRODUCTS",
  "productIds": "1,2,3"
}
```

## Promotion Types

### 1. PERCENTAGE_OFF
Discount as a percentage of price/order total.
- **Order Level:** Applied to total order amount
- **Product Level:** Applied to individual product price
- Supports `maxDiscountAmount` cap

### 2. FIXED_AMOUNT_OFF
Fixed dollar amount discount.
- **Order Level:** Flat discount on entire order
- **Product Level:** Fixed discount per product

### 3. BUY_X_GET_Y
Buy X quantity, get Y quantity free (Product Level only).
- Requires `buyQuantity` and `getQuantity`
- Calculates free items based on quantity purchased

### 4. FLASH_SALE
Time-sensitive promotional discount.
- Typically percentage-based
- High priority to display prominently
- Can be order-level or product-level

## API Endpoints

### Get Promotions by Level

**Get Order-Level Promotions:**
```http
GET /api/promotions/order-level
```

**Get Product-Level Promotions:**
```http
GET /api/promotions/product-level
```

### Calculate Discounts

**Calculate Order-Level Discount:**
```http
POST /api/promotions/order-level/calculate
?promotionId=1&orderAmount=750.00

Response: 75.00
```

**Find Best Order-Level Promotion:**
```http
GET /api/promotions/order-level/best
?orderAmount=750.00

Response: {
  "id": 1,
  "name": "Order Discount 10%",
  "discountPercentage": 10.00,
  ...
}
```

**Calculate Product-Level Discount:**
```http
POST /api/promotions/product-level/calculate
?promotionId=5&productPrice=100.00&quantity=3

Response: 33.33
```

### Get Promotions for Product

```http
GET /api/promotions/product/123

Response: [
  {
    "id": 5,
    "name": "Buy 2 Get 1 Free",
    "promotionLevel": "PRODUCT_LEVEL",
    ...
  }
]
```

## Priority System

When multiple promotions can apply, the system uses priority to determine order:
- Higher priority value = Higher precedence
- Flash sales typically have highest priority (15)
- Standard promotions range from 5-12

**Best Promotion Logic:**
For order-level promotions, the system automatically calculates which promotion gives the maximum discount and applies it.

## Integration Examples

### Frontend Cart Integration

```javascript
// Get order-level promotions
const orderPromotions = await fetch('/api/promotions/order-level').then(r => r.json());

// Calculate discount for current cart total
const cartTotal = 750.00;
const bestPromotion = await fetch(`/api/promotions/order-level/best?orderAmount=${cartTotal}`)
  .then(r => r.json());

// Display applicable promotion
if (bestPromotion) {
  const discount = await fetch(
    `/api/promotions/order-level/calculate?promotionId=${bestPromotion.id}&orderAmount=${cartTotal}`
  ).then(r => r.json());
  
  console.log(`Apply ${bestPromotion.name}: Save $${discount}`);
}
```

### Product Page Integration

```javascript
// Get promotions for specific product
const productId = 123;
const promotions = await fetch(`/api/promotions/product/${productId}`)
  .then(r => r.json());

// Display promotions on product page
promotions.forEach(promo => {
  if (promo.type === 'BUY_X_GET_Y') {
    console.log(`${promo.name}: Buy ${promo.buyQuantity} Get ${promo.getQuantity} Free!`);
  } else if (promo.type === 'PERCENTAGE_OFF') {
    console.log(`${promo.name}: ${promo.discountPercentage}% OFF`);
  }
});
```

## Sample Data

The system includes 9 sample promotions:

**Order-Level (4):**
1. Order Discount 10% - 10% off orders above $500 (max $100)
2. Flat $50 Off - $50 off orders above $1000
3. Flash Sale 15% - 15% off orders above $300 (max $150)
4. Premium Order Discount - 20% off orders above $2000 (max $300)

**Product-Level (5):**
1. Buy 2 Get 1 Free - Specific products (1,2,3)
2. Electronics Sale - 25% off electronics category
3. Product Flash Sale - 30% off selected products (4,5,6,7)
4. Flat $20 Off Products - $20 off products (8,9,10)
5. Buy 3 Get 2 Free - All products

## Coupons vs Promotions

**Promotions:**
- Automatically applied
- No code required
- Based on order amount or product selection

**Coupons:**
- Require coupon code entry
- User must manually apply
- Have usage limits (total and per-user)
- Tracked via `coupon_usage` table

Both systems work together to provide flexible discount options!

## Database Schema

**promotions table:**
- `promotion_level` - ORDER_LEVEL or PRODUCT_LEVEL
- `min_order_amount` - Minimum order value for order-level promotions
- `max_discount_amount` - Cap on percentage discounts
- `type` - PERCENTAGE_OFF, FIXED_AMOUNT_OFF, BUY_X_GET_Y, FLASH_SALE
- `priority` - Determines precedence when multiple promotions apply

## Testing

**Test Order-Level Promotion:**
```bash
# Test with $750 order
curl "http://localhost:8082/api/promotions/order-level/best?orderAmount=750.00"

# Expected: "Order Discount 10%" with $75 discount
```

**Test Product-Level Promotion:**
```bash
# Test Buy 2 Get 1 for product with $100 price, quantity 3
curl -X POST "http://localhost:8082/api/promotions/product-level/calculate?promotionId=5&productPrice=100.00&quantity=3"

# Expected: $100 discount (1 free item)
```

## Best Practices

1. **Order-Level Promotions:**
   - Set reasonable `minOrderAmount` thresholds
   - Always set `maxDiscountAmount` for percentage promotions
   - Higher priority for better deals

2. **Product-Level Promotions:**
   - Use specific product/category targeting
   - Clear naming for customer understanding
   - Combine with banners/badges on product pages

3. **Stacking:**
   - Currently, only one promotion applies per level
   - Order-level and product-level can work together
   - Coupons can stack with promotions (implement custom logic)

4. **Performance:**
   - Use priority to limit calculations
   - Cache active promotions
   - Index on `is_active` and date fields
