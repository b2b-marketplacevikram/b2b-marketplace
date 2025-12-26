import { useState, useEffect } from 'react'
import { categoryAPI } from '../services/api'
import '../styles/FilterPanel.css'

function FilterPanel({ filters, onFilterChange }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await categoryAPI.getAll()
      if (result.success && result.data) {
        // Handle both { data: [...] } and direct array formats
        const categoriesData = result.data.data || result.data
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      }
    }
    fetchCategories()
  }, [])

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
    onFilterChange({
      category: '',
      priceRange: { min: 0, max: 10000 },
      moq: { min: 0, max: 1000 },
      rating: 0,
      certifications: [],
      location: ''
    })
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
          value={filters.category} 
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
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
          <option value="">All Locations</option>
          <option value="china">China</option>
          <option value="usa">United States</option>
          <option value="germany">Germany</option>
          <option value="japan">Japan</option>
          <option value="india">India</option>
          <option value="uk">United Kingdom</option>
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
