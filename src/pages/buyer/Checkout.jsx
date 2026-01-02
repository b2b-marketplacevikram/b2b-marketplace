import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { orderAPI } from '../../services/api'
import { initiateRazorpayPayment, initiateStripePayment, initiateMockPayment, initiateNetBankingPayment } from '../../services/paymentGateway'
import '../../styles/Checkout.css'

function Checkout() {
  const navigate = useNavigate()
  const { cart, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [supplierBankDetails, setSupplierBankDetails] = useState(null)
  const [allSupplierBankDetails, setAllSupplierBankDetails] = useState({}) // For multi-supplier
  const [formData, setFormData] = useState({
    // Shipping Information
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    
    // PO & Payment Information
    poNumber: '',
    paymentType: 'BANK_TRANSFER',  // URGENT_ONLINE, BANK_TRANSFER, UPI, CREDIT_TERMS
    creditTermsDays: 30,
    
    // Legacy payment method for gateway
    paymentMethod: 'razorpay',
    
    // Additional
    notes: ''
  })

  // Commission rate for urgent payments
  const COMMISSION_RATE = 0.02  // 2%

  // Group cart items by supplier
  const groupCartBySupplier = () => {
    const grouped = {}
    cart.forEach(item => {
      const supplierId = item.supplierId || 1
      if (!grouped[supplierId]) {
        grouped[supplierId] = {
          supplierId,
          supplierName: item.supplierName || `Supplier ${supplierId}`,
          items: [],
          subtotal: 0
        }
      }
      grouped[supplierId].items.push(item)
      grouped[supplierId].subtotal += item.price * item.quantity
    })
    return grouped
  }

  const supplierGroups = groupCartBySupplier()
  const uniqueSupplierIds = Object.keys(supplierGroups)
  const hasMultipleSuppliers = uniqueSupplierIds.length > 1

  // Fetch supplier bank details when component mounts
  useEffect(() => {
    // Fetch bank details for all unique suppliers
    uniqueSupplierIds.forEach(supplierId => {
      fetchSupplierBankDetails(supplierId)
    })
  }, [cart.length])

  const fetchSupplierBankDetails = async (supplierId) => {
    try {
      const response = await fetch(`http://localhost:8083/api/orders/supplier/${supplierId}/bank-details`)
      if (response.ok) {
        const data = await response.json()
        // Check if supplier has configured their bank details
        if (data && data.accountNumber && !data.notConfigured) {
          setSupplierBankDetails(data)
          setAllSupplierBankDetails(prev => ({ ...prev, [supplierId]: data }))
        } else {
          // Supplier hasn't set up bank details yet
          const placeholderDetails = {
            bankName: 'Pending Setup',
            accountHolderName: `Supplier #${supplierId}`,
            accountNumber: 'Bank details not configured',
            ifscCode: 'N/A',
            upiId: 'N/A',
            notConfigured: true
          }
          setAllSupplierBankDetails(prev => ({ ...prev, [supplierId]: placeholderDetails }))
          if (!supplierBankDetails) setSupplierBankDetails(placeholderDetails)
        }
      } else {
        // Supplier hasn't set up bank details yet - use placeholder
        const placeholderDetails = {
          bankName: 'Pending Setup',
          accountHolderName: `Supplier #${supplierId}`,
          accountNumber: 'Bank details not configured',
          ifscCode: 'N/A',
          upiId: 'N/A',
          notConfigured: true
        }
        setAllSupplierBankDetails(prev => ({ ...prev, [supplierId]: placeholderDetails }))
        if (!supplierBankDetails) setSupplierBankDetails(placeholderDetails)
      }
    } catch (error) {
      console.log('Bank details not configured for supplier:', supplierId)
      // Supplier hasn't set up bank details yet - use placeholder
      const placeholderDetails = {
        bankName: 'Pending Setup',
        accountHolderName: `Supplier #${supplierId}`,
        accountNumber: 'Bank details not configured',
        ifscCode: 'N/A',
        upiId: 'N/A',
        notConfigured: true
      }
      setAllSupplierBankDetails(prev => ({ ...prev, [supplierId]: placeholderDetails }))
      if (!supplierBankDetails) setSupplierBankDetails(placeholderDetails)
    }
  }

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
    navigate(`/orders/${paymentResponse.orderId || 'confirmed'}?payment=success`, {
      state: { 
        orderConfirmed: true,
        paymentConfirmed: true,
        paymentId: paymentResponse.paymentId,
        gateway: paymentResponse.gateway
      }
    })
  }

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error)
    setProcessing(false)
    toast.error('Payment failed: ' + error.message + '. Please try again or choose a different payment method.', '💳')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (processing) return
    
    setProcessing(true)
    
    // Prepare shipping address
    const shippingAddress = `${formData.companyName}, ${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} ${formData.postalCode}`
    
    // Calculate commission for online payment gateways (Razorpay & Stripe)
    const baseTotal = subtotal + shipping + tax
    const commission = (formData.paymentType === 'URGENT_ONLINE' || formData.paymentType === 'STRIPE') ? baseTotal * COMMISSION_RATE : 0
    const finalTotal = baseTotal + commission

    // For multi-supplier Bank Transfer/UPI: Create separate orders per supplier
    if (hasMultipleSuppliers && (formData.paymentType === 'BANK_TRANSFER' || formData.paymentType === 'UPI')) {
      try {
        const createdOrders = []
        const shippingPerSupplier = shipping / uniqueSupplierIds.length // Split shipping
        
        // Create an order for each supplier
        for (const supplierId of uniqueSupplierIds) {
          const supplierGroup = supplierGroups[supplierId]
          const supplierSubtotal = supplierGroup.subtotal
          const supplierTax = supplierSubtotal * 0.1
          const supplierTotal = supplierSubtotal + shippingPerSupplier + supplierTax
          
          const orderData = {
            buyerId: user?.id || 1,
            supplierId: parseInt(supplierId),
            paymentMethod: formData.paymentType === 'BANK_TRANSFER' ? 'Bank Transfer' : 'UPI',
            subtotal: supplierSubtotal,
            taxAmount: supplierTax,
            shippingCost: shippingPerSupplier,
            totalAmount: supplierTotal,
            shippingAddress: shippingAddress,
            billingAddress: shippingAddress,
            shippingMethod: 'Standard Shipping',
            notes: formData.notes,
            poNumber: formData.poNumber,
            paymentType: formData.paymentType,
            isUrgent: false,
            creditTermsDays: null,
            items: supplierGroup.items.map(item => ({
              productId: item.id,
              productName: item.name,
              productImage: item.image || null,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.price * item.quantity
            }))
          }
          
          const result = await orderAPI.create(orderData)
          if (result.success) {
            createdOrders.push({
              orderNumber: result.data.orderNumber,
              supplierId: parseInt(supplierId),
              supplierName: supplierGroup.supplierName,
              totalAmount: supplierTotal,
              bankDetails: allSupplierBankDetails[supplierId],
              items: supplierGroup.items
            })
          }
        }
        
        if (createdOrders.length === 0) {
          setProcessing(false)
          toast.error('Failed to create orders. Please try again.', '❌')
          return
        }
        
        // Navigate to multi-supplier payment instructions page
        setProcessing(false)
        clearCart()
        navigate(`/orders/multi-payment-instructions`, {
          state: { 
            orderConfirmed: true,
            paymentType: formData.paymentType,
            orders: createdOrders,
            totalAmount: finalTotal
          }
        })
        return
      } catch (error) {
        console.error('Multi-supplier order error:', error)
        setProcessing(false)
        toast.error('An error occurred while creating orders. Please try again.', '❌')
        return
      }
    }

    // Single supplier order flow (original logic)
    const orderData = {
      buyerId: user?.id || 1,
      supplierId: cart[0]?.supplierId || 1,
      paymentMethod: formData.paymentType === 'URGENT_ONLINE' ? 'Razorpay' :
                    formData.paymentType === 'STRIPE' ? 'Stripe' :
                    formData.paymentType === 'BANK_TRANSFER' ? 'Bank Transfer' :
                    formData.paymentType === 'UPI' ? 'UPI' :
                    formData.paymentType === 'CREDIT_TERMS' ? `Credit (NET ${formData.creditTermsDays})` : 'Bank Transfer',
      subtotal: subtotal,
      taxAmount: tax,
      shippingCost: shipping,
      totalAmount: finalTotal,
      shippingAddress: shippingAddress,
      billingAddress: shippingAddress,
      shippingMethod: 'Standard Shipping',
      notes: formData.notes,
      // B2B Payment fields
      poNumber: formData.poNumber,
      paymentType: formData.paymentType === 'STRIPE' ? 'URGENT_ONLINE' : formData.paymentType, // Map STRIPE to URGENT_ONLINE for backend
      isUrgent: formData.paymentType === 'URGENT_ONLINE' || formData.paymentType === 'STRIPE',
      creditTermsDays: formData.paymentType === 'CREDIT_TERMS' ? parseInt(formData.creditTermsDays) : null,
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        productImage: item.image || null,
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
        toast.error('Failed to create order: ' + result.message, '📦')
        return
      }
      
      const orderNumber = result.data.orderNumber
      
      // Handle payment based on type
      if (formData.paymentType === 'URGENT_ONLINE') {
        // Razorpay: Use Razorpay for immediate payment
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
      } else if (formData.paymentType === 'STRIPE') {
        // Stripe: Redirect to Stripe checkout
        try {
          const stripeResponse = await fetch('http://localhost:8084/api/payments/stripe/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: orderNumber,
              amount: finalTotal,
              currency: 'inr',
              customerEmail: formData.email,
              successUrl: `${window.location.origin}/order-success?orderId=${orderNumber}&payment=stripe`,
              cancelUrl: `${window.location.origin}/checkout?cancelled=true`
            })
          })
          const stripeData = await stripeResponse.json()
          if (stripeData.url) {
            window.location.href = stripeData.url
          } else {
            throw new Error('Failed to create Stripe session')
          }
        } catch (stripeError) {
          console.error('Stripe error:', stripeError)
          setProcessing(false)
          toast.error('Failed to initiate Stripe payment. Please try another payment method.', '💳')
        }
      } else if (formData.paymentType === 'BANK_TRANSFER' || formData.paymentType === 'UPI') {
        // Bank Transfer / UPI: Show payment instructions
        setProcessing(false)
        clearCart()
        navigate(`/orders/${orderNumber}/payment-instructions`, {
          state: { 
            orderConfirmed: true,
            paymentType: formData.paymentType,
            bankDetails: supplierBankDetails,
            orderNumber: orderNumber,
            totalAmount: finalTotal
          }
        })
      } else if (formData.paymentType === 'CREDIT_TERMS') {
        // Credit Terms: Order confirmed, pay later
        setProcessing(false)
        clearCart()
        navigate(`/orders/${orderNumber}`, {
          state: { 
            orderConfirmed: true,
            message: `Order confirmed with ${formData.creditTermsDays} days credit. Invoice will be sent to your email.`
          }
        })
      }
    } catch (error) {
      console.error('Order creation error:', error)
      setProcessing(false)
      toast.error('An error occurred while creating your order. Please try again.', '📦')
    }
  }

  const subtotal = getCartTotal()
  const shipping = 150.00 // Flat rate for demo
  const tax = subtotal * 0.1 // 10% tax
  const commission = (formData.paymentType === 'URGENT_ONLINE' || formData.paymentType === 'STRIPE') ? (subtotal + shipping + tax) * COMMISSION_RATE : 0
  const total = subtotal + shipping + tax + commission

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
                      <input
                        type="text"
                        name="country"
                        value="India"
                        readOnly
                        style={{background: '#f5f5f5', cursor: 'not-allowed'}}
                      />
                    </div>
                    <div className="form-group">
                      <label>PIN Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        maxLength="6"
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
                  
                  {/* PO Number Field */}
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>Purchase Order (PO) Number <span style={{color: '#888', fontSize: '12px'}}>(Optional)</span></label>
                    <input
                      type="text"
                      name="poNumber"
                      value={formData.poNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your company's PO number"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>
                  
                  <div className="payment-methods">
                    {/* Option A: Bank Transfer - 0% Commission */}
                    <label className={`payment-option ${formData.paymentType === 'BANK_TRANSFER' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="BANK_TRANSFER"
                        checked={formData.paymentType === 'BANK_TRANSFER'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">🏦</div>
                      <div className="payment-details">
                        <span className="payment-title">
                          Bank Transfer (NEFT/RTGS/IMPS)
                          <span className="payment-badge" style={{background: '#e8f5e9', color: '#2e7d32'}}>0% Fee</span>
                        </span>
                        <span className="payment-desc">Transfer directly to supplier's bank • Pay before delivery</span>
                      </div>
                    </label>
                    
                    {formData.paymentType === 'BANK_TRANSFER' && (
                      <div className="card-details-section">
                        <div className="payment-info-box" style={{background: '#fff8e1', borderLeftColor: '#ff9800'}}>
                          <p><strong>ℹ️ Bank Details After Order</strong></p>
                          <p style={{color: '#666', fontSize: '13px', margin: '8px 0 0 0'}}>
                            Supplier bank details will be shown on the payment page after you place the order.
                            {hasMultipleSuppliers && ' Separate bank details will be provided for each supplier.'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Option B: UPI - 0% Commission */}
                    <label className={`payment-option ${formData.paymentType === 'UPI' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="UPI"
                        checked={formData.paymentType === 'UPI'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">📱</div>
                      <div className="payment-details">
                        <span className="payment-title">
                          UPI Payment
                          <span className="payment-badge" style={{background: '#e8f5e9', color: '#2e7d32'}}>0% Fee</span>
                        </span>
                        <span className="payment-desc">Google Pay, PhonePe, Paytm, BHIM • Pay before delivery</span>
                      </div>
                    </label>
                    
                    {formData.paymentType === 'UPI' && (
                      <div className="card-details-section">
                        <div className="payment-info-box" style={{background: '#fff8e1', borderLeftColor: '#ff9800'}}>
                          <p><strong>ℹ️ UPI Details After Order</strong></p>
                          <p style={{color: '#666', fontSize: '13px', margin: '8px 0 0 0'}}>
                            Supplier UPI ID and QR code will be shown on the payment page after you place the order.
                            {hasMultipleSuppliers && ' Separate UPI details will be provided for each supplier.'}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Option C: Credit Terms - 0% Commission (for trusted buyers) */}
                    <label className={`payment-option ${formData.paymentType === 'CREDIT_TERMS' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="CREDIT_TERMS"
                        checked={formData.paymentType === 'CREDIT_TERMS'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">📄</div>
                      <div className="payment-details">
                        <span className="payment-title">
                          Credit Terms
                          <span className="payment-badge" style={{background: '#fff3e0', color: '#e65100'}}>Trusted Buyers</span>
                        </span>
                        <span className="payment-desc">NET 30/60/90 payment • Ships immediately • Invoice generated</span>
                      </div>
                    </label>
                    
                    {formData.paymentType === 'CREDIT_TERMS' && (
                      <div className="card-details-section">
                        <div className="payment-info-box" style={{background: '#fff3e0', borderLeftColor: '#ff9800'}}>
                          <p><strong>📄 Credit Terms (0% Commission)</strong></p>
                          <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Payment Terms:</label>
                            <select
                              name="creditTermsDays"
                              value={formData.creditTermsDays}
                              onChange={handleInputChange}
                              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                              <option value={30}>NET 30 (Pay in 30 days)</option>
                              <option value={60}>NET 60 (Pay in 60 days)</option>
                              <option value={90}>NET 90 (Pay in 90 days)</option>
                            </select>
                          </div>
                          <p style={{marginTop: '12px', color: '#666', fontSize: '13px'}}>
                            ✅ Order ships immediately • Invoice sent via email
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Urgent Online Payment - 2% Commission */}
                    <label className={`payment-option ${formData.paymentType === 'URGENT_ONLINE' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="URGENT_ONLINE"
                        checked={formData.paymentType === 'URGENT_ONLINE'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">⚡</div>
                      <div className="payment-details">
                        <span className="payment-title">
                          Razorpay - Pay Now
                          <span className="payment-badge" style={{background: '#ffebee', color: '#c62828'}}>2% Fee</span>
                        </span>
                        <span className="payment-desc">Cards, UPI, Net Banking, Wallets • Instant confirmation</span>
                      </div>
                    </label>
                    
                    {formData.paymentType === 'URGENT_ONLINE' && (
                      <div className="card-details-section">
                        <div className="payment-info-box" style={{background: '#e3f2fd', borderLeftColor: '#1976d2'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                            <img src="https://razorpay.com/favicon.png" alt="Razorpay" style={{width: '24px', height: '24px'}} onError={(e) => e.target.style.display='none'} />
                            <strong>Razorpay Payment Gateway</strong>
                          </div>
                          <p>✓ Credit/Debit Cards (Visa, Mastercard, RuPay)</p>
                          <p>✓ UPI (Google Pay, PhonePe, Paytm)</p>
                          <p>✓ Net Banking (All major banks)</p>
                          <p>✓ Wallets & EMI options</p>
                          <div style={{marginTop: '12px', padding: '10px', background: '#fff', borderRadius: '4px'}}>
                            <p style={{margin: 0, fontWeight: 'bold', color: '#c62828'}}>
                              Commission: ₹{commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (2% of order total)
                            </p>
                            <p style={{margin: '4px 0 0', fontSize: '12px', color: '#666'}}>
                              Total with commission: ₹{(subtotal + shipping + tax + commission).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Stripe Payment - 2% Commission */}
                    <label className={`payment-option ${formData.paymentType === 'STRIPE' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="STRIPE"
                        checked={formData.paymentType === 'STRIPE'}
                        onChange={handleInputChange}
                      />
                      <div className="payment-icon">💳</div>
                      <div className="payment-details">
                        <span className="payment-title">
                          Stripe - Pay Now
                          <span className="payment-badge" style={{background: '#ffebee', color: '#c62828'}}>2% Fee</span>
                        </span>
                        <span className="payment-desc">International cards accepted • Instant confirmation</span>
                      </div>
                    </label>
                    
                    {formData.paymentType === 'STRIPE' && (
                      <div className="card-details-section">
                        <div className="payment-info-box" style={{background: '#f3e5f5', borderLeftColor: '#7b1fa2'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}>
                            <img src="https://stripe.com/favicon.ico" alt="Stripe" style={{width: '24px', height: '24px'}} onError={(e) => e.target.style.display='none'} />
                            <strong>Stripe Payment Gateway</strong>
                          </div>
                          <p>✓ International Credit/Debit Cards</p>
                          <p>✓ Apple Pay & Google Pay</p>
                          <p>✓ 135+ Currencies supported</p>
                          <p>✓ 3D Secure authentication</p>
                          <div style={{marginTop: '12px', padding: '10px', background: '#fff', borderRadius: '4px'}}>
                            <p style={{margin: 0, fontWeight: 'bold', color: '#c62828'}}>
                              Commission: ₹{commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (2% of order total)
                            </p>
                            <p style={{margin: '4px 0 0', fontSize: '12px', color: '#666'}}>
                              Total with commission: ₹{(subtotal + shipping + tax + commission).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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

                  {formData.poNumber && (
                    <div className="review-section">
                      <h3>PO Number</h3>
                      <p style={{fontWeight: 'bold', fontSize: '16px'}}>{formData.poNumber}</p>
                    </div>
                  )}

                  <div className="review-section">
                    <h3>Payment Method</h3>
                    <p>
                      {formData.paymentType === 'BANK_TRANSFER' && '🏦 Bank Transfer (0% Fee)'}
                      {formData.paymentType === 'UPI' && '📱 UPI Payment (0% Fee)'}
                      {formData.paymentType === 'CREDIT_TERMS' && `📄 Credit Terms - NET ${formData.creditTermsDays} (0% Fee)`}
                      {formData.paymentType === 'URGENT_ONLINE' && '⚡ Razorpay - Pay Now (2% Fee)'}
                      {formData.paymentType === 'STRIPE' && '💳 Stripe - Pay Now (2% Fee)'}
                    </p>
                    {(formData.paymentType === 'URGENT_ONLINE' || formData.paymentType === 'STRIPE') && (
                      <p style={{color: '#c62828', fontWeight: 'bold'}}>
                        Payment Commission: ₹{commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    {(formData.paymentType === 'BANK_TRANSFER' || formData.paymentType === 'UPI') && (
                      <p style={{color: '#666', fontSize: '13px'}}>
                        ⚠️ Order will be held until payment is verified
                      </p>
                    )}
                    {formData.paymentType === 'CREDIT_TERMS' && (
                      <p style={{color: '#e65100', fontSize: '13px'}}>
                        ✅ Ships immediately • Pay within {formData.creditTermsDays} days
                      </p>
                    )}
                  </div>

                  <div className="review-section">
                    <h3>Order Items</h3>
                    {cart.map(item => (
                      <div key={item.id} className="review-item">
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
                        `Place Order - ₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
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
            
            {/* Multi-Supplier Notice */}
            {hasMultipleSuppliers && (
              <div className="multi-supplier-notice" style={{
                background: '#fff3e0',
                border: '1px solid #ff9800',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <p style={{margin: 0, fontSize: '13px', color: '#e65100'}}>
                  <strong>📦 {uniqueSupplierIds.length} Suppliers</strong><br/>
                  {(formData.paymentType === 'BANK_TRANSFER' || formData.paymentType === 'UPI') ? (
                    <span>Separate orders will be created for each supplier. You'll need to make individual payments to each.</span>
                  ) : (
                    <span>Your cart contains items from multiple suppliers.</span>
                  )}
                </p>
              </div>
            )}
            
            <div className="summary-items">
              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                  <span className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>₹{shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="total-row">
                <span>Tax:</span>
                <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {(formData.paymentType === 'URGENT_ONLINE' || formData.paymentType === 'STRIPE') && commission > 0 && (
                <div className="total-row" style={{color: '#c62828'}}>
                  <span>Payment Fee (2%):</span>
                  <span>₹{commission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="total-divider"></div>
              <div className="total-row grand-total">
                <span>Total:</span>
                <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {formData.paymentType !== 'URGENT_ONLINE' && formData.paymentType !== 'STRIPE' && (
                <div style={{marginTop: '8px', padding: '8px', background: '#e8f5e9', borderRadius: '4px', textAlign: 'center'}}>
                  <span style={{color: '#2e7d32', fontWeight: 'bold', fontSize: '13px'}}>
                    ✓ No Payment Fee
                  </span>
                </div>
              )}
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
