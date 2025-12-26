import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { bundleAPI, productAPI, supplierAPI } from '../../services/api'
import '../../styles/BundleManagement.css'

function BundleManagement() {
  const { user } = useAuth()
  const [bundles, setBundles] = useState([])
  const [products, setProducts] = useState([])
  const [supplierId, setSupplierId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBundle, setEditingBundle] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercentage: '',
    minOrderQuantity: 1,
    imageUrl: '',
    items: []
  })
  const [selectedProducts, setSelectedProducts] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return
      setLoading(true)

      // Get supplier ID
      const supplierResult = await supplierAPI.getByUserId?.(user.id)
      if (supplierResult?.success && supplierResult.data) {
        const sid = supplierResult.data.id
        setSupplierId(sid)

        // Fetch supplier's bundles
        const bundlesResult = await bundleAPI.getBySupplier(sid)
        if (bundlesResult.success && bundlesResult.data?.data) {
          setBundles(bundlesResult.data.data)
        }

        // Fetch supplier's products for bundle creation
        const productsResult = await productAPI.getBySupplier(sid)
        if (productsResult.success && productsResult.data?.data) {
          setProducts(productsResult.data.data)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProductSelect = (productId, quantity = 1) => {
    const product = products.find(p => p.id === parseInt(productId))
    if (!product) return

    const existingIndex = selectedProducts.findIndex(p => p.productId === product.id)
    
    if (existingIndex >= 0) {
      // Update quantity
      const updated = [...selectedProducts]
      updated[existingIndex].quantity = quantity
      setSelectedProducts(updated)
    } else {
      // Add new product
      setSelectedProducts(prev => [...prev, {
        productId: product.id,
        productName: product.name,
        unitPrice: product.unitPrice,
        quantity: quantity
      }])
    }
  }

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.productId !== productId))
  }

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(prev => prev.map(p => 
      p.productId === productId ? { ...p, quantity: parseInt(quantity) || 1 } : p
    ))
  }

  const calculateTotals = () => {
    const originalPrice = selectedProducts.reduce(
      (sum, p) => sum + (p.unitPrice * p.quantity), 0
    )
    const discount = parseFloat(formData.discountPercentage) || 0
    const bundlePrice = originalPrice * (1 - discount / 100)
    const savings = originalPrice - bundlePrice
    return { originalPrice, bundlePrice, savings }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!supplierId) {
      alert('Supplier ID not found')
      return
    }

    if (selectedProducts.length < 2) {
      alert('Please select at least 2 products for a bundle')
      return
    }

    const bundleData = {
      supplierId,
      name: formData.name,
      description: formData.description,
      discountPercentage: parseFloat(formData.discountPercentage) || 0,
      minOrderQuantity: parseInt(formData.minOrderQuantity) || 1,
      imageUrl: formData.imageUrl,
      isActive: true,
      isFeatured: false,
      items: selectedProducts.map(p => ({
        productId: p.productId,
        quantity: p.quantity
      }))
    }

    try {
      let result
      if (editingBundle) {
        result = await bundleAPI.update(editingBundle.id, bundleData)
      } else {
        result = await bundleAPI.create(bundleData)
      }

      if (result.success) {
        alert(editingBundle ? 'Bundle updated!' : 'Bundle created!')
        resetForm()
        // Refresh bundles
        const bundlesResult = await bundleAPI.getBySupplier(supplierId)
        if (bundlesResult.success && bundlesResult.data?.data) {
          setBundles(bundlesResult.data.data)
        }
      } else {
        alert(result.message || 'Failed to save bundle')
      }
    } catch (error) {
      console.error('Error saving bundle:', error)
      alert('Failed to save bundle')
    }
  }

  const handleEdit = (bundle) => {
    setEditingBundle(bundle)
    setFormData({
      name: bundle.name,
      description: bundle.description || '',
      discountPercentage: bundle.discountPercentage || '',
      minOrderQuantity: bundle.minOrderQuantity || 1,
      imageUrl: bundle.imageUrl || ''
    })
    setSelectedProducts(bundle.items?.map(item => ({
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity
    })) || [])
    setShowForm(true)
  }

  const handleDelete = async (bundleId) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return

    const result = await bundleAPI.delete(bundleId)
    if (result.success) {
      setBundles(prev => prev.filter(b => b.id !== bundleId))
      alert('Bundle deleted!')
    } else {
      alert(result.message || 'Failed to delete bundle')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountPercentage: '',
      minOrderQuantity: 1,
      imageUrl: ''
    })
    setSelectedProducts([])
    setEditingBundle(null)
    setShowForm(false)
  }

  const totals = calculateTotals()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="bundle-management-page">
      <div className="page-header">
        <h1>Bundle Management</h1>
        <button className="create-bundle-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Bundle'}
        </button>
      </div>

      {showForm && (
        <div className="bundle-form-container">
          <h2>{editingBundle ? 'Edit Bundle' : 'Create New Bundle'}</h2>
          
          <form onSubmit={handleSubmit} className="bundle-form">
            <div className="form-section">
              <h3>Bundle Information</h3>
              
              <div className="form-group">
                <label>Bundle Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Starter Electronics Kit"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what's included in this bundle..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Percentage (%)</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    placeholder="e.g., 15"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Order Quantity</label>
                  <input
                    type="number"
                    name="minOrderQuantity"
                    value={formData.minOrderQuantity}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bundle Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Select Products</h3>
              
              <div className="product-selector">
                <select onChange={(e) => handleProductSelect(e.target.value)} value="">
                  <option value="">-- Add a product --</option>
                  {products
                    .filter(p => !selectedProducts.find(sp => sp.productId === p.id))
                    .map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.unitPrice}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="selected-products">
                {selectedProducts.length === 0 ? (
                  <p className="no-products">No products selected. Add at least 2 products to create a bundle.</p>
                ) : (
                  selectedProducts.map(product => (
                    <div key={product.productId} className="selected-product-item">
                      <div className="product-info">
                        <span className="product-name">{product.productName}</span>
                        <span className="product-price">${product.unitPrice} each</span>
                      </div>
                      <div className="product-quantity">
                        <label>Qty:</label>
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(product.productId, e.target.value)}
                          min="1"
                        />
                      </div>
                      <div className="product-subtotal">
                        ${(product.unitPrice * product.quantity).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        className="remove-product-btn"
                        onClick={() => handleRemoveProduct(product.productId)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              {selectedProducts.length >= 2 && (
                <div className="price-summary">
                  <div className="summary-row">
                    <span>Original Price:</span>
                    <span>${totals.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-row discount">
                    <span>Discount ({formData.discountPercentage || 0}%):</span>
                    <span>-${totals.savings.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Bundle Price:</span>
                    <span>${totals.bundlePrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={selectedProducts.length < 2}>
                {editingBundle ? 'Update Bundle' : 'Create Bundle'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bundles-list">
        <h2>Your Bundles ({bundles.length})</h2>
        
        {bundles.length === 0 ? (
          <div className="no-bundles">
            <p>You haven't created any bundles yet.</p>
            <button onClick={() => setShowForm(true)}>Create Your First Bundle</button>
          </div>
        ) : (
          <div className="bundles-table">
            <table>
              <thead>
                <tr>
                  <th>Bundle Name</th>
                  <th>Products</th>
                  <th>Original Price</th>
                  <th>Bundle Price</th>
                  <th>Discount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bundles.map(bundle => (
                  <tr key={bundle.id}>
                    <td>
                      <strong>{bundle.name}</strong>
                      <br />
                      <small>{bundle.description?.substring(0, 50)}...</small>
                    </td>
                    <td>{bundle.totalItems} items</td>
                    <td>${bundle.originalPrice?.toFixed(2)}</td>
                    <td className="bundle-price">${bundle.bundlePrice?.toFixed(2)}</td>
                    <td>{bundle.discountPercentage}%</td>
                    <td>
                      <span className={`status ${bundle.isActive ? 'active' : 'inactive'}`}>
                        {bundle.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="edit-btn" onClick={() => handleEdit(bundle)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(bundle.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default BundleManagement
