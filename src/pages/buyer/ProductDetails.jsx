import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useMessaging } from '../../context/MessagingContext'
import { productAPI } from '../../services/api'
import RequestQuoteModal from '../../components/RequestQuoteModal'
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
  const [toast, setToast] = useState({ show: false, type: '', message: '', icon: '' })
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})

  // Generate SEO-friendly meta data
  const generateSEOData = () => {
    if (!product) return null

    const siteUrl = window.location.origin
    const productUrl = `${siteUrl}/product/${product.id}`
    const imageUrl = product.images[0] || `${siteUrl}/default-product.jpg`
    
    // Generate description from product details
    const metaDescription = product.description?.substring(0, 155) || 
      `Buy ${product.name} at ₹${product.price?.toLocaleString('en-IN')} per unit. MOQ: ${product.moq} units. ${product.supplier.verified ? 'Verified Supplier' : 'Quality Supplier'} - ${product.supplier.name}.`
    
    // Generate keywords
    const keywords = [
      product.name,
      product.supplier.name,
      product.supplier.type,
      'B2B',
      'wholesale',
      'bulk order',
      'manufacturer',
      product.specifications?.Brand,
      product.specifications?.Origin
    ].filter(Boolean).join(', ')

    // Generate structured data (Schema.org JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      'name': product.name,
      'image': product.images,
      'description': product.description,
      'sku': `PROD-${product.id}`,
      'mpn': product.specifications?.Model || `MPN-${product.id}`,
      'brand': {
        '@type': 'Brand',
        'name': product.specifications?.Brand || product.supplier.name
      },
      'offers': {
        '@type': 'Offer',
        'url': productUrl,
        'priceCurrency': 'INR',
        'price': product.price,
        'priceValidUntil': new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'seller': {
          '@type': 'Organization',
          'name': product.supplier.name
        }
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': product.rating,
        'reviewCount': product.reviews,
        'bestRating': 5,
        'worstRating': 1
      }
    }

    // Breadcrumb structured data
    const breadcrumbData = {
      '@context': 'https://schema.org/',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': siteUrl
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Products',
          'item': `${siteUrl}/products`
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': product.name,
          'item': productUrl
        }
      ]
    }

    return {
      title: `${product.name} | Buy in Bulk | ${product.supplier.name}`,
      metaDescription,
      keywords,
      productUrl,
      imageUrl,
      structuredData,
      breadcrumbData
    }
  }

  const seoData = generateSEOData()

  // Show toast notification
  const showToast = (type, message, icon = '✓') => {
    setToast({ show: true, type, message, icon })
    setTimeout(() => setToast({ show: false, type: '', message: '', icon: '' }), 3000)
  }

  // Toggle category expand/collapse
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const result = await productAPI.getById(id)
        
        if (result.success && result.data?.data) {
          const p = result.data.data
          
          // Build specifications from classification-based data
          let parsedSpecs = {}
          
          // Add basic product info
          if (p.brand) parsedSpecs['Brand'] = p.brand
          if (p.model) parsedSpecs['Model'] = p.model
          parsedSpecs['Unit'] = p.unit || 'piece'
          if (p.origin) parsedSpecs['Origin'] = p.origin
          
          // Add classification-based specifications
          if (p.classifications && p.classifications.length > 0) {
            p.classifications.forEach(classification => {
              if (classification.attributes && classification.attributes.length > 0) {
                classification.attributes.forEach(attr => {
                  if (attr.value || attr.attributeValue) {
                    const value = attr.value || attr.attributeValue
                    const displayName = attr.displayName || attr.name
                    const unit = attr.unit
                    
                    parsedSpecs[displayName] = unit ? `${value} ${unit}` : value
                  }
                })
              }
            })
          }
          
          // Fallback: if no classifications and old specifications exist
          if (Object.keys(parsedSpecs).length <= 4 && p.specifications) {
            try {
              const parsed = JSON.parse(p.specifications)
              if (typeof parsed === 'object' && parsed !== null) {
                parsedSpecs = { ...parsedSpecs, ...parsed }
              }
            } catch (e) {
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
            supplierType: p.supplierType || null,
            supplier: {
              id: p.supplierUserId || p.supplierId,  // Use supplierUserId for messaging
              name: p.supplierName || 'Supplier',
              type: p.supplierType || null,
              rating: 4.7,
              responseTime: '< 24 hours',
              verified: true,
              location: p.origin || 'N/A'
            },
            description: p.description || 'No description available',
            specifications: parsedSpecs,
            classificationSpecs: p.classifications || [],  // Keep raw classifications for future use
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
      showToast('warning', `Minimum order quantity is ${product.moq}`, '⚠️')
      return
    }
    
    try {
      const result = await addToCart({ ...product, quantity })
      if (result?.success) {
        showToast('success', `${product.name} added to cart!`, '🛒')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      showToast('error', 'Failed to add to cart', '❌')
    }
  }

  const handleContactSupplier = async () => {
    if (!user) {
      showToast('warning', 'Please login to contact supplier', '🔐')
      navigate('/login')
      return
    }

    if (!product?.supplier?.id) {
      showToast('error', 'Supplier information not available', '❌')
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
        showToast('error', 'Failed to start conversation. Please try again.', '❌')
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      alert('Failed to contact supplier. Please try again.')
    }
  }

  const handleRequestQuote = () => {
    if (!user) {
      showToast('warning', 'Please login to request a quote', '🔐')
      navigate('/login')
      return
    }
    setShowQuoteModal(true)
  }

  if (loading) {
    return <div className="loading">Loading product details...</div>
  }

  if (!product) {
    return <div className="error">Product not found</div>
  }

  return (
    <div className="product-details-page">
      {/* SEO Meta Tags */}
      {seoData && (
        <Helmet>
          {/* Basic Meta Tags */}
          <title>{seoData.title}</title>
          <meta name="description" content={seoData.metaDescription} />
          <meta name="keywords" content={seoData.keywords} />
          <link rel="canonical" href={seoData.productUrl} />
          
          {/* Open Graph Tags for Social Media */}
          <meta property="og:type" content="product" />
          <meta property="og:title" content={seoData.title} />
          <meta property="og:description" content={seoData.metaDescription} />
          <meta property="og:image" content={seoData.imageUrl} />
          <meta property="og:url" content={seoData.productUrl} />
          <meta property="og:site_name" content="B2B Marketplace" />
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="INR" />
          <meta property="product:availability" content={product.stock > 0 ? 'in stock' : 'out of stock'} />
          
          {/* Twitter Card Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoData.title} />
          <meta name="twitter:description" content={seoData.metaDescription} />
          <meta name="twitter:image" content={seoData.imageUrl} />
          
          {/* Structured Data - Product Schema */}
          <script type="application/ld+json">
            {JSON.stringify(seoData.structuredData)}
          </script>
          
          {/* Structured Data - Breadcrumb Schema */}
          <script type="application/ld+json">
            {JSON.stringify(seoData.breadcrumbData)}
          </script>
        </Helmet>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/" itemProp="item">
              <span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>
          <li className="breadcrumb-separator" aria-hidden="true">›</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to="/products" itemProp="item">
              <span itemProp="name">Products</span>
            </Link>
            <meta itemProp="position" content="2" />
          </li>
          <li className="breadcrumb-separator" aria-hidden="true">›</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="active">
            <span itemProp="name">{product?.name}</span>
            <meta itemProp="position" content="3" />
          </li>
        </ol>
      </nav>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`product-toast ${toast.type}`} role="alert" aria-live="polite">
          <span className="toast-icon" aria-hidden="true">{toast.icon}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast({ show: false })} aria-label="Close notification">×</button>
        </div>
      )}

      <article className="product-container" itemScope itemType="https://schema.org/Product">
        {/* Hidden meta tags for Schema.org */}
        <meta itemProp="sku" content={`PROD-${product.id}`} />
        <meta itemProp="productID" content={product.id} />
        <meta itemProp="name" content={product.name} />
        
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="main-image-wrapper">
            <figure className="main-image" itemProp="image">
              <img 
                src={product.images[selectedImage]} 
                alt={`${product.name} - Main product image`}
                itemProp="image"
                loading="eager"
              />
              <div className="image-badge" aria-label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}>
                {product.stock > 0 ? (
                  <span className="in-stock-badge">In Stock</span>
                ) : (
                  <span className="out-stock-badge">Out of Stock</span>
                )}
              </div>
            </figure>
          </div>
          <div className="thumbnail-gallery" role="list" aria-label="Product image gallery">
            {product.images.map((img, index) => (
              <div 
                key={index} 
                className={`thumbnail-wrapper ${selectedImage === index ? 'active' : ''}`}
                role="listitem"
              >
                <img
                  src={img}
                  alt={`${product.name} - View ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-category-badge">
            <span className="category-tag">Electronics</span>
          </div>
          
          <h1 className="product-title" itemProp="name">{product.name}</h1>
          
          <div className="product-meta">
            <div className="rating-wrapper" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <div className="stars-display" aria-label={`Rated ${product.rating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(product.rating) ? 'star filled' : 'star'} aria-hidden="true">★</span>
                ))}
              </div>
              <span className="rating-number" itemProp="ratingValue">{product.rating}</span>
              <span className="reviews-count">(<span itemProp="reviewCount">{product.reviews}</span> reviews)</span>
              <meta itemProp="bestRating" content="5" />
              <meta itemProp="worstRating" content="1" />
            </div>
            <span className="product-id">SKU: #{product.id}</span>
          </div>

          <div className="price-section" itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <meta itemProp="priceCurrency" content="INR" />
            <meta itemProp="price" content={product.price} />
            <meta itemProp="availability" content={product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'} />
            <link itemProp="url" href={window.location.href} />
            
            <div className="price-wrapper">
              <span className="price-label">Price</span>
              <div className="price">₹{product.price?.toLocaleString('en-IN')}</div>
              <span className="price-unit">per unit</span>
            </div>
            <div className="moq-info">
              <span className="moq-label">Minimum Order</span>
              <span className="moq-value">{product.moq} units</span>
            </div>
            
            <div itemProp="seller" itemScope itemType="https://schema.org/Organization" style={{ display: 'none' }}>
              <span itemProp="name">{product.supplier.name}</span>
            </div>
          </div>

          <div className="supplier-card">
            <div className="supplier-header">
              <div className="supplier-avatar" aria-hidden="true">
                <span>{product.supplier.name.charAt(0)}</span>
              </div>
              <div className="supplier-info-wrapper">
                <Link to={`/supplier/${product.supplier.id}`} className="supplier-name">
                  {product.supplier.name}
                  {product.supplier.verified && <span className="verified-icon" aria-label="Verified Supplier">✓</span>}
                </Link>
                {product.supplier.type && (
                  <span className={`supplier-type-badge ${product.supplier.type.toLowerCase()}`}>
                    {product.supplier.type}
                  </span>
                )}
              </div>
            </div>
            <div className="supplier-stats" role="list" aria-label="Supplier statistics">
              <div className="stat-item" role="listitem">
                <span className="stat-icon" aria-hidden="true">⭐</span>
                <span className="stat-value">{product.supplier.rating} Rating</span>
              </div>
              <div className="stat-divider" aria-hidden="true"></div>
              <div className="stat-item" role="listitem">
                <span className="stat-icon" aria-hidden="true">📍</span>
                <span className="stat-value">{product.supplier.location}</span>
              </div>
              <div className="stat-divider" aria-hidden="true"></div>
              <div className="stat-item" role="listitem">
                <span className="stat-icon" aria-hidden="true">⏱️</span>
                <span className="stat-value">{product.supplier.responseTime}</span>
              </div>
            </div>
          </div>

          <div className="size-selector-section">
            <label htmlFor="quantity-input" className="section-label">Quantity</label>
            <div className="quantity-controls" role="group" aria-label="Quantity selector">
              <button 
                className="qty-btn"
                onClick={() => setQuantity(Math.max(product.moq, quantity - 10))}
                disabled={quantity <= product.moq}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                id="quantity-input"
                type="number"
                className="qty-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
                min={product.moq}
                aria-label="Product quantity"
              />
              <button 
                className="qty-btn"
                onClick={() => setQuantity(quantity + 10)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <div className="stock-indicator" role="status" aria-live="polite">
              <span className={product.stock > 0 ? 'stock-available' : 'stock-unavailable'}>
                {product.stock > 0 ? `${product.stock} units available` : 'Currently unavailable'}
              </span>
            </div>
          </div>

          <div className="action-buttons">
            {isBuyer && (
              <>
                <button className="btn-add-cart" onClick={handleAddToCart} aria-label="Add product to cart">
                  <span className="btn-icon" aria-hidden="true">🛒</span>
                  Add to Cart
                </button>
                <button className="btn-quote" onClick={handleRequestQuote} aria-label="Request price quote">
                  <span className="btn-icon" aria-hidden="true">📋</span>
                  Request Quote
                </button>
              </>
            )}
            {!isBuyer && user && (
              <div className="supplier-notice" role="alert">
                <span>⚠️ Suppliers cannot purchase products</span>
              </div>
            )}
          </div>

          <button className="btn-contact" onClick={handleContactSupplier} aria-label="Contact supplier">
            <span className="btn-icon" aria-hidden="true">💬</span>
            {isBuyer ? 'Contact Supplier' : 'Message Buyer/Supplier'}
          </button>

          <div className="shipping-details-card">
            <h2 className="card-title">
              <span className="title-icon" aria-hidden="true">🚚</span>
              Shipping Information
            </h2>
            <div className="shipping-items" role="list">
              <div className="shipping-item" role="listitem">
                <span className="item-icon" aria-hidden="true">📦</span>
                <div className="item-content">
                  <span className="item-label">Lead Time</span>
                  <span className="item-value">{product.shippingInfo.leadTime}</span>
                </div>
              </div>
              <div className="shipping-item" role="listitem">
                <span className="item-icon" aria-hidden="true">✈️</span>
                <div className="item-content">
                  <span className="item-label">Methods</span>
                  <span className="item-value">{product.shippingInfo.shippingMethods.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Product Details Tabs */}
      <section className="product-tabs" aria-labelledby="product-tabs-heading">
        <h2 id="product-tabs-heading" className="visually-hidden">Product Details</h2>
        <div className="tab-headers" role="tablist" aria-label="Product information tabs">
          <button
            role="tab"
            aria-selected={activeTab === 'description'}
            aria-controls="description-panel"
            id="description-tab"
            className={activeTab === 'description' ? 'active' : ''}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'specifications'}
            aria-controls="specifications-panel"
            id="specifications-tab"
            className={activeTab === 'specifications' ? 'active' : ''}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'compliance'}
            aria-controls="compliance-panel"
            id="compliance-tab"
            className={activeTab === 'compliance' ? 'active' : ''}
            onClick={() => setActiveTab('compliance')}
          >
            Compliance Info
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'reviews'}
            aria-controls="reviews-panel"
            id="reviews-tab"
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({product.reviews})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'description' && (
            <div 
              role="tabpanel" 
              id="description-panel" 
              aria-labelledby="description-tab"
              className="description-tab"
              itemProp="description"
            >
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
            <div 
              role="tabpanel" 
              id="specifications-panel" 
              aria-labelledby="specifications-tab"
              className="specifications-tab"
            >
              {/* Show classification-based specs if available */}
              {product.classificationSpecs && product.classificationSpecs.length > 0 ? (
                <>
                  {product.classificationSpecs.map(classification => {
                    const isExpanded = expandedCategories[classification.id] !== false; // Default to expanded
                    return (
                      <div key={classification.id} className={`spec-category ${isExpanded ? 'expanded' : 'collapsed'}`}>
                        <h3 
                          className="spec-category-title" 
                          onClick={() => toggleCategory(classification.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                          {classification.displayName}
                          <span className="attribute-count">
                            {classification.attributes?.filter(attr => attr.value || attr.attributeValue).length || 0} items
                          </span>
                        </h3>
                        {isExpanded && (
                          <table className="spec-table">
                            <tbody>
                              {classification.attributes && classification.attributes
                                .filter(attr => attr.value || attr.attributeValue)
                                .map(attr => (
                                  <tr key={attr.id}>
                                    <td><strong>{attr.displayName || attr.name}</strong></td>
                                    <td>
                                      {attr.value || attr.attributeValue}
                                      {attr.unit && <span className="spec-unit"> {attr.unit}</span>}
                                    </td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })}
                
                  
                  {/* Show basic info if not in classifications */}
                  {(product.specifications.Brand || product.specifications.Model || product.specifications.Origin) && (() => {
                    const isExpanded = expandedCategories['product-info'] !== false;
                    return (
                      <div className={`spec-category ${isExpanded ? 'expanded' : 'collapsed'}`}>
                        <h3 
                          className="spec-category-title" 
                          onClick={() => toggleCategory('product-info')}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                          Product Information
                        </h3>
                        {isExpanded && (
                          <table className="spec-table">
                        <tbody>
                          {product.specifications.Brand && product.specifications.Brand !== 'N/A' && (
                            <tr>
                              <td><strong>Brand</strong></td>
                              <td>{product.specifications.Brand}</td>
                            </tr>
                          )}
                          {product.specifications.Model && product.specifications.Model !== 'N/A' && (
                            <tr>
                              <td><strong>Model</strong></td>
                              <td>{product.specifications.Model}</td>
                            </tr>
                          )}
                          {product.specifications.Unit && (
                            <tr>
                              <td><strong>Unit</strong></td>
                              <td>{product.specifications.Unit}</td>
                            </tr>
                          )}
                          {product.specifications.Origin && product.specifications.Origin !== 'N/A' && (
                            <tr>
                              <td><strong>Origin</strong></td>
                              <td>{product.specifications.Origin}</td>
                            </tr>
                          )}
                        </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })()}
                </>
              ) : (
                /* Fallback: show all specifications in single table */
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
              )}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div 
              role="tabpanel" 
              id="compliance-panel" 
              aria-labelledby="compliance-tab"
              className="compliance-tab"
            >
              <div className="compliance-section">
                <h3>🇮🇳 Country of Origin</h3>
                <p className="compliance-value">{product.countryOfOrigin || product.origin || 'Not specified'}</p>
              </div>

              {product.hsnCode && (
                <div className="compliance-section">
                  <h3>📋 HSN Code</h3>
                  <p className="compliance-value">{product.hsnCode}</p>
                </div>
              )}

              {product.gstRate && (
                <div className="compliance-section">
                  <h3>💰 GST Rate</h3>
                  <p className="compliance-value">{product.gstRate}%</p>
                </div>
              )}

              {product.mrp && (
                <div className="compliance-section">
                  <h3>🏷️ MRP</h3>
                  <p className="compliance-value">₹{product.mrp?.toLocaleString('en-IN')}</p>
                </div>
              )}

              {(product.manufacturingDate || product.expiryDate) && (
                <div className="compliance-section">
                  <h3>📅 Date Information</h3>
                  {product.manufacturingDate && (
                    <p><strong>Manufacturing Date:</strong> {product.manufacturingDate}</p>
                  )}
                  {product.expiryDate && (
                    <p><strong>Best Before / Expiry:</strong> {product.expiryDate}</p>
                  )}
                </div>
              )}

              {product.netQuantity && (
                <div className="compliance-section">
                  <h3>⚖️ Net Quantity</h3>
                  <p className="compliance-value">{product.netQuantity}</p>
                </div>
              )}

              {(product.weightKg || product.lengthCm) && (
                <div className="compliance-section">
                  <h3>📦 Package Dimensions</h3>
                  {product.weightKg && <p><strong>Weight:</strong> {product.weightKg} kg</p>}
                  {product.lengthCm && (
                    <p><strong>Dimensions (L×W×H):</strong> {product.lengthCm} × {product.widthCm} × {product.heightCm} cm</p>
                  )}
                </div>
              )}

              {product.warrantyMonths && (
                <div className="compliance-section">
                  <h3>🛡️ Warranty</h3>
                  <p className="compliance-value">{product.warrantyMonths} months</p>
                  {product.warrantyTerms && <p className="warranty-terms">{product.warrantyTerms}</p>}
                </div>
              )}

              {product.manufacturerName && (
                <div className="compliance-section">
                  <h3>🏭 Manufacturer Details</h3>
                  <p><strong>Name:</strong> {product.manufacturerName}</p>
                  {product.manufacturerAddress && <p><strong>Address:</strong> {product.manufacturerAddress}</p>}
                </div>
              )}

              {product.importerName && (
                <div className="compliance-section">
                  <h3>📥 Importer Details</h3>
                  <p><strong>Name:</strong> {product.importerName}</p>
                  {product.importerAddress && <p><strong>Address:</strong> {product.importerAddress}</p>}
                </div>
              )}

              <div className="compliance-notice">
                <p>ℹ️ Product information displayed as per <strong>Consumer Protection (E-Commerce) Rules, 2020</strong> and <strong>Legal Metrology Act</strong>.</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div 
              role="tabpanel" 
              id="reviews-panel" 
              aria-labelledby="reviews-tab"
              className="reviews-tab"
            >
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

      {/* Request Quote Modal */}
      <RequestQuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        products={product ? [{
          id: product.id,
          name: product.name,
          image: product.images?.[0],
          price: product.price,
          quantity: quantity,
          moq: product.moq,
          unit: 'piece'
        }] : []}
        supplierId={product?.supplier?.id}
        supplierName={product?.supplier?.name}
        isFromCart={false}
      />
    </div>
  )
}

export default ProductDetails
