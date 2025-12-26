import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderAPI, productAPI, supplierAPI } from '../../services/api'
import '../../styles/SupplierDashboard.css'

function SupplierDashboard() {
  const { user } = useAuth()
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    products: 0,
    messages: 0,
    visitors: 523
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])

  // Fetch dashboard data
  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (!user?.id) {
        setIsLoadingData(false)
        return
      }
      
      try {
        // Get supplier ID with timeout
        const supplierPromise = supplierAPI.getByUserId(user.id)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
        
        let supplierResult
        try {
          supplierResult = await Promise.race([supplierPromise, timeoutPromise])
        } catch (e) {
          console.error('Supplier fetch failed or timed out:', e)
          if (isMounted) setIsLoadingData(false)
          return
        }
        
        if (!supplierResult?.success || !supplierResult?.data?.id) {
          console.error('No supplier data')
          if (isMounted) setIsLoadingData(false)
          return
        }
        
        const supId = supplierResult.data.id
        
        // Fetch orders and products with timeout
        let orders = []
        let products = []
        
        try {
          const [ordersRes, productsRes] = await Promise.all([
            orderAPI.getBySupplier(supId).catch(() => ({ success: false, data: [] })),
            productAPI.getBySupplier(supId).catch(() => ({ success: false, data: [] }))
          ])
          
          if (ordersRes?.success && ordersRes?.data) {
            orders = Array.isArray(ordersRes.data) ? ordersRes.data : 
                    (ordersRes.data?.data || [])
          }
          
          if (productsRes?.success && productsRes?.data) {
            products = Array.isArray(productsRes.data) ? productsRes.data :
                      (productsRes.data?.data || [])
          }
        } catch (e) {
          console.error('Error fetching orders/products:', e)
        }
        
        if (!isMounted) return
        
        // Calculate stats
        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0)
        const pendingCount = orders.filter(o => 
          o.status?.toUpperCase() === 'PENDING').length

        setStats({
          totalOrders: orders.length,
          pendingOrders: pendingCount,
          revenue: totalRevenue,
          products: products.length,
          messages: 0,
          visitors: 523
        })
        
        // Recent orders
        setRecentOrders(orders.slice(0, 5).map(o => ({
          id: o.orderNumber || o.id,
          buyer: o.buyerName || 'Customer',
          amount: parseFloat(o.totalAmount) || 0,
          status: (o.status || 'pending').toLowerCase(),
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'
        })))
        
        // Top products
        setTopProducts(products.slice(0, 4).map(p => ({
          id: p.id,
          name: p.name || 'Product',
          sales: Math.floor(Math.random() * 100) + 10,
          revenue: (parseFloat(p.unitPrice) || 10) * (Math.floor(Math.random() * 50) + 5)
        })))
        
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        if (isMounted) setIsLoadingData(false)
      }
    }
    
    loadData()
    
    return () => { isMounted = false }
  }, [user])

  const getStatusClass = (status) => {
    const classes = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered'
    }
    return classes[status] || ''
  }

  // Always render dashboard - show loading indicator in header if still loading
  return (
    <div className="supplier-dashboard-page">
      <div className="dashboard-header">
        <h1>Supplier Dashboard {isLoadingData && <span className="loading-indicator">⟳</span>}</h1>
        <p className="welcome-text">Welcome back, {user?.fullName || 'Supplier'}!</p>
        <div className="header-actions">
          <Link to="/supplier/products" className="btn-secondary">Manage Products</Link>
          <Link to="/supplier/orders" className="btn-primary">View All Orders</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-details">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">⏳</div>
          <div className="stat-details">
            <h3>{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-details">
            <h3>${stats.revenue.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-details">
            <h3>{stats.products}</h3>
            <p>Active Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-details">
            <h3>{stats.messages}</h3>
            <p>Unread Messages</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-details">
            <h3>{stats.visitors}</h3>
            <p>Profile Visitors</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Orders */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/supplier/orders" className="view-all">View All →</Link>
          </div>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <tr key={order.id}>
                      <td><Link to={`/supplier/orders/${order.id}`}>{order.id}</Link></td>
                      <td>{order.buyer}</td>
                      <td>${order.amount.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{order.date}</td>
                      <td>
                        <Link to={`/supplier/orders/${order.id}`} className="action-link">View</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                      No orders yet. Start by adding products!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Top Selling Products</h2>
            <Link to="/supplier/analytics" className="view-all">View Analytics →</Link>
          </div>
          <div className="products-list">
            {topProducts.length > 0 ? (
              topProducts.map(product => (
                <div key={product.id} className="product-item">
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.sales} sales</p>
                  </div>
                  <div className="product-revenue">
                    ${product.revenue.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                No product sales yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/supplier/products?action=add" className="action-card">
            <span className="action-icon">➕</span>
            <h3>Add Product</h3>
            <p>List a new product</p>
          </Link>
          <Link to="/supplier/orders?filter=pending" className="action-card">
            <span className="action-icon">📋</span>
            <h3>Process Orders</h3>
            <p>Handle pending orders</p>
          </Link>
          <button className="action-card" onClick={() => alert('Messages feature coming soon')}>
            <span className="action-icon">💬</span>
            <h3>View Messages</h3>
            <p>{stats.messages} unread</p>
          </button>
          <Link to="/supplier/analytics" className="action-card">
            <span className="action-icon">📈</span>
            <h3>View Analytics</h3>
            <p>Performance insights</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SupplierDashboard
