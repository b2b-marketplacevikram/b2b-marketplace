import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import '../../styles/AdminDashboard.css'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [topSuppliers, setTopSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes, productsRes, suppliersRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentOrders(5),
        adminAPI.getTopProducts(5),
        adminAPI.getTopSuppliers(5)
      ])

      if (statsRes.success) setStats(statsRes.data)
      if (ordersRes.success) setRecentOrders(ordersRes.data)
      if (productsRes.success) setTopProducts(productsRes.data)
      if (suppliersRes.success) setTopSuppliers(suppliersRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-nav">
          <Link to="/admin/users" className="admin-nav-link">Users</Link>
          <Link to="/admin/products" className="admin-nav-link">Products</Link>
          <Link to="/admin/orders" className="admin-nav-link">Orders</Link>
          <Link to="/admin/settings" className="admin-nav-link">Settings</Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-content">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Total Users</p>
            <div className="stat-detail">
              {stats?.totalBuyers || 0} Buyers • {stats?.totalSuppliers || 0} Suppliers
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">📦</div>
          <div className="stat-content">
            <h3>{stats?.totalProducts || 0}</h3>
            <p>Total Products</p>
            <div className="stat-detail">
              {stats?.activeProducts || 0} Active
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">🛒</div>
          <div className="stat-content">
            <h3>{stats?.totalOrders || 0}</h3>
            <p>Total Orders</p>
            <div className="stat-detail">
              {stats?.pendingOrders || 0} Pending
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <h3>${stats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
            <p>Total Revenue</p>
            <div className="stat-detail">
              Avg: ${stats?.averageOrderValue?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="view-all">View All →</Link>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.buyer_name || 'N/A'}</td>
                  <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-row">
        {/* Top Products */}
        <div className="dashboard-section half">
          <div className="section-header">
            <h2>Top Products</h2>
          </div>
          <div className="list-container">
            {topProducts.map((product, index) => (
              <div key={product.id} className="list-item">
                <div className="list-rank">{index + 1}</div>
                <div className="list-content">
                  <div className="list-name">{product.name}</div>
                  <div className="list-detail">
                    {product.order_count || 0} orders • {product.total_quantity || 0} units sold
                  </div>
                </div>
                <div className="list-value">${parseFloat(product.unit_price).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="dashboard-section half">
          <div className="section-header">
            <h2>Top Suppliers</h2>
          </div>
          <div className="list-container">
            {topSuppliers.map((supplier, index) => (
              <div key={supplier.id} className="list-item">
                <div className="list-rank">{index + 1}</div>
                <div className="list-content">
                  <div className="list-name">{supplier.full_name}</div>
                  <div className="list-detail">
                    {supplier.order_count || 0} orders
                  </div>
                </div>
                <div className="list-value">${parseFloat(supplier.total_revenue || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
