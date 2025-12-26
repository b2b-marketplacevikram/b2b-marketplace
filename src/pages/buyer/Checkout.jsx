import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { orderAPI } from '../../services/api'
import { initiateRazorpayPayment, initiateStripePayment, initiateMockPayment, initiateNetBankingPayment } from '../../services/paymentGateway'
import '../../styles/Checkout.css'

function Checkout() {
  const navigate = useNavigate()
  const { cart, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    // Shipping Information
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    
    // Payment Information
    paymentMethod: 'credit-card',
    
    // Additional
    notes: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePaymentSuccess = async (paymentResponse) => {
    console.log('Payment successful:', paymentResponse)
    
    // Update order with payment details
    // In production, verify payment on backend before confirming order
    
    setProcessing(false)
    clearCart()
    navigate(`/orders/${paymentResponse.orderId || 'confirmed'}`, {
      state: { 
        orderConfirmed: true,
        paymentId: paymentResponse.paymentId,
        gateway: paymentResponse.gateway
      }
    })
  }

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error)
    setProcessing(false)
    alert('Payment failed: ' + error.message + '\n\nPlease try again or choose a different payment method.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (processing) return
    
    setProcessing(true)
    
    // Prepare order data
    const shippingAddress = `${formData.companyName}, ${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} ${formData.postalCode}`
    
    const orderData = {
      buyerId: user?.id || 1,
      supplierId: cart[0]?.supplierId || 1,
      paymentMethod: formData.paymentMethod === 'stripe' ? 'Stripe' :
                    formData.paymentMethod === 'razorpay' ? 'Razorpay' :
                    formData.paymentMethod === 'netbanking' ? 'Net Banking' :
                    formData.paymentMethod === 'invoice' ? 'Invoice (NET 30)' : 'Letter of Credit',
      subtotal: subtotal,
      taxAmount: tax,
      shippingCost: shipping,
      totalAmount: total,
      shippingAddress: shippingAddress,
      billingAddress: shippingAddress,
      shippingMethod: 'Standard Shipping',
      notes: formData.notes,
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }))
    }
    
    try {
      // Create order via API first
      const result = await orderAPI.create(orderData)
      
      if (!result.success) {
        setProcessing(false)
        alert('Failed to create order: ' + result.message)
        return
      }
      
      const orderNumber = result.data.orderNumber
      
      // Handle payment based on method
      if (formData.paymentMethod === 'razorpay') {
        // Razorpay Payment
        initiateRazorpayPayment(
          {
            ...orderData,
            orderNumber: orderNumber,
            buyerName: formData.contactPerson,
            email: formData.email,
            phone: formData.phone
          },
          (response) => handlePaymentSuccess({ ...response, orderId: orderNumber }),
          handlePaymentFailure
        )
      } else if (formData.paymentMethod === 'stripe') {
        // Stripe Payment - Clear cart before redirect since callback won't be called
        clearCart()
        await initiateStripePayment(
          {
            ...orderData,
            orderNumber: orderNumber
          },
          (response) => handlePaymentSuccess({ ...response, orderId: orderNumber }),
          handlePaymentFailure
        )
      } else if (formData.paymentMethod === 'demo') {
        // Demo/Mock Payment
        initiateMockPayment(
          {
            ...orderData,
            orderNumber: orderNumber
          },
          (response) => handlePaymentSuccess({ ...response, orderId: orderNumber }),
          handlePaymentFailure
        )
      } else if (formData.paymentMethod === 'netbanking') {
        // Net Banking - Clear cart before redirect since callback won't be called
        clearCart()
        initiateNetBankingPayment(
          {
            ...orderData,
            orderNumber: orderNumber,
            buyerName: formData.contactPerson,
            email: formData.email,
            phone: formData.phone
          },
          (response) => handlePaymentSuccess({ ...response, orderId: orderNumber }),
          handlePaymentFailure
        )
      } else {
        // Other payment methods (invoice, LC) - no immediate payment
        setProcessing(false)
        clearCart()
        navigate(`/orders/${orderNumber}`, {
          state: { 
            orderConfirmed: true,
            message: 'Order created successfully. Payment instructions will be sent to your email.'
          }
        })
      }
    } catch (error) {
      console.error('Order creation error:', error)
      setProcessing(false)
      alert('An error occurred while creating your order. Please try again.')
    }
  }

  const subtotal = getCartTotal()
  const shipping = 150.00 // Flat rate for demo
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + shipping + tax

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>

        {/* Progress Steps */}
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Shipping</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Payment</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Review</span>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <div className="form-section">
                  <h2>Shipping Information</h2>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company Name *</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Person *</label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State/Province</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Country *</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Country</option>
                        <option value="USA">United States</option>
                        <option value="China">China</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Germany">Germany</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Postal Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <button type="button" className="btn-next" onClick={() => setStep(2)}>
                    Continue to Payment
                  </button>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <div className="form-section">
                  <h2>Payment Method</h2>
                  <p className="section-subtitle">Choose how you'd like to pay</p>
                  
                  <div className="payment-methods">
                    {/* Razorpay */}
                    <label className={`payment-option ${formData.paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={formData.paymentMethod === 'razorpay'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">🇮🇳</div>
                      <div className="payment-details">
                        <span className="payment-title">
                          Razorpay
                          <span className="payment-badge">Popular in India</span>
                        </span>
                        <span className="payment-desc">UPI, Cards, Net Banking, Wallets • Instant confirmation</span>
                      </div>
                    </label>
                    
                    {formData.paymentMethod === 'razorpay' && (
                      <div className="card-details-section">
                        <div className="payment-info-box">
                          <p>🔒 <strong>Secure Payment via Razorpay</strong></p>
                          <p>✓ UPI (Google Pay, PhonePe, Paytm)</p>
                          <p>✓ Credit/Debit Cards (Visa, Mastercard, RuPay)</p>
                          <p>✓ Net Banking (All major banks)</p>
                          <p>✓ Wallets (Paytm, Mobikwik, etc.)</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Stripe */}
                    <label className={`payment-option ${formData.paymentMethod === 'stripe' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={formData.paymentMethod === 'stripe'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">💳</div>
                      <div className="payment-details">
                        <span className="payment-title">
                          Credit / Debit Card
                          <span className="payment-badge">International</span>
                        </span>
                        <span className="payment-desc">Visa, Mastercard, Amex • Powered by Stripe</span>
                      </div>
                    </label>
                    
                    {formData.paymentMethod === 'stripe' && (
                      <div className="card-details-section">
                        <div className="payment-info-box">
                          <p>🔒 <strong>Secure Payment via Stripe</strong></p>
                          <p>✓ All major credit & debit cards accepted</p>
                          <p>✓ International payments supported</p>
                          <p>✓ PCI DSS Level 1 compliant</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Demo Payment */}
                    <label className={`payment-option ${formData.paymentMethod === 'demo' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="demo"
                        checked={formData.paymentMethod === 'demo'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">🎮</div>
                      <div className="payment-details">
                        <span className="payment-title">
                          Demo Payment
                          <span className="payment-badge" style={{background: '#e3f2fd', color: '#1976d2'}}>Testing</span>
                        </span>
                        <span className="payment-desc">Simulate payment for testing • No real transaction</span>
                      </div>
                    </label>
                    
                    {formData.paymentMethod === 'demo' && (
                      <div className="card-details-section">
                        <div className="payment-info-box" style={{background: '#e3f2fd', border: '1px solid #2196f3', borderLeftColor: '#2196f3'}}>
                          <p>🎮 <strong>Demo Mode Active</strong></p>
                          <p>This simulates a payment for testing purposes.</p>
                          <p>No real money will be charged.</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Net Banking */}
                    <label className={`payment-option ${formData.paymentMethod === 'netbanking' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="netbanking"
                        checked={formData.paymentMethod === 'netbanking'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">🏦</div>
                      <div className="payment-details">
                        <span className="payment-title">
                          Net Banking
                          <span className="payment-badge">All Banks</span>
                        </span>
                        <span className="payment-desc">Login to your bank portal • Instant confirmation</span>
                      </div>
                    </label>
                    
                    {formData.paymentMethod === 'netbanking' && (
                      <div className="card-details-section">
                        <div className="payment-info-box">
                          <p>🔒 <strong>Secure Net Banking Payment</strong></p>
                          <p>✓ You'll be redirected to your bank's secure login page</p>
                          <p>✓ Complete payment using your Internet Banking credentials</p>
                          <p>✓ Return to order confirmation after successful payment</p>
                          <p>✓ Supports all major banks (SBI, HDFC, ICICI, Axis, etc.)</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Invoice Payment */}
                    <label className={`payment-option ${formData.paymentMethod === 'invoice' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="invoice"
                        checked={formData.paymentMethod === 'invoice'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">📄</div>
                      <div className="payment-details">
                        <span className="payment-title">
                          Invoice Payment
                          <span className="payment-badge" style={{background: '#fff3e0', color: '#e65100'}}>NET 30</span>
                        </span>
                        <span className="payment-desc">Pay within 30 days • For verified businesses only</span>
                      </div>
                    </label>
                    
                    {/* Letter of Credit */}
                    <label className={`payment-option ${formData.paymentMethod === 'letter-of-credit' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="letter-of-credit"
                        checked={formData.paymentMethod === 'letter-of-credit'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">📋</div>
                      <div className="payment-details">
                        <span className="payment-title">Letter of Credit (L/C)</span>
                        <span className="payment-desc">For large international orders • Bank guaranteed</span>
                      </div>
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-back" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button type="button" className="btn-next" onClick={() => setStep(3)}>
                      Review Order
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review Order */}
              {step === 3 && (
                <div className="form-section">
                  <h2>Review Your Order</h2>
                  
                  <div className="review-section">
                    <h3>Shipping Address</h3>
                    <p>{formData.companyName}</p>
                    <p>{formData.contactPerson}</p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.state} {formData.postalCode}</p>
                    <p>{formData.country}</p>
                    <p>Email: {formData.email}</p>
                    <p>Phone: {formData.phone}</p>
                  </div>

                  <div className="review-section">
                    <h3>Payment Method</h3>
                    <p>
                      {formData.paymentMethod === 'razorpay' && '💳 Razorpay - UPI, Cards, Wallets'}
                      {formData.paymentMethod === 'stripe' && '💳 Stripe - International Cards'}
                      {formData.paymentMethod === 'demo' && '🎮 Demo Payment (Testing)'}
                      {formData.paymentMethod === 'netbanking' && '🏦 Net Banking - Instant confirmation'}
                      {formData.paymentMethod === 'invoice' && '📄 Invoice Payment (NET 30)'}
                      {formData.paymentMethod === 'letter-of-credit' && '📋 Letter of Credit'}
                    </p>
                  </div>

                  <div className="review-section">
                    <h3>Order Items</h3>
                    {cart.map(item => (
                      <div key={item.id} className="review-item">
                        <span>{item.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="form-group">
                    <label>Order Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Add any special instructions or requirements..."
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-back" onClick={() => setStep(2)} disabled={processing}>
                      Back
                    </button>
                    <button type="submit" className="btn-submit" disabled={processing}>
                      {processing ? (
                        <>
                          <span className="spinner"></span>
                          Processing...
                        </>
                      ) : (
                        `Place Order - $${total.toFixed(2)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="total-divider"></div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="secure-badge">
              🔒 Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
