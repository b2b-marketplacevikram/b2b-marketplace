# Quick Start Guide - Running Order Service

## What's Been Implemented

✅ **Order Service (Port 8083)** - Complete CRUD operations
- Create orders from checkout
- Get orders by buyer/supplier
- Update order status
- Track order by order number

✅ **Frontend Integration**
- Checkout page creates real orders via API
- Order tracking page fetches from backend
- Supplier order management connected to API

## Running the Order Service

### Step 1: Start Order Service

Open a new terminal:

```powershell
cd backend/order-service
mvn spring-boot:run
```

Expected output:
```
Started OrderServiceApplication in X.XXX seconds
Tomcat started on port(s): 8083 (http)
```

### Step 2: Verify All Services Are Running

You should now have:
- ✅ Frontend (Port 3000 or 5173)
- ✅ User Service (Port 8081)
- ✅ Order Service (Port 8083)

### Step 3: Test Order Journey

1. **Login as Buyer**
   - Go to http://localhost:3000/login
   - Email: buyer1@example.com
   - Password: password

2. **Add Products to Cart**
   - Browse products
   - Add items to cart
   - Go to cart page

3. **Checkout**
   - Click "Proceed to Checkout"
   - Fill in shipping information
   - Select payment method
   - Complete order

4. **Track Order**
   - You'll be redirected to order tracking page
   - Order number is generated (e.g., ORD-12AB34CD)
   - See real-time status

5. **Supplier Views Order** (Login as supplier)
   - Go to http://localhost:3000/login
   - Email: supplier1@techcorp.com
   - Password: password
   - Navigate to Order Management
   - See all incoming orders
   - Update order status

## API Endpoints Available

### Order Service (Port 8083)

**POST** `/api/orders` - Create new order
```json
{
  "buyerId": 1,
  "supplierId": 1,
  "paymentMethod": "Credit Card",
  "subtotal": 1000.00,
  "taxAmount": 100.00,
  "shippingCost": 50.00,
  "totalAmount": 1150.00,
  "shippingAddress": "123 Street, City",
  "items": [
    {
      "productId": 1,
      "productName": "Product Name",
      "quantity": 10,
      "unitPrice": 100.00,
      "totalPrice": 1000.00
    }
  ]
}
```

**GET** `/api/orders/buyer/{buyerId}` - Get buyer's orders
- Query param: `status` (optional) - Filter by status

**GET** `/api/orders/supplier/{supplierId}` - Get supplier's orders
- Query param: `status` (optional) - Filter by status

**GET** `/api/orders/number/{orderNumber}` - Get order by order number

**PUT** `/api/orders/{id}/status` - Update order status
```json
{
  "status": "SHIPPED",
  "trackingNumber": "TRK123456"
}
```

## Testing with cURL

### Create Order
```powershell
curl -X POST http://localhost:8083/api/orders `
  -H "Content-Type: application/json" `
  -d '{
    "buyerId": 1,
    "supplierId": 1,
    "paymentMethod": "Credit Card",
    "subtotal": 1000.00,
    "taxAmount": 100.00,
    "shippingCost": 50.00,
    "totalAmount": 1150.00,
    "shippingAddress": "123 Test St, Test City",
    "items": [
      {
        "productId": 1,
        "productName": "Test Product",
        "quantity": 10,
        "unitPrice": 100.00,
        "totalPrice": 1000.00
      }
    ]
  }'
```

### Get Supplier Orders
```powershell
curl http://localhost:8083/api/orders/supplier/1
```

### Update Order Status
```powershell
curl -X PUT http://localhost:8083/api/orders/1/status `
  -H "Content-Type: application/json" `
  -d '{"status": "SHIPPED", "trackingNumber": "TRK12345"}'
```

## Order Status Flow

1. **PENDING** - Order created, awaiting confirmation
2. **CONFIRMED** - Payment confirmed, ready to process
3. **PROCESSING** - Order being prepared
4. **SHIPPED** - Order shipped with tracking number
5. **DELIVERED** - Order delivered to buyer
6. **CANCELLED** - Order cancelled
7. **REFUNDED** - Payment refunded

## Database Schema

Orders are stored in two tables:

### `orders` table
- id, order_number, buyer_id, supplier_id
- status, payment_status, payment_method
- amounts (subtotal, tax, shipping, total)
- addresses, tracking info
- timestamps (created, confirmed, shipped, delivered)

### `order_items` table
- id, order_id, product_id
- product_name, quantity
- unit_price, total_price

## Troubleshooting

### Order Service won't start
- Check MySQL is running
- Verify database credentials in `application.properties`
- Ensure port 8083 is not in use

### Orders not appearing
- Check browser console for errors
- Verify User Service (8081) and Order Service (8083) are running
- Check user is logged in (localStorage has token)

### CORS errors
- Ensure `cors.allowed-origins` includes your frontend URL
- Clear browser cache
- Check all services have CORS configured

## Next Steps

Now that orders are working, you can:

1. **Add Product Service** - Real product catalog from database
2. **Add Payment Integration** - Stripe/PayPal
3. **Add Email Notifications** - Order confirmations
4. **Add File Uploads** - Product images, invoices
5. **Add Real-time Updates** - WebSocket for order status

## Summary

✅ Complete order flow implemented
✅ Backend API ready and tested
✅ Frontend integrated with API
✅ Buyer can create orders
✅ Supplier can manage orders
✅ Order tracking functional

Your B2B marketplace now has a fully functional order management system!
