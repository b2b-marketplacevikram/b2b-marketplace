# Real Payment Gateway Integration Guide

## Overview

The B2B Marketplace now supports real payment gateway integration with **Stripe** and **Razorpay**.

## Supported Payment Gateways

| Gateway | Currencies | Use Case |
|---------|-----------|----------|
| **Stripe** | USD, EUR, GBP, etc. | International payments |
| **Razorpay** | INR | Indian market |
| **Demo/Mock** | Any | Testing without real payments |

## Setup Instructions

### 1. Stripe Configuration

1. Create a Stripe account at https://dashboard.stripe.com
2. Get your API keys from https://dashboard.stripe.com/apikeys
3. Update `backend/payment-service/src/main/resources/application.properties`:

```properties
stripe.secret.key=sk_test_YOUR_ACTUAL_SECRET_KEY
stripe.public.key=pk_test_YOUR_ACTUAL_PUBLIC_KEY
stripe.webhook.secret=whsec_YOUR_WEBHOOK_SECRET
```

### 2. Razorpay Configuration

1. Create a Razorpay account at https://dashboard.razorpay.com
2. Get your API keys from https://dashboard.razorpay.com/app/keys
3. Update `backend/payment-service/src/main/resources/application.properties`:

```properties
razorpay.key.id=rzp_test_YOUR_KEY_ID
razorpay.key.secret=YOUR_KEY_SECRET
```

### 3. Rebuild Payment Service

```bash
cd backend/payment-service
mvn clean install
mvn spring-boot:run
```

## API Endpoints

### Razorpay

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/razorpay/create-order` | Create Razorpay order |
| POST | `/api/payments/razorpay/verify` | Verify payment signature |
| GET | `/api/payments/razorpay/payment/{paymentId}` | Get payment details |
| GET | `/api/payments/razorpay/key` | Get Razorpay key for frontend |

### Stripe

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/stripe/create-payment-intent` | Create PaymentIntent (custom UI) |
| POST | `/api/payments/stripe/create-checkout-session` | Create Checkout Session (hosted) |
| GET | `/api/payments/stripe/payment-intent/{id}` | Get PaymentIntent status |
| GET | `/api/payments/stripe/session/{sessionId}` | Get Session status |
| GET | `/api/payments/stripe/key` | Get Stripe public key |
| POST | `/api/payments/stripe/webhook` | Handle Stripe webhooks |

## Payment Flow

### Razorpay Flow

```
1. Frontend calls: POST /api/payments/razorpay/create-order
2. Backend creates order with Razorpay API
3. Frontend opens Razorpay Checkout with order_id
4. User completes payment in Razorpay UI
5. Razorpay returns payment_id and signature
6. Frontend calls: POST /api/payments/razorpay/verify
7. Backend verifies signature with Razorpay
8. Order confirmed if signature valid
```

### Stripe Checkout Flow

```
1. Frontend calls: POST /api/payments/stripe/create-checkout-session
2. Backend creates session with Stripe API
3. Frontend redirects to Stripe hosted checkout
4. User completes payment on Stripe page
5. Stripe redirects to success/cancel URL
6. Frontend verifies session: GET /api/payments/stripe/session/{id}
```

### Stripe PaymentIntent Flow (Custom UI)

```
1. Frontend calls: POST /api/payments/stripe/create-payment-intent
2. Backend returns clientSecret
3. Frontend uses Stripe.js Elements for card input
4. Frontend confirms payment with clientSecret
5. Stripe processes payment
6. Frontend receives confirmation
```

## Webhook Configuration

### Stripe Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-domain.com/api/payments/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy webhook signing secret to `stripe.webhook.secret`

### Razorpay Webhooks

1. Go to https://dashboard.razorpay.com/app/webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/razorpay/webhook`
3. Select events as needed

## Frontend Usage

```javascript
import { 
  initiateRazorpayPayment, 
  initiateStripePayment, 
  initiateMockPayment 
} from '../services/paymentGateway';

// Razorpay (INR payments)
initiateRazorpayPayment(orderData, onSuccess, onFailure);

// Stripe (USD/International)
initiateStripePayment(orderData, onSuccess, onFailure);

// Demo/Testing
initiateMockPayment(orderData, onSuccess, onFailure);
```

## Testing

### Test Cards

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Razorpay Test Cards:**
- Success: `4111 1111 1111 1111`
- Any valid expiry and CVV

### Test API

```bash
# Get Razorpay key
curl http://localhost:8084/api/payments/razorpay/key

# Create Razorpay order
curl -X POST http://localhost:8084/api/payments/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR", "receipt": "test_order_1"}'

# Get Stripe key
curl http://localhost:8084/api/payments/stripe/key

# Create PaymentIntent
curl -X POST http://localhost:8084/api/payments/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "usd", "description": "Test order"}'
```

## Security Best Practices

1. **Never expose secret keys** - Keep in backend only
2. **Always verify signatures** - Validate Razorpay signatures server-side
3. **Use webhooks** - For reliable payment confirmation
4. **Enable 3D Secure** - For additional card security
5. **Use HTTPS** - Required for production

## Troubleshooting

### "Invalid API Key" Error
- Verify keys in application.properties
- Check test vs live mode keys

### "Signature Verification Failed"
- Ensure correct webhook secret
- Check signature format

### CORS Errors
- Verify CORS origins in application.properties
- Frontend must be on allowed origin

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Configure webhooks for production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring/alerts
- [ ] Test complete payment flow
- [ ] Configure refund handling
