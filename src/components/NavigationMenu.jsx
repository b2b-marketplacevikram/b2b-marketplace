import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { categoryAPI } from '../services/api'
import '../styles/NavigationMenu.css'

function NavigationMenu() {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const result = await categoryAPI.getAll()
      
      if (result.success && result.data) {
        const categoriesData = result.data.data || result.data
        const organized = organizeCategoriesHierarchy(categoriesData)
        setCategories(organized)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const organizeCategoriesHierarchy = (categoriesData) => {
    const categoryMap = new Map()
    const rootCategories = []

    // First pass: create all category objects
    categoriesData.forEach(cat => {
      categoryMap.set(cat.id, {
        ...cat,
        subcategories: []
      })
    })

    // Second pass: organize into hierarchy
    categoriesData.forEach(cat => {
      const category = categoryMap.get(cat.id)
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId)
        parent.subcategories.push(category)
      } else {
        rootCategories.push(category)
      }
    })

    return rootCategories
  }

  const handleCategoryEnter = (categoryId) => {
    setActiveCategory(categoryId)
  }

  const handleCategoryLeave = () => {
    setActiveCategory(null)
  }

  const handleMegaMenuEnter = (categoryId) => {
    setActiveCategory(categoryId)
  }

  const handleMegaMenuLeave = () => {
    setActiveCategory(null)
  }

  return (
    <nav className="navigation-menu">
      <div className="nav-container">
        {categories.slice(0, 8).map(category => (
          <div
            key={category.id}
            className="nav-item"
            onMouseEnter={() => handleCategoryEnter(category.id)}
            onMouseLeave={handleCategoryLeave}
          >
            <Link 
              to={`/search?category=${category.id}`}
              className="nav-link"
            >
              {category.name}
            </Link>

            {/* Mega Menu Panel */}
            {category.subcategories && category.subcategories.length > 0 && activeCategory === category.id && (
              <div 
                className="mega-menu"
                onMouseEnter={() => handleMegaMenuEnter(category.id)}
                onMouseLeave={handleMegaMenuLeave}
              >
                <div className="mega-menu-content">
                  <h3 className="mega-menu-title">{category.name}</h3>
                  <div className="mega-menu-grid">
                    {category.subcategories.map(subcat => (
                      <Link
                        key={subcat.id}
                        to={`/search?category=${subcat.id}`}
                        className="mega-menu-link"
                      >
                        {subcat.name}
                      </Link>
                    ))}
                  </div>
                  <Link
                    to={`/search?category=${category.id}`}
                    className="mega-menu-view-all"
                  >
                    View All {category.name} →
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}

export default NavigationMenu
