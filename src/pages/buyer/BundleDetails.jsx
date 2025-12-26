import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { bundleAPI } from '../../services/api'
import '../../styles/BundleDetails.css'

function BundleDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user, isBuyer } = useAuth()
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchBundle = async () => {
      setLoading(true)
      try {
        const result = await bundleAPI.getById(id)
        
        if (result.success && result.data?.data) {
          setBundle(result.data.data)
          setQuantity(result.data.data.minOrderQuantity || 1)
        }
      } catch (error) {
        console.error('Error loading bundle:', error)
      }
      setLoading(false)
    }

    fetchBundle()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart')
      navigate('/login')
      return
    }

    if (quantity < bundle.minOrderQuantity) {
      alert(`Minimum order quantity is ${bundle.minOrderQuantity}`)
      return
    }

    // Add each product in the bundle to cart
    try {
      for (const item of bundle.items) {
        await addToCart({
          id: item.productId,
          name: item.productName,
          price: item.unitPrice,
          quantity: item.quantity * quantity,
          image: item.productImage,
          bundleId: bundle.id,
          bundleName: bundle.name
        })
      }
      alert('Bundle added to cart!')
    } catch (error) {
      console.error('Failed to add bundle to cart:', error)
      alert('Failed to add bundle to cart')
    }
  }

  if (loading) {
    return <div className="loading">Loading bundle details...</div>
  }

  if (!bundle) {
    return <div className="error">Bundle not found</div>
  }

  return (
    <div className="bundle-details-page">
      <div className="bundle-container">
        {/* Bundle Header */}
        <div className="bundle-header">
          <div className="bundle-main-image">
            {bundle.imageUrl ? (
              <img src={bundle.imageUrl} alt={bundle.name} />
            ) : (
              <div className="bundle-placeholder-large">
                <span>📦</span>
                <span>Bundle</span>
              </div>
            )}
            {bundle.discountPercentage > 0 && (
              <div className="discount-tag">
                -{bundle.discountPercentage}% OFF
              </div>
            )}
          </div>

          <div className="bundle-info">
            <div className="bundle-badge-large">
              <span>📦</span> Product Bundle
            </div>
            
            <h1>{bundle.name}</h1>
            
            <p className="bundle-description">{bundle.description}</p>

            <div className="bundle-supplier-info">
              <span>Sold by: </span>
              <Link to={`/supplier/${bundle.supplierUserId}`}>
                {bundle.supplierName}
              </Link>
            </div>

            <div className="bundle-pricing-section">
              <div className="price-display">
                {bundle.originalPrice !== bundle.bundlePrice && (
                  <span className="original-price">${bundle.originalPrice?.toFixed(2)}</span>
                )}
                <span className="current-price">${bundle.bundlePrice?.toFixed(2)}</span>
              </div>
              {bundle.savings > 0 && (
                <div className="savings-display">
                  You save: <strong>${bundle.savings.toFixed(2)}</strong>
                </div>
              )}
            </div>

            <div className="bundle-stats">
              <div className="stat">
                <span className="stat-value">{bundle.totalItems}</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat">
                <span className="stat-value">{bundle.discountPercentage}%</span>
                <span className="stat-label">Discount</span>
              </div>
              <div className="stat">
                <span className="stat-value">{bundle.minOrderQuantity}</span>
                <span className="stat-label">Min Order</span>
              </div>
            </div>

            <div className="quantity-selector">
              <label>Quantity (bundles):</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(bundle.minOrderQuantity, quantity - 1))}
                  disabled={quantity <= bundle.minOrderQuantity}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(bundle.minOrderQuantity, parseInt(e.target.value) || 1))}
                  min={bundle.minOrderQuantity}
                />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <div className="total-price">
              Total: <strong>${(bundle.bundlePrice * quantity).toFixed(2)}</strong>
            </div>

            {isBuyer ? (
              <button className="add-bundle-to-cart" onClick={handleAddToCart}>
                Add Bundle to Cart
              </button>
            ) : user ? (
              <div className="supplier-notice">
                <span>⚠️ Suppliers cannot purchase bundles</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bundle Items */}
        <div className="bundle-items-section">
          <h2>What's Included ({bundle.items?.length} products)</h2>
          
          <div className="bundle-items-grid">
            {bundle.items?.map((item) => (
              <div key={item.id} className="bundle-item-card">
                <div className="item-image">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} />
                  ) : (
                    <div className="item-placeholder">📦</div>
                  )}
                </div>
                <div className="item-details">
                  <Link to={`/product/${item.productId}`} className="item-name">
                    {item.productName}
                  </Link>
                  <div className="item-quantity">
                    Qty: {item.quantity}
                  </div>
                  <div className="item-pricing">
                    <span className="item-unit-price">${item.unitPrice?.toFixed(2)} each</span>
                    <span className="item-subtotal">Subtotal: ${item.subtotal?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="price-breakdown-section">
          <h2>Price Breakdown</h2>
          <div className="breakdown-table">
            <div className="breakdown-row">
              <span>Original Price (all items)</span>
              <span>${bundle.originalPrice?.toFixed(2)}</span>
            </div>
            <div className="breakdown-row discount">
              <span>Bundle Discount ({bundle.discountPercentage}%)</span>
              <span>-${bundle.savings?.toFixed(2)}</span>
            </div>
            <div className="breakdown-row total">
              <span>Bundle Price</span>
              <span>${bundle.bundlePrice?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BundleDetails
