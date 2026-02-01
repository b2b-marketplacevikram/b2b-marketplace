import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import { categoryAPI, searchAPI, productAPI } from '../../services/api'
import '../../styles/CategoryProducts.css'

function CategoryProducts() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [breadcrumbs, setBreadcrumbs] = useState([])

  useEffect(() => {
    fetchCategoryAndProducts()
  }, [categoryId])

  const fetchCategoryAndProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch category details
      const categoryResult = await categoryAPI.getById(categoryId)
      if (categoryResult.success && categoryResult.data?.data) {
        const cat = categoryResult.data.data
        setCategory(cat)
        
        // Build breadcrumbs
        await buildBreadcrumbs(cat)
        
        // Fetch products using Solr search
        await fetchProducts(cat.id)
      } else {
        setError('Category not found')
      }
    } catch (err) {
      console.error('Error fetching category:', err)
      setError('Failed to load category information')
    }
  }

  const buildBreadcrumbs = async (cat) => {
    const crumbs = [{ id: cat.id, name: cat.name }]
    let currentCat = cat
    
    // Traverse up the category hierarchy
    while (currentCat.parentId) {
      try {
        const parentResult = await categoryAPI.getById(currentCat.parentId)
        if (parentResult.success && parentResult.data?.data) {
          const parent = parentResult.data.data
          crumbs.unshift({ id: parent.id, name: parent.name })
          currentCat = parent
        } else {
          break
        }
      } catch (err) {
        console.error('Error fetching parent category:', err)
        break
      }
    }
    
    setBreadcrumbs(crumbs)
  }

  const fetchProducts = async (catId) => {
    try {
      // Try Solr search first
      const searchResult = await searchAPI.advancedSearch({
        categoryId: catId,
        page: 0,
        size: 50
      })
      
      if (searchResult.success && searchResult.data?.data?.products) {
        const solrProducts = searchResult.data.data.products.map(p => ({
          id: p.id,
          name: p.name || p.productName,
          price: p.price || p.unitPrice,
          moq: p.moq || p.minimumOrderQuantity || 1,
          image: p.imageUrl || p.images?.[0]?.imageUrl || '/images/placeholder.jpg',
          supplier: p.supplierName || 'Supplier',
          rating: p.rating || 0,
          reviews: p.reviewCount || 0
        }))
        setProducts(solrProducts)
      } else {
        // Fallback to regular product API
        await fetchProductsFromProductService(catId)
      }
    } catch (err) {
      console.error('Error fetching products from Solr:', err)
      // Fallback to regular product API
      await fetchProductsFromProductService(catId)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductsFromProductService = async (catId) => {
    try {
      const result = await productAPI.getByCategory(catId)
      
      if (result.success && result.data?.data) {
        const regularProducts = result.data.data.map(p => ({
          id: p.id,
          name: p.name,
          price: p.unitPrice,
          moq: p.moq || 1,
          image: p.images?.[0]?.imageUrl || '/images/placeholder.jpg',
          supplier: p.supplierName || 'Supplier',
          rating: p.rating || 0,
          reviews: p.reviewsCount || 0
        }))
        setProducts(regularProducts)
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error('Error fetching products from product service:', err)
      setProducts([])
    }
  }

  const handleBreadcrumbClick = (crumbId, index) => {
    if (index === breadcrumbs.length - 1) {
      // Current category, do nothing
      return
    }
    // Navigate back to that category level
    navigate(`/category-products/${crumbId}`)
  }

  if (loading) {
    return (
      <div className="category-products-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="category-products-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="category-products-page">
      <div className="container">
        {/* Breadcrumb navigation */}
        <nav className="breadcrumb-nav">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            Home
          </button>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id}>
              <span className="breadcrumb-separator"> / </span>
              {index === breadcrumbs.length - 1 ? (
                <span className="breadcrumb-current">{crumb.name}</span>
              ) : (
                <button 
                  onClick={() => handleBreadcrumbClick(crumb.id, index)}
                  className="breadcrumb-link"
                >
                  {crumb.name}
                </button>
              )}
            </span>
          ))}
        </nav>

        {/* Category header */}
        <div className="category-header">
          {category?.imageUrl && (
            <div className="category-banner">
              <img src={category.imageUrl} alt={category.name} />
            </div>
          )}
          <div className="category-info">
            <h1>{category?.name}</h1>
            {category?.description && (
              <p className="category-description">{category.description}</p>
            )}
            <p className="products-count">{products.length} products found</p>
          </div>
        </div>

        {/* Products grid */}
        <div className="products-section">
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h3>No products found</h3>
              <p>There are currently no products in this category.</p>
              <button onClick={() => navigate('/')} className="btn-primary">
                Browse All Categories
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryProducts
