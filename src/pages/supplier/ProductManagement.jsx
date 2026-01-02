import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { productAPI, supplierAPI, categoryAPI } from '../../services/api'
import '../../styles/ProductManagement.css'

function ProductManagement() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [supplierId, setSupplierId] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'add')
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)
  
  // Category management
  const [categories, setCategories] = useState([])
  const [parentCategories, setParentCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [selectedParentId, setSelectedParentId] = useState('')
  const [showNewSubcategoryInput, setShowNewSubcategoryInput] = useState(false)
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [creatingSubcategory, setCreatingSubcategory] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    unitPrice: '',
    moq: '',
    stockQuantity: '',
    description: '',
    specifications: '',
    brand: '',
    model: '',
    origin: '',
    unit: 'piece',
    leadTimeDays: '',
    imageUrls: []
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await categoryAPI.getAll()
      if (result.success && result.data) {
        const allCategories = result.data.data || result.data || []
        setCategories(allCategories)
        
        // Separate parent categories (no parent_id) and subcategories
        const parents = allCategories.filter(c => !c.parentId && !c.parent_id)
        setParentCategories(parents)
      }
    }
    fetchCategories()
  }, [])

  // Update subcategories when parent changes
  useEffect(() => {
    if (selectedParentId) {
      const subs = categories.filter(c => 
        (c.parentId === parseInt(selectedParentId)) || 
        (c.parent_id === parseInt(selectedParentId))
      )
      setSubcategories(subs)
    } else {
      setSubcategories([])
    }
  }, [selectedParentId, categories])

  const handleParentCategoryChange = (e) => {
    const parentId = e.target.value
    setSelectedParentId(parentId)
    setFormData({ ...formData, categoryId: parentId }) // Default to parent if no subcategory
    setShowNewSubcategoryInput(false)
    setNewSubcategoryName('')
  }

  const handleSubcategoryChange = (e) => {
    const value = e.target.value
    if (value === 'new') {
      setShowNewSubcategoryInput(true)
    } else {
      setShowNewSubcategoryInput(false)
      setFormData({ ...formData, categoryId: value || selectedParentId })
    }
  }

  const handleCreateSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedParentId) return
    
    setCreatingSubcategory(true)
    try {
      const result = await categoryAPI.create({
        name: newSubcategoryName.trim(),
        parentId: parseInt(selectedParentId),
        slug: newSubcategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
        isActive: true
      })
      
      if (result.success && result.data) {
        const newCat = result.data.data || result.data
        // Add to categories list
        setCategories([...categories, newCat])
        // Select the new subcategory
        setFormData({ ...formData, categoryId: newCat.id.toString() })
        setShowNewSubcategoryInput(false)
        setNewSubcategoryName('')
        toast.success('Subcategory created successfully!', '📁')
      } else {
        toast.error(result.message || 'Failed to create subcategory', '❌')
      }
    } catch (error) {
      toast.error('Error creating subcategory: ' + error.message, '❌')
    }
    setCreatingSubcategory(false)
  }

  useEffect(() => {
    const fetchSupplierAndProducts = async () => {
      if (!user?.id) return
      
      setLoading(true)
      
      // First, get the supplier ID for this user
      const supplierResult = await supplierAPI.getByUserId ? 
        await supplierAPI.getByUserId(user.id) : 
        { success: false }
      
      if (supplierResult.success && supplierResult.data) {
        const sid = supplierResult.data.id
        setSupplierId(sid)
        
        // Then fetch products for this supplier
        const result = await productAPI.getBySupplier(sid)
        
        if (result.success && result.data?.data) {
          const mappedProducts = result.data.data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.categoryName || 'Uncategorized',
            price: p.unitPrice,
            moq: p.moq,
            stock: p.stockQuantity,
            status: p.isActive ? 'active' : 'inactive',
            sales: p.reviewCount || 0,
            views: 0 // API doesn't provide views yet
          }))
          setProducts(mappedProducts)
        }
      }
      
      setLoading(false)
    }

    fetchSupplierAndProducts()
  }, [user])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!supplierId) {
      toast.error('Supplier ID not found. Please try refreshing the page.', '⚠️')
      return
    }
    
    const productData = {
      supplierId: supplierId,
      categoryId: parseInt(formData.categoryId) || 1,
      name: formData.name,
      description: formData.description,
      unitPrice: parseFloat(formData.unitPrice),
      unit: formData.unit,
      moq: parseInt(formData.moq),
      stockQuantity: parseInt(formData.stockQuantity),
      leadTimeDays: parseInt(formData.leadTimeDays) || 7,
      origin: formData.origin,
      brand: formData.brand,
      model: formData.model,
      specifications: formData.specifications,
      isActive: true,
      isFeatured: false,
      imageUrls: formData.imageUrls.filter(url => url.trim())
    }

    if (editingProduct) {
      // Update existing product
      const result = await productAPI.update(editingProduct.id, productData)
      if (result.success) {
        toast.success('Product updated successfully!', '✅')
        // Refresh product list
        const refreshResult = await productAPI.getBySupplier(supplierId)
        if (refreshResult.success && refreshResult.data?.data) {
          setProducts(refreshResult.data.data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.categoryName || 'Uncategorized',
            price: p.unitPrice,
            moq: p.moq,
            stock: p.stockQuantity,
            status: p.isActive ? 'active' : 'inactive',
            sales: p.reviewCount || 0,
            views: 0
          })))
        }
      } else {
        toast.error(result.message || 'Failed to update product', '❌')
      }
    } else {
      // Add new product
      const result = await productAPI.create(productData)
      if (result.success) {
        toast.success('Product added successfully!', '🎉')
        // Refresh product list
        const refreshResult = await productAPI.getBySupplier(supplierId)
        if (refreshResult.success && refreshResult.data?.data) {
          setProducts(refreshResult.data.data.map(p => ({
            id: p.id,
            name: p.name,
            category: p.categoryName || 'Uncategorized',
            price: p.unitPrice,
            moq: p.moq,
            stock: p.stockQuantity,
            status: p.isActive ? 'active' : 'inactive',
            sales: p.reviewCount || 0,
            views: 0
          })))
        }
      } else {
        toast.error(result.message || 'Failed to create product', '❌')
      }
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      unitPrice: '',
      moq: '',
      stockQuantity: '',
      description: '',
      specifications: '',
      brand: '',
      model: '',
      origin: '',
      unit: 'piece',
      leadTimeDays: '',
      imageUrls: []
    })
    setSelectedParentId('')
    setShowNewSubcategoryInput(false)
    setNewSubcategoryName('')
    setEditingProduct(null)
    setShowForm(false)
  }

  const handleEdit = async (product) => {
    // Fetch full product details
    const result = await productAPI.getById(product.id)
    if (result.success && result.data?.data) {
      const p = result.data.data
      
      // Find the category and its parent
      const productCategory = categories.find(c => c.id === p.categoryId)
      let parentId = ''
      
      if (productCategory) {
        if (productCategory.parentId || productCategory.parent_id) {
          // This is a subcategory, get its parent
          parentId = (productCategory.parentId || productCategory.parent_id).toString()
        } else {
          // This is a parent category
          parentId = productCategory.id.toString()
        }
      }
      
      setSelectedParentId(parentId)
      setEditingProduct(product)
      setFormData({
        name: p.name,
        categoryId: p.categoryId?.toString() || '',
        unitPrice: p.unitPrice,
        moq: p.moq,
        stockQuantity: p.stockQuantity,
        description: p.description || '',
        specifications: p.specifications || '',
        brand: p.brand || '',
        model: p.model || '',
        origin: p.origin || '',
        unit: p.unit || 'piece',
        leadTimeDays: p.leadTimeDays || '',
        imageUrls: p.images?.map(img => img.imageUrl) || []
      })
      setShowForm(true)
    }
  }

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await productAPI.delete(productId)
      if (result.success) {
        setProducts(products.filter(p => p.id !== productId))
        toast.success('Product deleted successfully!', '🗑️')
      } else {
        toast.error(result.message || 'Failed to delete product', '❌')
      }
    }
  }

  const handleToggleStatus = async (productId) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    const result = await productAPI.getById(productId)
    if (result.success && result.data?.data) {
      const p = result.data.data
      const updateResult = await productAPI.update(productId, {
        ...p,
        isActive: !p.isActive
      })
      
      if (updateResult.success) {
        setProducts(products.map(p => 
          p.id === productId 
            ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
            : p
        ))
      }
    }
  }

  return (
    <div className="product-management-page">
      <div className="management-header">
        <h1>Product Management</h1>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'View Products' : '+ Add New Product'}
        </button>
      </div>

      {showForm ? (
        <div className="product-form-container">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  name="parentCategory"
                  value={selectedParentId}
                  onChange={handleParentCategoryChange}
                  required
                >
                  <option value="">Select Category</option>
                  {parentCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcategory Selection */}
            {selectedParentId && (
              <div className="form-row">
                <div className="form-group full-width">
                  <label>Subcategory</label>
                  <div className="subcategory-selection">
                    <select
                      name="subcategory"
                      value={showNewSubcategoryInput ? 'new' : formData.categoryId}
                      onChange={handleSubcategoryChange}
                    >
                      <option value="">-- Use Parent Category --</option>
                      {subcategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                      <option value="new">+ Create New Subcategory</option>
                    </select>
                    
                    {showNewSubcategoryInput && (
                      <div className="new-subcategory-input">
                        <input
                          type="text"
                          placeholder="Enter new subcategory name..."
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-create-subcategory"
                          onClick={handleCreateSubcategory}
                          disabled={creatingSubcategory || !newSubcategoryName.trim()}
                        >
                          {creatingSubcategory ? 'Creating...' : 'Create'}
                        </button>
                        <button
                          type="button"
                          className="btn-cancel-subcategory"
                          onClick={() => {
                            setShowNewSubcategoryInput(false)
                            setNewSubcategoryName('')
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  {subcategories.length === 0 && !showNewSubcategoryInput && (
                    <p className="subcategory-hint">
                      No subcategories exist for this category. 
                      <button 
                        type="button" 
                        className="link-button"
                        onClick={() => setShowNewSubcategoryInput(true)}
                      >
                        Create one?
                      </button>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Price (USD) *</label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Minimum Order Quantity (MOQ) *</label>
                <input
                  type="number"
                  name="moq"
                  value={formData.moq}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Provide a detailed description of your product..."
              ></textarea>
            </div>

            <div className="form-group">
              <label>Specifications</label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                rows="4"
                placeholder="Enter product specifications (one per line)..."
              ></textarea>
            </div>

            <div className="form-group">
              <label>Product Images</label>
              <div className="image-urls-container">
                {/* Image Previews */}
                <div className="image-previews-grid">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="image-preview-card">
                      <img 
                        src={url} 
                        alt={`Product ${index + 1}`} 
                        className="image-preview-thumb"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=Error'
                        }}
                      />
                      {index === 0 && <span className="primary-badge">Primary</span>}
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={() => {
                          const newUrls = formData.imageUrls.filter((_, i) => i !== index)
                          setFormData({ ...formData, imageUrls: newUrls })
                        }}
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Upload Options */}
                {formData.imageUrls.length < 5 && (
                  <div className="image-upload-options">
                    {/* File Upload */}
                    <div className="upload-section">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files)
                          if (files.length === 0) return
                          
                          const remainingSlots = 5 - formData.imageUrls.length
                          const filesToProcess = files.slice(0, remainingSlots)
                          
                          setUploadingImage(true)
                          
                          try {
                            const newUrls = []
                            for (const file of filesToProcess) {
                              // Convert to base64 for local storage
                              const base64 = await new Promise((resolve) => {
                                const reader = new FileReader()
                                reader.onloadend = () => resolve(reader.result)
                                reader.readAsDataURL(file)
                              })
                              newUrls.push(base64)
                            }
                            
                            setFormData(prev => ({
                              ...prev,
                              imageUrls: [...prev.imageUrls, ...newUrls]
                            }))
                          } catch (error) {
                            console.error('Error processing images:', error)
                            toast.error('Failed to process some images', '🖼️')
                          } finally {
                            setUploadingImage(false)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-upload-image"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <>⏳ Uploading...</>
                        ) : (
                          <>📤 Upload from Computer</>
                        )}
                      </button>
                    </div>

                    <div className="upload-divider">
                      <span>or</span>
                    </div>

                    {/* URL Input */}
                    <div className="url-input-section">
                      <input
                        type="text"
                        placeholder="Paste image URL here..."
                        className="url-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const url = e.target.value.trim()
                            if (url && formData.imageUrls.length < 5) {
                              setFormData(prev => ({
                                ...prev,
                                imageUrls: [...prev.imageUrls, url]
                              }))
                              e.target.value = ''
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-add-url"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling
                          const url = input.value.trim()
                          if (url && formData.imageUrls.length < 5) {
                            setFormData(prev => ({
                              ...prev,
                              imageUrls: [...prev.imageUrls, url]
                            }))
                            input.value = ''
                          }
                        }}
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="upload-hint">
                  📷 Add up to 5 images. First image will be the primary image displayed in listings.
                  {formData.imageUrls.length > 0 && ` (${formData.imageUrls.length}/5 added)`}
                </p>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="products-table-container">
          <div className="table-controls">
            <input
              type="search"
              placeholder="Search products..."
              className="search-input"
            />
            <select className="filter-select">
              <option value="all">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>MOQ</th>
                  <th>Stock</th>
                  <th>Sales</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>
                      <strong 
                        style={{ cursor: 'pointer', color: '#ff6b35' }}
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.name}
                      </strong>
                    </td>
                    <td>{product.category}</td>
                    <td>${product.price?.toFixed(2) || '0.00'}</td>
                    <td>{product.moq}</td>
                    <td className={product.stock === 0 ? 'text-danger' : ''}>
                      {product.stock}
                    </td>
                    <td>{product.sales}</td>
                    <td>{product.views}</td>
                    <td>
                      <span className={`status-badge status-${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(product)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn toggle"
                        onClick={() => handleToggleStatus(product.id)}
                        title={product.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {product.status === 'active' ? '👁️' : '🚫'}
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(product.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-summary">
            <p>Showing {products.length} products</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManagement
