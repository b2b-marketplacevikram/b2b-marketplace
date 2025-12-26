import { loadStripe } from '@stripe/stripe-js';

// Payment Gateway Configuration
const PAYMENT_API_URL = 'http://localhost:8084/api/payments';

// Stripe instance (lazy loaded)
let stripePromise = null;

/**
 * Get Stripe public key from backend and initialize Stripe
 */
export const getStripe = async () => {
  if (!stripePromise) {
    try {
      const response = await fetch(`${PAYMENT_API_URL}/stripe/key`);
      const data = await response.json();
      stripePromise = loadStripe(data.publicKey);
    } catch (error) {
      console.error('Failed to get Stripe public key:', error);
      // Fallback to test key
      stripePromise = loadStripe('pk_test_YOUR_STRIPE_PUBLIC_KEY');
    }
  }
  return stripePromise;
};

/**
 * Initiate Razorpay payment with real backend integration
 * @param {Object} orderData - Order details
 * @param {Function} onSuccess - Success callback
 * @param {Function} onFailure - Failure callback
 */
export const initiateRazorpayPayment = async (orderData, onSuccess, onFailure) => {
  try {
    // Step 1: Get Razorpay key from backend
    const keyResponse = await fetch(`${PAYMENT_API_URL}/razorpay/key`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const keyData = await keyResponse.json();

    // Step 2: Create Razorpay order on backend
    const orderResponse = await fetch(`${PAYMENT_API_URL}/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        amount: orderData.totalAmount,
        currency: 'INR',
        receipt: orderData.orderNumber || `order_${Date.now()}`
      })
    });

    const razorpayOrder = await orderResponse.json();

    if (razorpayOrder.error) {
      throw new Error(razorpayOrder.message || 'Failed to create payment order');
    }

    // Step 3: Load Razorpay script and open checkout
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      const options = {
        key: keyData.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'B2B Marketplace',
        description: `Order #${orderData.orderNumber || 'New Order'}`,
        image: '/logo.png',
        order_id: razorpayOrder.orderId,
        handler: async function (response) {
          // Step 4: Verify payment on backend
          try {
            const verifyResponse = await fetch(`${PAYMENT_API_URL}/razorpay/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: orderData.orderNumber
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              onSuccess({
                paymentId: response.razorpay_payment_id,
                orderId: orderData.orderNumber,
                signature: response.razorpay_signature,
                gateway: 'razorpay',
                verified: true
              });
            } else {
              onFailure({ message: 'Payment verification failed' });
            }
          } catch (error) {
            onFailure({ message: 'Failed to verify payment: ' + error.message });
          }
        },
        prefill: {
          name: orderData.buyerName || '',
          email: orderData.email || '',
          contact: orderData.phone || ''
        },
        notes: {
          address: orderData.shippingAddress || '',
          orderId: orderData.orderNumber
        },
        theme: {
          color: '#FF6B35'
        },
        modal: {
          ondismiss: function () {
            onFailure({ message: 'Payment cancelled by user' });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        onFailure({
          message: response.error.description,
          code: response.error.code,
          reason: response.error.reason
        });
      });
      razorpay.open();
    };

    script.onerror = () => {
      onFailure({ message: 'Failed to load Razorpay SDK' });
    };

    document.body.appendChild(script);

  } catch (error) {
    console.error('Razorpay payment error:', error);
    onFailure({ message: error.message || 'Failed to initiate payment' });
  }
};

/**
 * Initiate Stripe payment using Checkout Session (redirect to hosted page)
 * @param {Object} orderData - Order details
 * @param {Function} onSuccess - Success callback (not used for redirect)
 * @param {Function} onFailure - Failure callback
 */
export const initiateStripePayment = async (orderData, onSuccess, onFailure) => {
  try {
    // Create checkout session on backend
    const response = await fetch(`${PAYMENT_API_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        amount: orderData.totalAmount,
        currency: 'usd',
        orderId: orderData.orderNumber,
        productName: `B2B Marketplace Order #${orderData.orderNumber}`,
        successUrl: `${window.location.origin}/orders/${orderData.orderNumber}?payment=success`,
        cancelUrl: `${window.location.origin}/checkout`
      })
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.message || 'Failed to create checkout session');
    }

    // Use the checkout URL directly (modern approach - no deprecated redirectToCheckout)
    if (session.checkoutUrl) {
      window.location.href = session.checkoutUrl;
    } else {
      onFailure({ message: 'Failed to create payment session' });
    }
  } catch (error) {
    console.error('Stripe payment error:', error);
    onFailure({ message: error.message });
  }
};

/**
 * Initiate Stripe payment using PaymentIntent (for custom UI)
 * @param {Object} orderData - Order details
 * @returns {Object} PaymentIntent with clientSecret
 */
export const createStripePaymentIntent = async (orderData) => {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        amount: orderData.totalAmount,
        currency: 'usd',
        description: `Order #${orderData.orderNumber}`,
        orderId: orderData.orderNumber
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to create PaymentIntent:', error);
    throw error;
  }
};

/**
 * Verify Stripe checkout session after redirect
 * @param {string} sessionId - Stripe session ID from URL
 * @returns {Object} Session details
 */
export const verifyStripeSession = async (sessionId) => {
  try {
    const response = await fetch(`${PAYMENT_API_URL}/stripe/session/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to verify Stripe session:', error);
    throw error;
  }
};

/**
 * Mock Payment for Testing (Demo Mode)
 * Simulates payment processing without real gateway
 */
export const initiateMockPayment = (orderData, onSuccess, onFailure) => {
  // Simulate payment processing
  setTimeout(() => {
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      onSuccess({
        paymentId: 'MOCK_' + Date.now(),
        orderId: orderData.orderNumber,
        gateway: 'demo',
        amount: orderData.totalAmount,
        status: 'completed'
      });
    } else {
      onFailure({ message: 'Payment failed - Demo mode' });
    }
  }, 2000);
};

/**
 * Initiate Net Banking payment via Stripe
 * This opens Stripe Checkout with bank payment methods
 * User will be redirected to complete payment
 * @param {Object} orderData - Order details
 * @param {Function} onSuccess - Success callback
 * @param {Function} onFailure - Failure callback
 */
export const initiateNetBankingPayment = async (orderData, onSuccess, onFailure) => {
  try {
    // Create Stripe checkout session with bank payment methods
    const response = await fetch(`${PAYMENT_API_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        amount: orderData.totalAmount,
        currency: 'usd',
        orderId: orderData.orderNumber,
        productName: `B2B Marketplace Order #${orderData.orderNumber}`,
        successUrl: `${window.location.origin}/orders/${orderData.orderNumber}?payment=success`,
        cancelUrl: `${window.location.origin}/checkout`
      })
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.message || 'Failed to create payment session');
    }

    // Redirect to Stripe Checkout
    if (session.checkoutUrl) {
      window.location.href = session.checkoutUrl;
    } else {
      onFailure({ message: 'Failed to create payment session' });
    }
  } catch (error) {
    console.error('Net Banking payment error:', error);
    onFailure({ message: error.message || 'Failed to initiate payment' });
  }
};

/**
 * Get available payment gateways status
 */
export const getPaymentGatewaysStatus = async () => {
  const status = {
    razorpay: false,
    stripe: false,
    demo: true
  };

  try {
    const razorpayResponse = await fetch(`${PAYMENT_API_URL}/razorpay/key`);
    if (razorpayResponse.ok) {
      const data = await razorpayResponse.json();
      status.razorpay = data.keyId && !data.keyId.includes('DEMO');
    }
  } catch (e) {
    console.log('Razorpay not available');
  }

  try {
    const stripeResponse = await fetch(`${PAYMENT_API_URL}/stripe/key`);
    if (stripeResponse.ok) {
      const data = await stripeResponse.json();
      status.stripe = data.publicKey && !data.publicKey.includes('DEMO');
    }
  } catch (e) {
    console.log('Stripe not available');
  }

  return status;
};
