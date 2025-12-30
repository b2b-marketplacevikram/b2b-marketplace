import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import RequestQuoteModal from '../../components/RequestQuoteModal'
import '../../styles/Cart.css'

function Cart() {
  const navigate = useNavigate()
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart()
  const { user } = useAuth()
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteProducts, setQuoteProducts] = useState([])
  const [quoteSupplierId, setQuoteSupplierId] = useState(null)
  const [quoteSupplierName, setQuoteSupplierName] = useState('')

  const handleQuantityChange = (itemId, newQuantity) => {
    const item = cart.find(i => i.id === itemId)
    if (item && newQuantity >= item.moq) {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemove = (itemId) => {
    if (window.confirm('Remove this item from cart?')) {
      removeFromCart(itemId)
    }
  }

  // Group cart items by supplier
  const getItemsBySupplier = () => {
    const grouped = {}
    cart.forEach(item => {
      const supplierId = item.supplierId || 1
      if (!grouped[supplierId]) {
        grouped[supplierId] = {
          supplierId,
          supplierName: item.supplier || 'Supplier',
          items: []
        }
      }
      grouped[supplierId].items.push(item)
    })
    return Object.values(grouped)
  }

  const handleRequestQuote = (supplierId, supplierName, items) => {
    if (!user) {
      navigate('/login')
      return
    }
    setQuoteProducts(items.map(item => ({
      id: item.id,
      productId: item.id,
      name: item.name,
      productName: item.name,
      image: item.image,
      productImage: item.image,
      price: item.price,
      quantity: item.quantity,
      moq: item.moq,
      unit: 'piece'
    })))
    setQuoteSupplierId(supplierId)
    setQuoteSupplierName(supplierName)
    setShowQuoteModal(true)
  }

  const handleRequestQuoteAll = () => {
    if (!user) {
      navigate('/login')
      return
    }
    // For all items, group by first supplier or show modal for each
    const suppliers = getItemsBySupplier()
    if (suppliers.length === 1) {
      handleRequestQuote(suppliers[0].supplierId, suppliers[0].supplierName, suppliers[0].items)
    } else {
      // Request quote from first supplier for simplicity
      // In a more complete implementation, show a dialog to choose supplier
      handleRequestQuote(suppliers[0].supplierId, suppliers[0].supplierName, suppliers[0].items)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <div className="empty-cart-content">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Start shopping to add items to your cart</p>
          <Link to="/search" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>Shopping Cart ({cart.length} items)</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-details">
                  <Link to={`/product/${item.id}`} className="item-name">
                    <h3>{item.name}</h3>
                  </Link>
                  <p className="item-supplier">
                    Supplier: <Link to={`/supplier/${item.supplierId || 1}`}>{item.supplier}</Link>
                  </p>
                  <p className="item-moq">MOQ: {item.moq} units</p>
                </div>
                <div className="item-price">
                  <span className="price">₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  <span className="per-unit">per unit</span>
                </div>
                <div className="item-quantity">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 10)}
                    disabled={item.quantity <= item.moq}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || item.moq)}
                    min={item.moq}
                  />
                  <button onClick={() => handleQuantityChange(item.id, item.quantity + 10)}>
                    +
                  </button>
                </div>
                <div className="item-total">
                  <strong>₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
                <button className="item-remove" onClick={() => handleRemove(item.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{getCartTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span className="calculated">Calculated at checkout</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span className="calculated">Calculated at checkout</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{getCartTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn-checkout">
              Proceed to Checkout
            </Link>

            <button 
              className="btn-request-quote"
              onClick={handleRequestQuoteAll}
            >
              📋 Request Quote
            </button>

            <div className="secure-checkout">
              <span>🔒 Secure Checkout</span>
            </div>

            <Link to="/search" className="continue-shopping">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        <div className="cart-features">
          <div className="feature">
            <span className="icon">🛡️</span>
            <div>
              <strong>Buyer Protection</strong>
              <p>Full refund if product not as described</p>
            </div>
          </div>
          <div className="feature">
            <span className="icon">🚚</span>
            <div>
              <strong>Fast Delivery</strong>
              <p>Multiple shipping options available</p>
            </div>
          </div>
          <div className="feature">
            <span className="icon">💰</span>
            <div>
              <strong>Secure Payment</strong>
              <p>Multiple payment methods accepted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Quote Modal */}
      <RequestQuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        products={quoteProducts}
        supplierId={quoteSupplierId}
        supplierName={quoteSupplierName}
        isFromCart={true}
      />
    </div>
  )
}

export default Cart
