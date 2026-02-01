import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryAPI } from '../services/api'
import '../styles/CategoryBrowser.css'

function CategoryBrowser() {
  const [topLevelCategories, setTopLevelCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [subcategories, setSubcategories] = useState([])
  const [subSubcategories, setSubSubcategories] = useState([])
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Fetch top-level categories on mount
  useEffect(() => {
    fetchTopLevelCategories()
  }, [])

  const fetchTopLevelCategories = async () => {
    setLoading(true)
    try {
      const result = await categoryAPI.getTopLevel()
      if (result.success && result.data?.data) {
        setTopLevelCategories(result.data.data)
      }
    } catch (error) {
      console.error('Error fetching top-level categories:', error)
    }
    setLoading(false)
  }

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category)
    setSelectedSubcategory(null)
    setSubSubcategories([])
    
    try {
      const result = await categoryAPI.getSubcategories(category.id)
      if (result.success && result.data?.data) {
        setSubcategories(result.data.data)
      } else {
        // If no subcategories, navigate to products
        navigate(`/category-products/${category.id}`)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      setSubcategories([])
    }
  }

  const handleSubcategoryClick = async (subcategory) => {
    setSelectedSubcategory(subcategory)
    
    try {
      const result = await categoryAPI.getSubcategories(subcategory.id)
      if (result.success && result.data?.data && result.data.data.length > 0) {
        setSubSubcategories(result.data.data)
      } else {
        // If no sub-subcategories, navigate to products
        navigate(`/category-products/${subcategory.id}`)
      }
    } catch (error) {
      console.error('Error fetching sub-subcategories:', error)
      navigate(`/category-products/${subcategory.id}`)
    }
  }

  const handleSubSubcategoryClick = (subSubcategory) => {
    // Navigate to products page for the leaf category
    navigate(`/category-products/${subSubcategory.id}`)
  }

  const handleBackToTopLevel = () => {
    setSelectedCategory(null)
    setSubcategories([])
    setSubSubcategories([])
    setSelectedSubcategory(null)
  }

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null)
    setSubSubcategories([])
  }

  if (loading) {
    return <div className="category-browser-loading">Loading categories...</div>
  }

  return (
    <section className="category-browser-section">
      <h2>Browse by Category</h2>
      
      {/* Top-level categories */}
      {!selectedCategory && (
        <div className="categories-grid">
          {topLevelCategories.map(category => (
            <div 
              key={category.id} 
              className="category-card"
              onClick={() => handleCategoryClick(category)}
            >
              {category.imageUrl ? (
                <img src={category.imageUrl} alt={category.name} className="category-image" />
              ) : (
                <div className="category-icon-large">{category.icon || '📦'}</div>
              )}
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Level 1 subcategories */}
      {selectedCategory && subcategories.length > 0 && !selectedSubcategory && (
        <div className="subcategory-view">
          <div className="breadcrumb">
            <button onClick={handleBackToTopLevel} className="breadcrumb-link">
              ← Back to Categories
            </button>
            <span className="breadcrumb-current"> / {selectedCategory.name}</span>
          </div>
          
          <h3 className="subcategory-title">Browse {selectedCategory.name}</h3>
          
          <div className="subcategories-grid">
            {subcategories.map(subcategory => (
              <div 
                key={subcategory.id} 
                className="subcategory-card"
                onClick={() => handleSubcategoryClick(subcategory)}
              >
                {subcategory.imageUrl ? (
                  <img src={subcategory.imageUrl} alt={subcategory.name} className="subcategory-image" />
                ) : (
                  <div className="subcategory-icon">{subcategory.icon || '📦'}</div>
                )}
                <div className="subcategory-info">
                  <h4 className="subcategory-name">{subcategory.name}</h4>
                  <p className="subcategory-description">{subcategory.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Level 2 sub-subcategories */}
      {selectedSubcategory && subSubcategories.length > 0 && (
        <div className="subcategory-view">
          <div className="breadcrumb">
            <button onClick={handleBackToTopLevel} className="breadcrumb-link">
              Categories
            </button>
            <span> / </span>
            <button onClick={handleBackToSubcategories} className="breadcrumb-link">
              {selectedCategory.name}
            </button>
            <span className="breadcrumb-current"> / {selectedSubcategory.name}</span>
          </div>
          
          <h3 className="subcategory-title">Browse {selectedSubcategory.name}</h3>
          
          <div className="subcategories-grid">
            {subSubcategories.map(subSubcategory => (
              <div 
                key={subSubcategory.id} 
                className="subcategory-card"
                onClick={() => handleSubSubcategoryClick(subSubcategory)}
              >
                {subSubcategory.imageUrl ? (
                  <img src={subSubcategory.imageUrl} alt={subSubcategory.name} className="subcategory-image" />
                ) : (
                  <div className="subcategory-icon">{subSubcategory.icon || '📦'}</div>
                )}
                <div className="subcategory-info">
                  <h4 className="subcategory-name">{subSubcategory.name}</h4>
                  <p className="subcategory-description">{subSubcategory.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default CategoryBrowser
