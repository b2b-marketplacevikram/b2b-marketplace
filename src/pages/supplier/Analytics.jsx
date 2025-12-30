import { useState, useEffect } from 'react'
import { analyticsAPI } from '../../services/api'
import '../../styles/Analytics.css'

function Analytics() {
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analytics, setAnalytics] = useState({
    revenue: { current: 0, previous: 0, growth: 0 },
    orders: { current: 0, previous: 0, growth: 0 },
    avgOrderValue: { current: 0, previous: 0, growth: 0 },
    conversion: { current: 0, previous: 0, growth: 0 }
  })

  const [topProducts, setTopProducts] = useState([])
  const [topBuyers, setTopBuyers] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [categoryData, setCategoryData] = useState([])

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await analyticsAPI.getSupplierStats(period)
        
        if (result.success && result.data) {
          const data = result.data
          
          // Map analytics metrics
          setAnalytics({
            revenue: {
              current: parseFloat(data.revenue?.current) || 0,
              previous: parseFloat(data.revenue?.previous) || 0,
              growth: data.revenue?.growth || 0
            },
            orders: {
              current: parseFloat(data.orders?.current) || 0,
              previous: parseFloat(data.orders?.previous) || 0,
              growth: data.orders?.growth || 0
            },
            avgOrderValue: {
              current: parseFloat(data.avgOrderValue?.current) || 0,
              previous: parseFloat(data.avgOrderValue?.previous) || 0,
              growth: data.avgOrderValue?.growth || 0
            },
            conversion: {
              current: parseFloat(data.conversion?.current) || 0,
              previous: parseFloat(data.conversion?.previous) || 0,
              growth: data.conversion?.growth || 0
            }
          })
          
          // Map top products
          if (data.topProducts && Array.isArray(data.topProducts)) {
            setTopProducts(data.topProducts.map(p => ({
              id: p.productId,
              name: p.name || 'Unknown Product',
              sales: p.sales || 0,
              revenue: parseFloat(p.revenue) || 0,
              growth: p.growth || 0
            })))
          }
          
          // Map top buyers
          if (data.topBuyers && Array.isArray(data.topBuyers)) {
            setTopBuyers(data.topBuyers.map(b => ({
              id: b.buyerId,
              company: b.company || 'Unknown Company',
              orders: b.orders || 0,
              revenue: parseFloat(b.revenue) || 0,
              lastOrder: b.lastOrder || 'N/A'
            })))
          }
          
          // Map revenue data
          if (data.revenueData && Array.isArray(data.revenueData)) {
            setRevenueData(data.revenueData.map(r => ({
              month: r.month || '',
              revenue: parseFloat(r.revenue) || 0
            })))
          }
          
          // Map category data with colors
          const colors = ['#FF6B35', '#2EC4B6', '#7B68EE', '#FFD93D', '#6BCB77', '#FF69B4', '#00CED1', '#FFA07A']
          if (data.categoryData && Array.isArray(data.categoryData)) {
            setCategoryData(data.categoryData.map((c, index) => ({
              category: c.category || 'Other',
              revenue: parseFloat(c.revenue) || 0,
              percentage: c.percentage || 0,
              color: colors[index % colors.length]
            })))
          }
        } else {
          setError('Failed to load analytics data')
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('Error loading analytics. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [period])

  const getGrowthClass = (growth) => {
    return (growth || 0) >= 0 ? 'positive' : 'negative'
  }

  const formatGrowth = (growth) => {
    const g = growth || 0
    const sign = g >= 0 ? '+' : ''
    return `${sign}${g.toFixed(1)}%`
  }

  const safeNumber = (val) => {
    return typeof val === 'number' ? val : 0
  }

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Analytics & Insights</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1>Analytics & Insights</h1>
        </div>
        <div className="error-container">
          <p className="error-message">⚠️ {error}</p>
          <button className="btn-retry" onClick={() => setPeriod(period)}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics & Insights</h1>
        <div className="period-selector">
          <button
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
          <button
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
          <button
            className={period === 'year' ? 'active' : ''}
            onClick={() => setPeriod('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">💰</span>
            <span className={`metric-growth ${getGrowthClass(analytics.revenue?.growth)}`}>
              {formatGrowth(analytics.revenue?.growth)}
            </span>
          </div>
          <h3>Total Revenue</h3>
          <div className="metric-value">₹{safeNumber(analytics.revenue?.current).toLocaleString('en-IN')}</div>
          <p className="metric-comparison">vs ₹{safeNumber(analytics.revenue?.previous).toLocaleString('en-IN')} last period</p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📦</span>
            <span className={`metric-growth ${getGrowthClass(analytics.orders?.growth)}`}>
              {formatGrowth(analytics.orders?.growth)}
            </span>
          </div>
          <h3>Total Orders</h3>
          <div className="metric-value">{safeNumber(analytics.orders?.current)}</div>
          <p className="metric-comparison">vs {analytics.orders.previous} last period</p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">💵</span>
            <span className={`metric-growth ${getGrowthClass(analytics.avgOrderValue.growth)}`}>
              {formatGrowth(analytics.avgOrderValue.growth)}
            </span>
          </div>
          <h3>Avg Order Value</h3>
          <div className="metric-value">₹{analytics.avgOrderValue.current.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <p className="metric-comparison">vs ₹{analytics.avgOrderValue.previous.toLocaleString('en-IN', { minimumFractionDigits: 2 })} last period</p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📈</span>
            <span className={`metric-growth ${getGrowthClass(analytics.conversion.growth)}`}>
              {formatGrowth(analytics.conversion.growth)}
            </span>
          </div>
          <h3>Conversion Rate</h3>
          <div className="metric-value">{analytics.conversion.current}%</div>
          <p className="metric-comparison">vs {analytics.conversion.previous}% last period</p>
        </div>
      </div>

      <div className="analytics-content">
        {/* Revenue Chart */}
        <div className="chart-card">
          <h2>Revenue Trend</h2>
          <div className="chart-container">
            <div className="bar-chart">
              {revenueData.map((data, index) => {
                const maxRevenue = Math.max(...revenueData.map(d => d.revenue))
                const height = (data.revenue / maxRevenue) * 100
                return (
                  <div key={index} className="bar-wrapper">
                    <div className="bar-value">₹{(data.revenue / 1000).toFixed(0)}k</div>
                    <div className="bar" style={{ height: `${height}%` }}>
                      <div className="bar-fill"></div>
                    </div>
                    <div className="bar-label">{data.month}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-card">
          <h2>Revenue by Category</h2>
          <div className="category-chart">
            {categoryData.map((cat, index) => (
              <div key={index} className="category-item">
                <div className="category-info">
                  <span className="category-name">{cat.category || 'Unknown'}</span>
                  <span className="category-revenue">₹{safeNumber(cat.revenue).toLocaleString('en-IN')}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${cat.percentage || 0}%` }}
                  ></div>
                </div>
                <span className="category-percentage">{cat.percentage || 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-tables">
        {/* Top Products */}
        <div className="table-card">
          <h2>Top Selling Products</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index}>
                  <td>
                    <div className="product-cell">
                      <span className="rank">#{index + 1}</span>
                      <strong>{product.name || 'Unknown'}</strong>
                    </div>
                  </td>
                  <td>{product.sales || 0}</td>
                  <td>₹{safeNumber(product.revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`growth-badge ${getGrowthClass(product.growth)}`}>
                      {formatGrowth(product.growth)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Buyers */}
        <div className="table-card">
          <h2>Top Buyers</h2>
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {topBuyers.map((buyer, index) => (
                <tr key={index}>
                  <td>
                    <div className="buyer-cell">
                      <span className="rank">#{index + 1}</span>
                      <strong>{buyer.company || 'Unknown'}</strong>
                    </div>
                  </td>
                  <td>{buyer.orders || 0}</td>
                  <td>₹{safeNumber(buyer.revenue).toLocaleString('en-IN')}</td>
                  <td>{buyer.lastOrder || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="insights-card">
        <h2>Performance Insights</h2>
        <div className="insights-grid">
          <div className="insight-item">
            <span className="insight-icon">🎯</span>
            <div>
              <strong>Best Performing Period</strong>
              <p>{revenueData.length > 0 ? 
                  `${revenueData[revenueData.length - 1]?.month} with $${parseFloat(revenueData[revenueData.length - 1]?.revenue || 0).toLocaleString()} revenue` : 
                  'No revenue data available'}</p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">⭐</span>
            <div>
              <strong>Most Popular Product</strong>
              <p>{topProducts.length > 0 ? 
                  `${topProducts[0].name} with ${topProducts[0].sales} units sold` : 
                  'No product data available'}</p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">👥</span>
            <div>
              <strong>Top Customer</strong>
              <p>{topBuyers.length > 0 ? 
                  `${topBuyers[0].company} with ${topBuyers[0].orders} orders` : 
                  'No customer data available'}</p>
            </div>
          </div>
          <div className="insight-item">
            <span className="insight-icon">📊</span>
            <div>
              <strong>Revenue Growth</strong>
              <p>{analytics.revenue.growth > 0 ? 
                  `${analytics.revenue.growth.toFixed(1)}% growth compared to previous period` : 
                  analytics.revenue.growth < 0 ? 
                  `${Math.abs(analytics.revenue.growth).toFixed(1)}% decline compared to previous period` :
                  'No change from previous period'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
