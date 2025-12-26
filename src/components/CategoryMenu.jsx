import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { categoryAPI } from '../services/api'
import '../styles/CategoryMenu.css'

function CategoryMenu() {
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
        setActiveCategory(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchCategories = async () => {
    try {
      const result = await categoryAPI.getAll()
      console.log('Category API result:', result)
      
      if (result.success && result.data) {
        const categoriesData = result.data.data || result.data
        console.log('Categories data:', categoriesData)
        console.log('Total categories:', categoriesData.length)
        
        // Organize categories into parent-child structure
        const organized = organizeCategoriesHierarchy(categoriesData)
        console.log('Organized categories:', organized)
        console.log('First category subcategories:', organized[0]?.subcategories)
        
        setCategories(organized)
      } else {
        console.log('No data, using fallback')
        setFallbackCategories()
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setFallbackCategories()
    }
  }

  const setFallbackCategories = () => {
    setCategories([
      {
        id: 1,
        name: 'Electronics',
        icon: '💻',
        subcategories: [
          { id: 11, name: 'Computers & Laptops', parentId: 1 },
          { id: 12, name: 'Mobile Phones', parentId: 1 },
          { id: 13, name: 'Audio & Video', parentId: 1 },
          { id: 14, name: 'Cameras & Photography', parentId: 1 },
          { id: 15, name: 'Home Appliances', parentId: 1 }
        ]
      },
      {
        id: 2,
        name: 'Machinery',
        icon: '⚙️',
        subcategories: [
          { id: 21, name: 'Industrial Machines', parentId: 2 },
          { id: 22, name: 'Construction Equipment', parentId: 2 },
          { id: 23, name: 'Agricultural Machinery', parentId: 2 },
          { id: 24, name: 'Tools & Hardware', parentId: 2 }
        ]
      },
      {
        id: 3,
        name: 'Textiles',
        icon: '🧵',
        subcategories: [
          { id: 31, name: 'Fabrics', parentId: 3 },
          { id: 32, name: 'Yarns', parentId: 3 },
          { id: 33, name: 'Garments', parentId: 3 },
          { id: 34, name: 'Home Textiles', parentId: 3 }
        ]
      },
      {
        id: 4,
        name: 'Construction',
        icon: '🏗️',
        subcategories: [
          { id: 41, name: 'Building Materials', parentId: 4 },
          { id: 42, name: 'Plumbing & HVAC', parentId: 4 },
          { id: 43, name: 'Electrical Supplies', parentId: 4 },
          { id: 44, name: 'Safety Equipment', parentId: 4 }
        ]
      },
      {
        id: 5,
        name: 'Chemicals',
        icon: '🧪',
        subcategories: [
          { id: 51, name: 'Industrial Chemicals', parentId: 5 },
          { id: 52, name: 'Plastics & Polymers', parentId: 5 },
          { id: 53, name: 'Additives', parentId: 5 },
          { id: 54, name: 'Cleaning Chemicals', parentId: 5 }
        ]
      },
      {
        id: 6,
        name: 'Packaging',
        icon: '📦',
        subcategories: [
          { id: 61, name: 'Boxes & Containers', parentId: 6 },
          { id: 62, name: 'Bags & Films', parentId: 6 },
          { id: 63, name: 'Labels & Stickers', parentId: 6 },
          { id: 64, name: 'Protective Packaging', parentId: 6 }
        ]
      },
      {
        id: 7,
        name: 'Automotive',
        icon: '🚗',
        subcategories: [
          { id: 71, name: 'Auto Parts', parentId: 7 },
          { id: 72, name: 'Tires & Wheels', parentId: 7 },
          { id: 73, name: 'Accessories', parentId: 7 },
          { id: 74, name: 'Maintenance Products', parentId: 7 }
        ]
      },
      {
        id: 8,
        name: 'Food & Beverage',
        icon: '🍎',
        subcategories: [
          { id: 81, name: 'Raw Ingredients', parentId: 8 },
          { id: 82, name: 'Processed Foods', parentId: 8 },
          { id: 83, name: 'Beverages', parentId: 8 },
          { id: 84, name: 'Food Packaging', parentId: 8 }
        ]
      }
    ])
  }

  const organizeCategoriesHierarchy = (categoriesData) => {
    const categoryMap = new Map()
    const rootCategories = []

    console.log('Starting organization with', categoriesData.length, 'categories')

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
        // This is a subcategory
        const parent = categoryMap.get(cat.parentId)
        parent.subcategories.push(category)
        console.log(`Added ${cat.name} as subcategory of parent ${parent.name}`)
      } else {
        // This is a root category
        rootCategories.push(category)
        console.log(`Added ${cat.name} as root category`)
      }
    })

    console.log('Root categories:', rootCategories.map(c => ({ 
      name: c.name, 
      id: c.id, 
      subCount: c.subcategories.length 
    })))

    return rootCategories
  }

  const handleCategoryHover = (categoryId) => {
    console.log('Hovering over category:', categoryId)
    setActiveCategory(categoryId)
  }

  const handleCategoryLeave = () => {
    // Immediate clear - panel will maintain it if hovered
    setActiveCategory(null)
  }

  const handleSubcategoryPanelEnter = (categoryId) => {
    console.log('Panel entered for category:', categoryId)
    setActiveCategory(categoryId)
  }

  const handleSubcategoryPanelLeave = () => {
    setActiveCategory(null)
  }

  const handleMenuToggle = () => {
    setIsOpen(!isOpen)
    if (isOpen) {
      setActiveCategory(null)
    }
  }

  const handleCategoryClick = () => {
    setIsOpen(false)
    setActiveCategory(null)
  }

  return (
    <div className="category-menu" ref={menuRef}>
      <button 
        className={`category-menu-btn ${isOpen ? 'active' : ''}`}
        onClick={handleMenuToggle}
      >
        <span className="menu-icon">☰</span>
        <span className="menu-text">All Categories</span>
        <span className="menu-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="category-dropdown">
          <div className="category-list">
            {categories.map(category => (
              <div
                key={category.id}
                className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
                onMouseEnter={() => handleCategoryHover(category.id)}
                onMouseLeave={handleCategoryLeave}
              >
                <div className="category-link">
                  <span className="category-icon">{category.icon || '📦'}</span>
                  <span className="category-name">{category.name}</span>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <span className="has-subcategories">→ ({category.subcategories.length})</span>
                  )}
                </div>

                {/* Subcategories Panel */}
                {activeCategory === category.id && category.subcategories && category.subcategories.length > 0 && (
                  <div 
                    className="subcategory-panel"
                    onMouseEnter={() => handleSubcategoryPanelEnter(category.id)}
                    onMouseLeave={handleSubcategoryPanelLeave}
                  >
                    <h4 className="subcategory-title">{category.name}</h4>
                    <div className="subcategory-grid">
                      {category.subcategories.map(subcat => (
                        <Link
                          key={subcat.id}
                          to={`/search?category=${subcat.id}`}
                          className="subcategory-link"
                          onClick={handleCategoryClick}
                        >
                          {subcat.name}
                        </Link>
                      ))}
                    </div>
                    <Link
                      to={`/search?category=${category.id}`}
                      className="view-all-link"
                      onClick={handleCategoryClick}
                    >
                      View All {category.name} →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryMenu
