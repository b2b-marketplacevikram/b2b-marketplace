import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import CategoryBrowser from '../../components/CategoryBrowser'
import { productAPI } from '../../services/api'
import '../../styles/Home.css'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      try {
        // Fetch featured products
        const productsResult = await productAPI.getFeatured()
        if (productsResult.success && productsResult.data?.data) {
          const products = productsResult.data.data.slice(0, 4).map(p => ({
            id: p.id,
            name: p.name,
            price: p.unitPrice,
            moq: p.moq,
            image: p.images?.[0]?.imageUrl || '/images/placeholder.jpg',
            supplier: p.supplierName || 'Supplier'
          }))
          setFeaturedProducts(products)
        } else {
          // Fallback products while backend is starting
          setFeaturedProducts([
            { id: 1, name: 'Industrial LED Lights', price: 25.99, moq: 100, image: '/images/placeholder.jpg', supplier: 'TechSupply Co.' },
            { id: 2, name: 'LED Strip Lights', price: 15.50, moq: 50, image: '/images/placeholder.jpg', supplier: 'BrightLED Inc.' },
            { id: 3, name: 'LED Bulbs', price: 8.99, moq: 200, image: '/images/placeholder.jpg', supplier: 'LumenTech' },
            { id: 4, name: 'LED Panel Lights', price: 35.00, moq: 30, image: '/images/placeholder.jpg', supplier: 'ProLight Systems' }
          ])
        }

      } catch (error) {
        console.error('Error fetching data:', error)
        // Set fallback data on error
        setFeaturedProducts([
          { id: 1, name: 'Industrial LED Lights', price: 25.99, moq: 100, image: '/images/placeholder.jpg', supplier: 'TechSupply Co.' },
          { id: 2, name: 'LED Strip Lights', price: 15.50, moq: 50, image: '/images/placeholder.jpg', supplier: 'BrightLED Inc.' },
          { id: 3, name: 'LED Bulbs', price: 8.99, moq: 200, image: '/images/placeholder.jpg', supplier: 'LumenTech' },
          { id: 4, name: 'LED Panel Lights', price: 35.00, moq: 30, image: '/images/placeholder.jpg', supplier: 'ProLight Systems' }
        ])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>The Leading B2B Marketplace</h1>
          <p>Connect with millions of suppliers worldwide and grow your business</p>
          <div className="hero-stats">
            <div className="stat">
              <h3>10M+</h3>
              <p>Products</p>
            </div>
            <div className="stat">
              <h3>200K+</h3>
              <p>Suppliers</p>
            </div>
            <div className="stat">
              <h3>150+</h3>
              <p>Countries</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <CategoryBrowser />

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/search" className="view-all">View All →</Link>
        </div>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p>No featured products available</p>
            )}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="features-section">
        <h2>Why Choose Our Platform</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Verified Suppliers</h3>
            <p>All suppliers are thoroughly vetted and verified for quality assurance</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Competitive Pricing</h3>
            <p>Get the best bulk prices with transparent quotations</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Global Shipping</h3>
            <p>Reliable logistics partners for worldwide delivery</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Payments</h3>
            <p>Protected transactions with multiple payment options</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Selling?</h2>
          <p>Join thousands of suppliers reaching buyers worldwide</p>
          <Link to="/register?type=supplier" className="cta-button">Become a Supplier</Link>
        </div>
      </section>
    </div>
  )
}

export default Home
