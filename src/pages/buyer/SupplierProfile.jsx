import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMessaging } from '../../context/MessagingContext'
import { supplierAPI } from '../../services/api'
import '../../styles/SupplierProfile.css'

const SupplierProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { startConversation, selectConversation } = useMessaging()
  const [supplier, setSupplier] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      try {
        setLoading(true)
        
        // Try to fetch supplier - first try by user ID, then by supplier ID
        let supplierResponse = await supplierAPI.getByUserId(id)
        
        // If not found by user ID, try by supplier ID
        if (!supplierResponse.success || !supplierResponse.data) {
          supplierResponse = await supplierAPI.getById(id)
        }
        
        if (supplierResponse.success && supplierResponse.data) {
          const supplierData = supplierResponse.data
          setSupplier(supplierData)
          setError(null)
          
          // Get the actual supplier ID for fetching products
          const supplierId = supplierData.id
          
          // Fetch supplier products
          const productsResponse = await supplierAPI.getProducts(supplierId)
          if (productsResponse.success && productsResponse.data) {
            const productsData = productsResponse.data.data || productsResponse.data
            const mappedProducts = Array.isArray(productsData) ? productsData.map(p => ({
              id: p.id,
              name: p.name,
              price: p.unitPrice || p.price,
              image: p.images?.[0]?.imageUrl || p.imageUrl || '/images/placeholder.jpg'
            })) : []
            setProducts(mappedProducts)
          }
        } else {
          setError('Failed to load supplier profile')
        }
      } catch (err) {
        console.error('Error fetching supplier:', err)
        setError('Failed to load supplier profile')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSupplierDetails()
    }
  }, [id])

  const handleContactSupplier = async () => {
    if (!user) {
      alert('Please login to contact supplier')
      navigate('/login')
      return
    }

    if (!id) {
      alert('Supplier information not available')
      return
    }

    try {
      // Start conversation with supplier
      const conversation = await startConversation(parseInt(id))
      
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
    return (
      <div className="supplier-profile">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading supplier profile...</p>
        </div>
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div className="supplier-profile">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error || 'Supplier not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="supplier-profile">
      <div className="profile-header">
        <div className="profile-banner">
          <img 
            src={supplier.bannerUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=300&fit=crop'} 
            alt={`${supplier.companyName || supplier.name} banner`}
            className="banner-image"
          />
        </div>
        <div className="profile-summary">
          <div className="supplier-avatar">
            <img 
              src={supplier.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(supplier.companyName || supplier.name || 'Supplier')}&size=160&background=667eea&color=fff&bold=true`} 
              alt={supplier.companyName || supplier.name}
            />
          </div>
          <div className="supplier-details">
            <h1>{supplier.companyName || supplier.name}</h1>
            <div className="rating">
              <span className="stars">{'★'.repeat(Math.floor(supplier.rating || 4.5))}{'☆'.repeat(5 - Math.floor(supplier.rating || 4.5))}</span>
              <span className="rating-text">{supplier.rating?.toFixed(1) || '4.5'} / 5.0</span>
            </div>
            <p className="description">{supplier.description}</p>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-value">{supplier.yearsInBusiness || '5+'}</span>
                <span className="stat-label">Years in Business</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{products.length || supplier.productCount || 0}</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{supplier.responseRate?.toFixed(1) || 95}%</span>
                <span className="stat-label">Response Rate</span>
              </div>
            </div>
            <button 
              className="contact-supplier-btn"
              onClick={handleContactSupplier}
              style={{
                marginTop: '20px',
                padding: '12px 32px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              💬 Contact Supplier
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
          <button 
            className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'products' && (
            <div className="products-section">
              <h2>Products</h2>
              <div className="products-grid">
                {products && products.length > 0 ? (
                  products.map(product => (
                    <div key={product.id} className="product-card">
                      <img src={product.image} alt={product.name} />
                      <h3>{product.name}</h3>
                      <p className="price">${product.price?.toFixed(2)}</p>
                      <button 
                        className="btn-primary"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No products available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="about-section">
              <h2>About {supplier.name}</h2>
              <div className="about-content">
                <div className="about-item">
                  <h3>Company Overview</h3>
                  <p>{supplier.about || supplier.description}</p>
                </div>
                <div className="about-item">
                  <h3>Certifications</h3>
                  <ul>
                    {supplier.certifications && supplier.certifications.length > 0 ? (
                      supplier.certifications.map((cert, index) => (
                        <li key={index}>{cert}</li>
                      ))
                    ) : (
                      <li>ISO 9001:2015</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <h2>Customer Reviews</h2>
              <div className="reviews-list">
                {supplier.reviews && supplier.reviews.length > 0 ? (
                  supplier.reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <span className="reviewer-name">{review.name}</span>
                        <span className="review-rating">★★★★★</span>
                      </div>
                      <p className="review-text">{review.text}</p>
                      <span className="review-date">{review.date}</span>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="contact-section">
              <h2>Contact Information</h2>
              <div className="supplier-info">
                <div className="contact-item">
                  <strong>Email:</strong>
                  <span>{supplier.contact?.email || supplier.email || 'N/A'}</span>
                </div>
                <div className="contact-item">
                  <strong>Phone:</strong>
                  <span>{supplier.contact?.phone || supplier.phone || 'N/A'}</span>
                </div>
                <div className="contact-item">
                  <strong>Address:</strong>
                  <span>{supplier.contact?.address || supplier.address || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupplierProfile
