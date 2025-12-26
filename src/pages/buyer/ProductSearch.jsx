import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import FilterPanel from '../../components/FilterPanel'
import { productAPI } from '../../services/api'
import '../../styles/ProductSearch.css'

function ProductSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    priceRange: { min: 0, max: 10000 },
    moq: { min: 0, max: 1000 },
    rating: 0,
    certifications: [],
    location: ''
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
        if (keyword) {
          // Search with keyword
          const params = { keyword }
          if (categoryId) params.categoryId = categoryId
          result = await productAPI.search(params)
        } else if (categoryId) {
          // Filter by category only
          result = await productAPI.getByCategory(categoryId)
        } else if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
          // Filter by price range
          result = await productAPI.getPriceRange(filters.priceRange.min, filters.priceRange.max)
        } else {
          // Get all products
          result = await productAPI.getAll()
        }

        console.log('API result:', result)

        if (result.success && result.data) {
          // Handle both { success, data } and { success, data: { data } } formats
          const productsData = result.data.data || result.data
          let mappedProducts = Array.isArray(productsData) ? productsData.map(p => ({
            id: p.id,
            name: p.name,
            price: p.unitPrice || p.price,
            moq: p.moq || 10,
            rating: p.averageRating || p.rating || 0,
            reviews: p.reviewCount || p.reviews || 0,
            image: p.images?.[0]?.imageUrl || p.imageUrl || '/images/placeholder.jpg',
            supplier: p.supplierName || 'Supplier',
            supplierId: p.supplierId,
            location: p.origin || 'N/A'
          })) : []
          
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
                    <ProductCard key={product.id} product={product} showDetails />
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
    </div>
  )
}

export default ProductSearch
