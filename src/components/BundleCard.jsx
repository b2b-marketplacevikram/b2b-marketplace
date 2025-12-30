import { Link } from 'react-router-dom'
import '../styles/BundleCard.css'

function BundleCard({ bundle }) {
  const discountPercent = bundle.discountPercentage || 0
  const savings = bundle.savings || 0

  return (
    <div className="bundle-card">
      <div className="bundle-badge">
        <span className="bundle-icon">📦</span>
        <span>Bundle</span>
      </div>
      
      {discountPercent > 0 && (
        <div className="discount-badge">
          -{discountPercent}% OFF
        </div>
      )}

      <div className="bundle-image">
        {bundle.imageUrl ? (
          <img src={bundle.imageUrl} alt={bundle.name} />
        ) : (
          <div className="bundle-placeholder">
            <span>📦</span>
            <span>{bundle.totalItems || 0} Products</span>
          </div>
        )}
      </div>

      <div className="bundle-content">
        <h3 className="bundle-name">{bundle.name}</h3>
        
        <p className="bundle-description">
          {bundle.description?.substring(0, 80)}
          {bundle.description?.length > 80 ? '...' : ''}
        </p>

        <div className="bundle-items-preview">
          <span className="items-count">
            {bundle.totalItems || bundle.items?.length || 0} products included
          </span>
        </div>

        <div className="bundle-pricing">
          <div className="price-row">
            {bundle.originalPrice && bundle.originalPrice !== bundle.bundlePrice && (
              <span className="original-price">₹{bundle.originalPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            )}
            <span className="bundle-price">₹{bundle.bundlePrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          {savings > 0 && (
            <span className="savings">Save ₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          )}
        </div>

        <div className="bundle-supplier">
          <span>By {bundle.supplierName || 'Supplier'}</span>
        </div>

        <div className="bundle-moq">
          MOQ: {bundle.minOrderQuantity || 1} bundle(s)
        </div>

        <Link to={`/bundles/${bundle.id}`} className="view-bundle-btn">
          View Bundle
        </Link>
      </div>
    </div>
  )
}

export default BundleCard
