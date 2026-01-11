import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import FilterPanel from '../../components/FilterPanel'
import RequestQuoteModal from '../../components/RequestQuoteModal'
import { productAPI, whatsappAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import '../../styles/ProductSearch.css'

function ProductSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)
  const { user, isSupplier } = useAuth()
  const notifiedSearches = useRef(new Set()) // Track notified searches to avoid duplicates
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subcategory: '',
    priceRange: { min: 0, max: 100000 },
    moq: { min: 0, max: 10000 },
    rating: 0,
    certifications: [],
    location: '',
    supplierType: ''
  })
  const [sortBy, setSortBy] = useState('relevance')

  // Sync filters.category when URL changes (e.g., from navigation menu)
  useEffect(() => {
    const urlCategory = searchParams.get('category') || ''
    if (urlCategory !== filters.category) {
      setFilters(prev => ({ ...prev, category: urlCategory }))
    }
  }, [searchParams])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const keyword = searchParams.get('q') || ''
        const category = searchParams.get('category') || filters.category
        const categoryId = category ? parseInt(category) : null

        console.log('Search params:', { keyword, categoryId, filters })

        let result
        // Always use Solr Search Service for better search capabilities
        const solrParams = {}
        if (keyword) solrParams.query = keyword
        if (categoryId) solrParams.categoryId = categoryId
        if (filters.priceRange.min > 0) solrParams.minPrice = filters.priceRange.min
        if (filters.priceRange.max < 100000) solrParams.maxPrice = filters.priceRange.max
        if (filters.moq.min > 0) solrParams.minMoq = filters.moq.min
        if (filters.moq.max < 10000) solrParams.maxMoq = filters.moq.max
        
        console.log('Calling Solr Search Service with params:', solrParams)
        result = await productAPI.searchProducts(solrParams)

        console.log('Solr API result:', result)

        if (result.success && result.data) {
          // Solr Search Service returns { results: [...], totalResults, page, ... }
          const productsData = result.data.results || result.data.data || result.data || []
          console.log('Solr products data:', productsData)
          
          let mappedProducts = Array.isArray(productsData) ? productsData.map(p => {
            console.log('Mapping Solr product:', p);
            
            // Handle imageUrl - if it's base64 data, ensure it has the proper prefix
            let imageUrl = p.imageUrl || (p.images && p.images[0] && p.images[0].imageUrl) || '/images/placeholder.jpg';
            
            // If it starts with "data:image", it's already a valid data URI
            // If it's raw base64, add the prefix
            if (imageUrl && imageUrl.length > 100 && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
              imageUrl = `data:image/png;base64,${imageUrl}`;
            }
            
            return {
              id: p.productId || p.id,
              name: p.name || 'Unknown Product',
              price: p.price || p.unitPrice || 0,
              moq: p.moq || 10,
              rating: p.rating || p.averageRating || 0,
              reviews: p.reviewCount || p.reviews || 0,
              image: imageUrl,
              supplier: p.supplierName || 'Unknown Supplier',
              supplierId: p.supplierId,
              supplierType: (p.supplierType || p.businessType || '').toLowerCase() || 'manufacturer',
              location: p.origin || 'N/A',
              category: p.categoryName || 'Other'
            };
          }) : []
          
          console.log('Mapped products from Solr:', mappedProducts)
          
          // If supplier is logged in, show only their products
          if (isSupplier && user?.id) {
            mappedProducts = mappedProducts.filter(p => p.supplierId === user.id)
          }

          // Apply client-side filters
          mappedProducts = mappedProducts.filter(p => {
            // Price filter
            if (p.price < filters.priceRange.min || p.price > filters.priceRange.max) {
              return false
            }
            // MOQ filter
            if (p.moq < filters.moq.min || p.moq > filters.moq.max) {
              return false
            }
            // Rating filter
            if (p.rating < filters.rating) {
              return false
            }
            // Location filter
            if (filters.location && !p.location.toLowerCase().includes(filters.location.toLowerCase())) {
              return false
            }
            // Supplier Type filter
            if (filters.supplierType && p.supplierType !== filters.supplierType.toLowerCase()) {
              return false
            }
            return true
          })

          // Apply sorting
          if (sortBy === 'price-low') {
            mappedProducts.sort((a, b) => a.price - b.price)
          } else if (sortBy === 'price-high') {
            mappedProducts.sort((a, b) => b.price - a.price)
          } else if (sortBy === 'rating') {
            mappedProducts.sort((a, b) => b.rating - a.rating)
          } else if (sortBy === 'moq') {
            mappedProducts.sort((a, b) => a.moq - b.moq)
          }
          
          console.log('Filtered and sorted products:', mappedProducts.length)
          setAllProducts(mappedProducts)
          setProducts(mappedProducts)
          setCurrentPage(1)

          // Send WhatsApp notification to suppliers (non-blocking)
          const searchQuery = searchParams.get('q')
          if (searchQuery && mappedProducts.length > 0 && !notifiedSearches.current.has(searchQuery)) {
            notifiedSearches.current.add(searchQuery) // Mark as notified
            notifySuppliers(searchQuery, mappedProducts)
          }
        } else {
          console.warn('No products found or API error')
          setAllProducts([])
          setProducts([])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams, filters, sortBy])

  // Send WhatsApp notifications to suppliers about product search
  const notifySuppliers = async (searchQuery, products) => {
    try {
      // Group products by supplier to get unique suppliers
      const supplierMap = new Map()
      products.forEach(product => {
        if (product.supplierId && !supplierMap.has(product.supplierId)) {
          supplierMap.set(product.supplierId, {
            id: product.supplierId,
            name: product.supplier || `Supplier ${product.supplierId}`,
            phone: product.supplierPhone || null, // Will be fetched from backend
            matchingProductCount: 1
          })
        } else if (product.supplierId) {
          const supplier = supplierMap.get(product.supplierId)
          supplier.matchingProductCount++
        }
      })

      const suppliers = Array.from(supplierMap.values())
      
      // Only notify if we have suppliers with products
      if (suppliers.length > 0) {
        console.log(`Ã°Å¸â€œÂ± Sending WhatsApp notifications to ${suppliers.length} suppliers for search: "${searchQuery}"`)
        
        // Non-blocking API call - don't wait for response
        whatsappAPI.notifyProductSearch(
          searchQuery,
          suppliers,
          user?.location || null,
          user?.id || null
        ).then(result => {
          if (result.success) {
            console.log('Ã¢Å“â€¦ Supplier notifications sent:', result.data)
          }
        }).catch(err => {
          // Silently fail - this is a non-critical feature
          console.log('WhatsApp notification skipped:', err.message)
        })
      }
    } catch (error) {
      // Silently fail - notifications should not affect search experience
      console.log('WhatsApp notification error (non-critical):', error.message)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setLoading(true)
    
    // Update URL params when category filter changes
    const newSearchParams = new URLSearchParams(searchParams)
    if (newFilters.category) {
      newSearchParams.set('category', newFilters.category)
    } else {
      newSearchParams.delete('category')
    }
    setSearchParams(newSearchParams, { replace: true })
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(allProducts.length / productsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  const handleRequestQuote = (product) => {
    if (!user) {
      navigate('/login')
      return
    }
    setSelectedProduct({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: product.moq || 100,
      moq: product.moq,
      unit: 'piece',
      supplierId: product.supplierId,
      supplier: product.supplier
    })
    setShowQuoteModal(true)
  }

  return (
    <div className="product-search-page">
      <div className="search-container">
        <aside className="filters-sidebar">
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        <div className="search-results">
          <div className="results-header">
            <div className="results-info">
              <h2>Search Results</h2>
              <p>{allProducts.length} products found {totalPages > 1 && `(Page ${currentPage} of ${totalPages})`}</p>
            </div>
            <div className="sort-controls">
              <label>Sort by:</label>
              <select value={sortBy} onChange={handleSortChange}>
                <option value="relevance">Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="moq">Minimum Order Quantity</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <>
              {currentProducts.length > 0 ? (
                <div className="products-grid">
                  {currentProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      showDetails 
                      onRequestQuote={handleRequestQuote}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-products">
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                </div>
              )}
            </>
          )}

          {!loading && totalPages > 1 && (
            <div className="pagination">
              <button 
                className="page-btn" 
                onClick={handlePrevious}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {getPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
              
              <button 
                className="page-btn" 
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Request Quote Modal */}
      <RequestQuoteModal
        isOpen={showQuoteModal}
        onClose={() => {
          setShowQuoteModal(false)
          setSelectedProduct(null)
        }}
        products={selectedProduct ? [selectedProduct] : []}
        supplierId={selectedProduct?.supplierId}
        supplierName={selectedProduct?.supplier}
        isFromCart={false}
      />
    </div>
  )
}

export default ProductSearch
