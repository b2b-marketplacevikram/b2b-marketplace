import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useMessaging } from '../../context/MessagingContext'
import { productAPI } from '../../services/api'
import '../../styles/ProductDetails.css'

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user, isBuyer } = useAuth()
  const { startConversation, selectConversation } = useMessaging()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(100)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const result = await productAPI.getById(id)
        
        if (result.success && result.data?.data) {
          const p = result.data.data
          
          // Parse specifications safely
          let parsedSpecs = {
            'Brand': p.brand || 'N/A',
            'Model': p.model || 'N/A',
            'Unit': p.unit || 'piece',
            'Origin': p.origin || 'N/A'
          }
          
          if (p.specifications) {
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(p.specifications)
              if (typeof parsed === 'object' && parsed !== null) {
                parsedSpecs = parsed
              }
            } catch (e) {
              // If not valid JSON, use as description
              console.log('Specifications is not JSON:', p.specifications)
            }
          }
          
          // Handle images with fallback
          const productImages = p.images && p.images.length > 0 
            ? p.images.map(img => img.imageUrl || img)
            : ['https://via.placeholder.com/600x400?text=' + encodeURIComponent(p.name || 'Product')]
          
          const mappedProduct = {
            id: p.id,
            name: p.name,
            price: p.unitPrice,
            moq: p.moq || 100,
            stock: p.stockQuantity || 0,
            rating: p.averageRating || 0,
            reviews: p.reviewCount || 0,
            images: productImages,
            supplier: {
              id: p.supplierUserId || p.supplierId,  // Use supplierUserId for messaging
              name: p.supplierName || 'Supplier',
              rating: 4.7,
              responseTime: '< 24 hours',
              verified: true,
              location: p.origin || 'N/A'
            },
            description: p.description || 'No description available',
            specifications: parsedSpecs,
            features: [
              `Minimum order quantity: ${p.moq || 1} units`,
              `Lead time: ${p.leadTimeDays || 7}-15 days`,
              `Brand: ${p.brand || 'Generic'}`,
              `Available stock: ${p.stockQuantity || 0} units`
            ],
            shippingInfo: {
              leadTime: `${p.leadTimeDays || 7}-15 days`,
              shippingMethods: ['Sea Freight', 'Air Freight', 'Express'],
              packagingDetails: 'Contact supplier for packaging details'
            }
          }
          setProduct(mappedProduct)
          setQuantity(mappedProduct.moq)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      }
      
      setLoading(false)
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (quantity < product.moq) {
      alert(`Minimum order quantity is ${product.moq}`)
      return
    }
    
    try {
      const result = await addToCart({ ...product, quantity })
      if (result?.success) {
        alert('Product added to cart!')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const handleContactSupplier = async () => {
    if (!user) {
      alert('Please login to contact supplier')
      navigate('/login')
      return
    }

    if (!product?.supplier?.id) {
      alert('Supplier information not available')
      return
    }

    try {
      // Start conversation with supplier
      const conversation = await startConversation(product.supplier.id)
      
      if (conversation) {
        // Select the conversation and navigate to messages
        await selectConversation(conversation)
        navigate('/messages')
      } else {
        alert('Failed to start conversation. Please try again.')
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      alert('Failed to contact supplier. Please try again.')
    }
  }

  if (loading) {
    return <div className="loading">Loading product details...</div>
  }

  if (!product) {
    return <div className="error">Product not found</div>
  }

  return (
    <div className="product-details-page">
      <div className="product-container">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={product.images[selectedImage]} alt={product.name} />
          </div>
          <div className="thumbnail-gallery">
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.name} ${index + 1}`}
                className={selectedImage === index ? 'active' : ''}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1>{product.name}</h1>
          <div className="product-meta">
            <div className="rating">
              <span className="stars">⭐ {product.rating}</span>
              <span className="reviews">({product.reviews} reviews)</span>
            </div>
            <span className="product-id">Product ID: #{product.id}</span>
          </div>

          <div className="price-section">
            <div className="price">${product.price}</div>
            <div className="moq">MOQ: {product.moq} units</div>
          </div>

          <div className="supplier-info">
            <Link to={`/supplier/${product.supplier.id}`} className="supplier-link">
              <div className="supplier-badge">
                {product.supplier.verified && <span className="verified">✓ Verified</span>}
                <strong>{product.supplier.name}</strong>
              </div>
            </Link>
            <div className="supplier-details">
              <span>⭐ {product.supplier.rating}</span>
              <span>📍 {product.supplier.location}</span>
              <span>⏱️ Response: {product.supplier.responseTime}</span>
            </div>
          </div>

          <div className="quantity-section">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(product.moq, quantity - 10))}>-</button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
                min={product.moq}
              />
              <button onClick={() => setQuantity(quantity + 10)}>+</button>
            </div>
            <span className="stock-info">
              {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
            </span>
          </div>

          <div className="action-buttons">
            {isBuyer && (
              <button className="btn-primary" onClick={handleAddToCart}>
                Add to Cart
              </button>
            )}
            {!isBuyer && user && (
              <div className="supplier-notice">
                <span>⚠️ Suppliers cannot purchase products</span>
              </div>
            )}
            <button className="btn-secondary" onClick={handleContactSupplier}>
              {isBuyer ? 'Contact Supplier' : 'Message Buyer/Supplier'}
            </button>
          </div>

          <div className="shipping-info">
            <h3>Shipping Information</h3>
            <p><strong>Lead Time:</strong> {product.shippingInfo.leadTime}</p>
            <p><strong>Methods:</strong> {product.shippingInfo.shippingMethods.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="product-tabs">
        <div className="tab-headers">
          <button
            className={activeTab === 'description' ? 'active' : ''}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={activeTab === 'specifications' ? 'active' : ''}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.reviews})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div className="description-tab">
              <p>{product.description}</p>
              <h3>Key Features:</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="specifications-tab">
              <table>
                <tbody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key}>
                      <td><strong>{key}</strong></td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab">
              <div className="review-summary">
                <div className="average-rating">
                  <h2>{product.rating}</h2>
                  <div className="stars">⭐⭐⭐⭐⭐</div>
                  <p>{product.reviews} reviews</p>
                </div>
              </div>
              <div className="reviews-list">
                <div className="review-item">
                  <div className="review-header">
                    <strong>John Doe</strong>
                    <span className="review-date">2 weeks ago</span>
                  </div>
                  <div className="review-rating">⭐⭐⭐⭐⭐</div>
                  <p>Excellent product! High quality and delivered on time. Would definitely order again.</p>
                </div>
                <div className="review-item">
                  <div className="review-header">
                    <strong>Jane Smith</strong>
                    <span className="review-date">1 month ago</span>
                  </div>
                  <div className="review-rating">⭐⭐⭐⭐</div>
                  <p>Good value for money. Supplier was very responsive to queries.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
