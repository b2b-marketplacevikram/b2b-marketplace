import { useState, useEffect } from 'react'
import { categoryAPI } from '../services/api'
import '../styles/FilterPanel.css'

function FilterPanel({ filters, onFilterChange }) {
  const [parentCategories, setParentCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [selectedParentId, setSelectedParentId] = useState('')
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)

  // Fetch top-level (parent) categories on mount
  useEffect(() => {
    const fetchParentCategories = async () => {
      const result = await categoryAPI.getTopLevel()
      if (result.success && result.data) {
        const categoriesData = result.data.data || result.data
        setParentCategories(Array.isArray(categoriesData) ? categoriesData : [])
      }
    }
    fetchParentCategories()
  }, [])

  // Fetch subcategories when parent category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedParentId) {
        setLoadingSubcategories(true)
        const result = await categoryAPI.getSubcategories(selectedParentId)
        if (result.success && result.data) {
          const subData = result.data.data || result.data
          setSubcategories(Array.isArray(subData) ? subData : [])
        } else {
          setSubcategories([])
        }
        setLoadingSubcategories(false)
      } else {
        setSubcategories([])
      }
    }
    fetchSubcategories()
  }, [selectedParentId])

  const handleParentCategoryChange = (parentId) => {
    setSelectedParentId(parentId)
    // When parent changes, set the category filter to parent, clear subcategory
    onFilterChange({ ...filters, category: parentId, subcategory: '' })
  }

  const handleSubcategoryChange = (subcategoryId) => {
    // If subcategory is selected, use it as the category filter
    if (subcategoryId) {
      onFilterChange({ ...filters, category: subcategoryId, subcategory: subcategoryId })
    } else {
      // If "All" selected, use parent category
      onFilterChange({ ...filters, category: selectedParentId, subcategory: '' })
    }
  }

  const handlePriceChange = (field, value) => {
    onFilterChange({
      ...filters,
      priceRange: { ...filters.priceRange, [field]: value }
    })
  }

  const handleMoqChange = (field, value) => {
    onFilterChange({
      ...filters,
      moq: { ...filters.moq, [field]: value }
    })
  }

  const handleRatingChange = (rating) => {
    onFilterChange({ ...filters, rating })
  }

  const handleLocationChange = (location) => {
    onFilterChange({ ...filters, location })
  }

  const handleCategoryChange = (category) => {
    onFilterChange({ ...filters, category })
  }

  const resetFilters = () => {
    setSelectedParentId('')
    setSubcategories([])
    onFilterChange({
      category: '',
      subcategory: '',
      priceRange: { min: 0, max: 10000 },
      moq: { min: 0, max: 1000 },
      rating: 0,
      certifications: [],
      location: '',
      supplierType: ''
    })
  }

  const handleSupplierTypeChange = (supplierType) => {
    onFilterChange({ ...filters, supplierType })
  }

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="reset-btn" onClick={resetFilters}>Reset</button>
      </div>

      <div className="filter-section">
        <h4>Category</h4>
        <select 
          value={selectedParentId} 
          onChange={(e) => handleParentCategoryChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {parentCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Subcategory dropdown - shows only when parent is selected */}
        {selectedParentId && (
          <div className="subcategory-section">
            <label className="subcategory-label">Subcategory</label>
            {loadingSubcategories ? (
              <div className="loading-subcategories">Loading...</div>
            ) : subcategories.length > 0 ? (
              <select 
                value={filters.subcategory || ''} 
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className="filter-select subcategory-select"
              >
                <option value="">All in {parentCategories.find(c => c.id == selectedParentId)?.name}</option>
                {subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            ) : (
              <div className="no-subcategories">No subcategories available</div>
            )}
          </div>
        )}
      </div>

      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="range-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange.min}
            onChange={(e) => handlePriceChange('min', e.target.value)}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange.max}
            onChange={(e) => handlePriceChange('max', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-section">
        <h4>Minimum Order Quantity</h4>
        <div className="range-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.moq.min}
            onChange={(e) => handleMoqChange('min', e.target.value)}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.moq.max}
            onChange={(e) => handleMoqChange('max', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-section">
        <h4>Supplier Rating</h4>
        <div className="rating-filters">
          {[4, 3, 2, 1].map(rating => (
            <label key={rating} className="rating-option">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => handleRatingChange(rating)}
              />
              <span>⭐ {rating}+ Stars</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Location</h4>
        <select 
          value={filters.location} 
          onChange={(e) => handleLocationChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All India</option>
          <option value="maharashtra">Maharashtra</option>
          <option value="karnataka">Karnataka</option>
          <option value="tamil-nadu">Tamil Nadu</option>
          <option value="gujarat">Gujarat</option>
          <option value="delhi">Delhi NCR</option>
          <option value="telangana">Telangana</option>
          <option value="west-bengal">West Bengal</option>
          <option value="uttar-pradesh">Uttar Pradesh</option>
          <option value="rajasthan">Rajasthan</option>
          <option value="kerala">Kerala</option>
        </select>
      </div>

      <div className="filter-section">
        <h4>Supplier Type</h4>
        <select 
          value={filters.supplierType || ''} 
          onChange={(e) => handleSupplierTypeChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Supplier Types</option>
          <option value="manufacturer">Manufacturer</option>
          <option value="distributor">Distributor</option>
          <option value="wholesaler">Wholesaler</option>
          <option value="trader">Trader</option>
          <option value="dealer">Dealer</option>
        </select>
      </div>

      <div className="filter-section">
        <h4>Certifications</h4>
        <label className="checkbox-option">
          <input type="checkbox" />
          <span>ISO 9001</span>
        </label>
        <label className="checkbox-option">
          <input type="checkbox" />
          <span>CE Certified</span>
        </label>
        <label className="checkbox-option">
          <input type="checkbox" />
          <span>RoHS Compliant</span>
        </label>
        <label className="checkbox-option">
          <input type="checkbox" />
          <span>UL Listed</span>
        </label>
      </div>
    </div>
  )
}

export default FilterPanel
