import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import '../../styles/Cart.css'

function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart()

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
                  <span className="price">${item.price.toFixed(2)}</span>
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
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
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
                <span>${getCartTotal().toFixed(2)}</span>
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
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn-checkout">
              Proceed to Checkout
            </Link>

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
    </div>
  )
}

export default Cart
