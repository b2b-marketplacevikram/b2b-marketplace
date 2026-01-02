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
  const [showSupplierSelection, setShowSupplierSelection] = useState(false)

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

  const supplierGroups = getItemsBySupplier()
  const hasMultipleSuppliers = supplierGroups.length > 1

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
    setShowSupplierSelection(false)
    setShowQuoteModal(true)
  }

  const handleRequestQuoteAll = () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (supplierGroups.length === 1) {
      // Single supplier - request quote directly
      handleRequestQuote(supplierGroups[0].supplierId, supplierGroups[0].supplierName, supplierGroups[0].items)
    } else {
      // Multiple suppliers - show selection dialog
      setShowSupplierSelection(true)
    }
  }

  const getSupplierTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
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
              📋 Request Quote {hasMultipleSuppliers && `(${supplierGroups.length} Suppliers)`}
            </button>

            {hasMultipleSuppliers && (
              <p className="multi-supplier-note">
                ⚠️ Cart has products from {supplierGroups.length} suppliers. 
                Separate quotes will be created for each supplier.
              </p>
            )}

            <div className="secure-checkout">
              <span>🔒 Secure Checkout</span>
            </div>

            <Link to="/search" className="continue-shopping">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Supplier-wise breakdown for multi-vendor cart */}
        {hasMultipleSuppliers && (
          <div className="supplier-breakdown">
            <h2>Products by Supplier</h2>
            {supplierGroups.map(group => (
              <div key={group.supplierId} className="supplier-group">
                <div className="supplier-group-header">
                  <div className="supplier-info">
                    <h3>🏭 {group.supplierName}</h3>
                    <span className="item-count">{group.items.length} item(s)</span>
                  </div>
                  <div className="supplier-actions">
                    <span className="group-total">
                      ₹{getSupplierTotal(group.items).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <button 
                      className="btn-quote-supplier"
                      onClick={() => handleRequestQuote(group.supplierId, group.supplierName, group.items)}
                    >
                      📋 Request Quote
                    </button>
                  </div>
                </div>
                <div className="supplier-items">
                  {group.items.map(item => (
                    <div key={item.id} className="supplier-item">
                      <img src={item.image} alt={item.name} />
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">Qty: {item.quantity}</span>
                      <span className="item-price">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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

      {/* Supplier Selection Modal for Multi-Vendor Quote */}
      {showSupplierSelection && (
        <div className="modal-overlay" onClick={() => setShowSupplierSelection(false)}>
          <div className="supplier-selection-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Request Quote by Supplier</h2>
              <button className="close-btn" onClick={() => setShowSupplierSelection(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-info">
                Your cart contains products from <strong>{supplierGroups.length} different suppliers</strong>. 
                In B2B, quotes are negotiated separately with each supplier. 
                Please select which supplier to request a quote from:
              </p>
              <div className="supplier-list">
                {supplierGroups.map(group => (
                  <div key={group.supplierId} className="supplier-option">
                    <div className="supplier-details">
                      <h3>🏭 {group.supplierName}</h3>
                      <p>{group.items.length} product(s) • ₹{getSupplierTotal(group.items).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      <ul className="product-list">
                        {group.items.slice(0, 3).map(item => (
                          <li key={item.id}>{item.name} (×{item.quantity})</li>
                        ))}
                        {group.items.length > 3 && <li>+{group.items.length - 3} more...</li>}
                      </ul>
                    </div>
                    <button 
                      className="btn-select-supplier"
                      onClick={() => handleRequestQuote(group.supplierId, group.supplierName, group.items)}
                    >
                      Request Quote
                    </button>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <p className="tip">💡 Tip: You can request quotes from all suppliers one by one for best pricing.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
