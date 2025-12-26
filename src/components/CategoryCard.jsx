import { Link } from 'react-router-dom'
import '../styles/CategoryCard.css'

function CategoryCard({ category }) {
  return (
    <Link to={`/search?category=${category.id}`} className="category-card">
      <div className="category-icon">{category.icon}</div>
      <h3 className="category-name">{category.name}</h3>
      <p className="category-count">{category.count}</p>
    </Link>
  )
}

export default CategoryCard
