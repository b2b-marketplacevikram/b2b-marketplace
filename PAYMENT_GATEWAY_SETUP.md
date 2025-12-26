# Payment Gateway Integration Guide

## Overview
The B2B Marketplace now supports multiple payment gateways:
- **Razorpay** - Popular in India (UPI, Cards, Wallets, Net Banking)
- **Stripe** - International payment gateway (Cards, global currencies)
- **Demo Mode** - For testing without real payments

## Setup Instructions

### 1. Razorpay Setup (For India)

#### Step 1: Create Razorpay Account
1. Go to https://dashboard.razorpay.com/signup
2. Sign up for a free account
3. Complete KYC verification

#### Step 2: Get API Keys
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate Test/Live API keys
4. Copy the **Key ID** (starts with `rzp_test_` or `rzp_live_`)

#### Step 3: Configure in Code
Edit `src/services/paymentGateway.js`:
```javascript
const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_HERE'; // Replace with your key
```

#### Step 4: Test Payment
- Use test card: 4111 1111 1111 1111
- Any future expiry date
- Any CVV

---

### 2. Stripe Setup (For International)

#### Step 1: Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Sign up for a free account
3. Complete business details

#### Step 2: Get API Keys
1. Login to Stripe Dashboard
2. Go to Developers → API Keys
3. Copy **Publishable key** (starts with `pk_test_`)
4. Copy **Secret key** (starts with `sk_test_`)

#### Step 3: Configure Frontend
Edit `src/services/paymentGateway.js`:
```javascript
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_KEY_HERE'; // Replace with your publishable key
```

#### Step 4: Configure Backend
You need to create a Stripe checkout session endpoint in Payment Service:

**File:** `backend/payment-service/src/main/java/com/b2b/marketplace/payment/controller/PaymentController.java`

Add dependency to `pom.xml`:
```xml
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>24.0.0</version>
</dependency>
```

Add endpoint:
```java
@PostMapping("/create-stripe-session")
public ResponseEntity<?> createStripeSession(@RequestBody PaymentRequest request) {
    Stripe.apiKey = "sk_test_YOUR_SECRET_KEY"; // From environment variable
    
    try {
        SessionCreateParams params = SessionCreateParams.builder()
            .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
            .setMode(SessionCreateParams.Mode.PAYMENT)
            .setSuccessUrl("http://localhost:3000/orders/" + request.getOrderNumber() + "?payment=success")
            .setCancelUrl("http://localhost:3000/checkout?payment=cancelled")
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("usd")
                            .setUnitAmount((long)(request.getAmount() * 100))
                            .setProductData(
                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName("Order " + request.getOrderNumber())
                                    .build()
                            )
                            .build()
                    )
                    .setQuantity(1L)
                    .build()
            )
            .build();
        
        Session session = Session.create(params);
        return ResponseEntity.ok(Map.of("sessionId", session.getId()));
    } catch (StripeException e) {
        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
}
```

#### Step 5: Test Payment
- Use test card: 4242 4242 4242 4242
- Any future expiry date
- Any CVV

---

### 3. Demo Mode (For Testing)

No setup required! Just select "Demo Payment" option at checkout.
- Simulates payment processing
- 90% success rate (10% random failures for testing error handling)
- No real money involved

---

## Payment Flow

1. **User selects payment method** at checkout
2. **Order is created** in database with PENDING status
3. **Payment gateway is initiated**:
   - **Razorpay**: Opens modal with payment options
   - **Stripe**: Redirects to Stripe checkout page
   - **Demo**: Simulates 2-second processing
4. **On success**: Order status → CONFIRMED, user redirected to order tracking
5. **On failure**: User stays on checkout, can retry

---

## Security Best Practices

### ✅ DO:
- Store API keys in environment variables (`.env` file)
- Never commit API keys to Git
- Use test keys for development
- Verify payments on backend before fulfilling orders
- Use HTTPS in production

### ❌ DON'T:
- Hardcode API keys in source code
- Use live keys for testing
- Trust client-side payment verification alone
- Store card details in your database

---

## Environment Variables Setup

Create `.env` file in project root:

```bash
# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here

# Backend Payment Service
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
```

Update `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  }
})
```

Update `paymentGateway.js` to use env variables:
```javascript
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_default';
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_default';
```

---

## Testing

### Test Cards

**Razorpay:**
- Success: 4111 1111 1111 1111
- Failure: 4000 0000 0000 0002
- 3D Secure: 4000 0027 6000 3184

**Stripe:**
- Success: 4242 4242 4242 4242
- Declined: 4000 0000 0000 0002
- Requires Auth: 4000 0025 0000 3155

---

## Webhook Integration (Production)

For production, set up webhooks to verify payments:

### Razorpay Webhook:
1. Dashboard → Webhooks → Add Endpoint
2. URL: `https://yourapp.com/api/payments/razorpay-webhook`
3. Events: `payment.captured`, `payment.failed`

### Stripe Webhook:
1. Dashboard → Developers → Webhooks → Add Endpoint
2. URL: `https://yourapp.com/api/payments/stripe-webhook`
3. Events: `checkout.session.completed`, `payment_intent.succeeded`

---

## Support

- **Razorpay Docs**: https://razorpay.com/docs/
- **Stripe Docs**: https://stripe.com/docs
- **Questions**: Contact your development team

---

## Current Implementation Status

✅ Frontend payment UI with Razorpay, Stripe, Demo options
✅ Payment gateway service with handler functions
✅ Order creation before payment
✅ Success/failure callbacks
✅ Loading states and error handling

⏳ Backend Stripe session creation endpoint (needs implementation)
⏳ Payment verification webhooks (recommended for production)
⏳ Environment variable configuration
⏳ Refund handling
