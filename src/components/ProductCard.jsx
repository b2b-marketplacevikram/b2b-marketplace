import { Link } from 'react-router-dom'
import '../styles/ProductCard.css'

function ProductCard({ product, showDetails = false }) {
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-image">
        <img src={product.image} alt={product.name} />
        {product.badge && <span className="product-badge">{product.badge}</span>}
      </Link>

      <div className="product-body">
        <Link to={`/product/${product.id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>

        {showDetails && product.rating > 0 && (
          <div className="product-rating">
            <span className="stars">⭐ {product.rating}</span>
            {product.reviews > 0 && <span className="reviews">({product.reviews})</span>}
          </div>
        )}

        <div className="product-price">
          <span className="price">${product.price}</span>
          <span className="per-unit">per unit</span>
        </div>

        <div className="product-moq">
          MOQ: {product.moq} units
        </div>

        {product.supplier && (
          <div className="product-supplier">
            <Link to={`/supplier/${product.supplierId || 1}`}>
              {product.supplier}
            </Link>
          </div>
        )}

        {showDetails && product.location && (
          <div className="product-location">
            📍 {product.location}
          </div>
        )}
      </div>

      <div className="product-actions">
        <Link to={`/product/${product.id}`} className="btn-view">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default ProductCard
