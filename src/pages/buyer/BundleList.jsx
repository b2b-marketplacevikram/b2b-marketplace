import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import BundleCard from '../../components/BundleCard'
import { bundleAPI } from '../../services/api'
import '../../styles/BundleList.css'

function BundleList() {
  const [searchParams] = useSearchParams()
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true)
      try {
        const keyword = searchParams.get('q')
        let result
        
        if (keyword) {
          result = await bundleAPI.search(keyword)
        } else {
          result = await bundleAPI.getAll()
        }

        if (result.success && result.data?.data) {
          setBundles(result.data.data)
        } else {
          setBundles([])
        }
      } catch (error) {
        console.error('Error fetching bundles:', error)
        setBundles([])
      }
      setLoading(false)
    }

    fetchBundles()
  }, [searchParams])

  if (loading) {
    return <div className="loading">Loading bundles...</div>
  }

  return (
    <div className="bundle-list-page">
      <div className="bundle-list-header">
        <h1>Product Bundles</h1>
        <p>Save more with our curated product bundles</p>
      </div>

      {bundles.length === 0 ? (
        <div className="no-bundles">
          <span className="no-bundles-icon">📦</span>
          <h3>No bundles available</h3>
          <p>Check back later for exciting bundle deals!</p>
        </div>
      ) : (
        <div className="bundles-grid">
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BundleList
