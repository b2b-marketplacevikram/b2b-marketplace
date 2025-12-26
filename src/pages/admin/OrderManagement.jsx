import { useState, useEffect } from 'react'
import { orderAPI } from '../../services/api'
import '../../styles/OrderManagement.css'

function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    fetchAllOrders()
  }, [])

  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      // Fetch all orders - you might need to add an admin endpoint
      const response = await orderAPI.getAll()
      setOrders(Array.isArray(response.data) ? response.data : [])
      setError(null)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus)
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toString().includes(searchTerm) ||
                         order.buyerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      PENDING: 'status-pending',
      CONFIRMED: 'status-confirmed',
      PROCESSING: 'status-processing',
      SHIPPED: 'status-shipped',
      DELIVERED: 'status-delivered',
      CANCELLED: 'status-cancelled'
    }
    return statusMap[status] || 'status-pending'
  }

  if (loading) {
    return (
      <div className="admin-order-management-page">
        <div className="loading">Loading orders...</div>
      </div>
    )
  }

  return (
    <div className="admin-order-management-page">
      <div className="container">
        <div className="page-header">
          <h1>Order Management</h1>
          <p>Manage all orders across the platform</p>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by order ID or buyer email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Buyer</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td className="order-id">#{order.id}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.buyerEmail || order.buyerName || 'N/A'}</td>
                    <td>{order.supplierName || `Supplier #${order.supplierId}`}</td>
                    <td>{order.items?.length || order.totalItems || 0} items</td>
                    <td className="amount">${order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span className={`payment-badge payment-${(order.paymentStatus || 'PENDING').toLowerCase()}`}>
                        {order.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className={`status-select ${getStatusBadgeClass(order.status)}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-view"
                          onClick={() => window.location.href = `/orders/${order.id}`}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="orders-summary">
          <p>Showing {filteredOrders.length} of {orders.length} orders</p>
        </div>
      </div>
    </div>
  )
}

export default OrderManagement
