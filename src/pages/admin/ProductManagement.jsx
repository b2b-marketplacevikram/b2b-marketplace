import { useState, useEffect } from 'react'
import { productAPI } from '../../services/api'
import '../../styles/ProductManagement.css'

function ProductManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getAll()
      setProducts(Array.isArray(response.data) ? response.data : [])
      setError(null)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await productAPI.updateStatus(productId, newStatus)
      setProducts(products.map(p => 
        p.id === productId ? { ...p, status: newStatus } : p
      ))
    } catch (err) {
      console.error('Error updating product status:', err)
      alert('Failed to update product status')
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await productAPI.delete(productId)
      setProducts(products.filter(p => p.id !== productId))
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('Failed to delete product')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="admin-product-management-page">
        <div className="loading">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="admin-product-management-page">
      <div className="container">
        <div className="page-header">
          <h1>Product Management</h1>
          <p>Manage all products across the platform</p>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="10" className="no-data">No products found</td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="product-thumb" />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </td>
                    <td className="product-name">{product.name}</td>
                    <td>{product.sku || 'N/A'}</td>
                    <td>{product.category || 'N/A'}</td>
                    <td>{product.supplierName || `Supplier #${product.supplierId}`}</td>
                    <td>${product.price?.toFixed(2)}</td>
                    <td>{product.stockQuantity || 0}</td>
                    <td>
                      <select
                        value={product.status || 'ACTIVE'}
                        onChange={(e) => handleStatusChange(product.id, e.target.value)}
                        className={`status-badge status-${(product.status || 'ACTIVE').toLowerCase()}`}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view"
                          onClick={() => window.open(`/product/${product.id}`, '_blank')}
                        >
                          View
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="products-summary">
          <p>Showing {filteredProducts.length} of {products.length} products</p>
        </div>
      </div>
    </div>
  )
}

export default ProductManagement
