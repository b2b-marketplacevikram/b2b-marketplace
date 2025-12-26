import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderAPI, supplierAPI } from '../../services/api'
import '../../styles/OrderManagement.css'

function OrderManagement() {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState(searchParams.get('filter') || 'all')
  const [loading, setLoading] = useState(true)
  const [supplierId, setSupplierId] = useState(null)

  // Fetch supplier ID from user ID
  useEffect(() => {
    const fetchSupplierId = async () => {
      if (user?.id) {
        try {
          console.log('Fetching supplier for user ID:', user.id)
          const result = await supplierAPI.getByUserId(user.id)
          console.log('Supplier API result:', result)
          if (result.success && result.data) {
            console.log('Setting supplier ID to:', result.data.id)
            setSupplierId(result.data.id)
          }
        } catch (error) {
          console.error('Error fetching supplier ID:', error)
        }
      }
    }
    fetchSupplierId()
  }, [user])

  useEffect(() => {
    // Fetch orders from API
    const fetchOrders = async () => {
      if (!supplierId) {
        console.log('No supplier ID yet, skipping order fetch')
        setLoading(false)
        return
      }
      
      try {
        console.log('Fetching orders for supplier ID:', supplierId)
        const statusFilter = filterStatus !== 'all' ? filterStatus.toUpperCase() : null
        
        const result = await orderAPI.getBySupplier(supplierId, statusFilter)
        console.log('Orders API result:', result)
        
        if (result.success) {
          console.log('Orders data:', result.data)
          // Transform API data to component format
          const transformedOrders = result.data.map(apiOrder => ({
            id: apiOrder.orderNumber,
            buyer: {
              company: 'Buyer Company', // Would come from buyer service
              contact: 'Buyer Contact',
              email: 'buyer@example.com',
              phone: '+1-555-0000'
            },
            items: apiOrder.items.map(item => ({
              id: item.productId,
              name: item.productName,
              quantity: item.quantity,
              price: parseFloat(item.unitPrice)
            })),
            amount: parseFloat(apiOrder.totalAmount),
            status: apiOrder.status.toLowerCase(),
            date: new Date(apiOrder.createdAt).toLocaleDateString(),
            paymentStatus: apiOrder.paymentStatus.toLowerCase(),
            shippingAddress: apiOrder.shippingAddress,
            trackingNumber: apiOrder.trackingNumber
          }))
          
          setOrders(transformedOrders)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [filterStatus, supplierId])

  const getStatusClass = (status) => {
    const classes = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    }
    return classes[status] || ''
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // Find the order to get its database ID
      const order = orders.find(o => o.id === orderId)
      if (!order) return
      
      // Call API to update status
      const result = await orderAPI.updateStatus(orderId, {
        status: newStatus.toUpperCase()
      })
      
      if (result.success) {
        // Update local state
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        alert(`Order ${orderId} status updated to ${newStatus}`)
      } else {
        alert('Failed to update order status: ' + result.message)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('An error occurred while updating the order status')
    }
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="order-management-page">
      <div className="management-header">
        <h1>Order Management</h1>
        <div className="header-actions">
          <button className="btn-secondary">Export Orders</button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All Orders ({orderCounts.all})
        </button>
        <button
          className={filterStatus === 'pending' ? 'active' : ''}
          onClick={() => setFilterStatus('pending')}
        >
          Pending ({orderCounts.pending})
        </button>
        <button
          className={filterStatus === 'processing' ? 'active' : ''}
          onClick={() => setFilterStatus('processing')}
        >
          Processing ({orderCounts.processing})
        </button>
        <button
          className={filterStatus === 'shipped' ? 'active' : ''}
          onClick={() => setFilterStatus('shipped')}
        >
          Shipped ({orderCounts.shipped})
        </button>
        <button
          className={filterStatus === 'delivered' ? 'active' : ''}
          onClick={() => setFilterStatus('delivered')}
        >
          Delivered ({orderCounts.delivered})
        </button>
      </div>

      <div className="orders-content">
        {/* Orders Table */}
        <div className="orders-table-container">
          <div className="table-controls">
            <input
              type="search"
              placeholder="Search orders..."
              className="search-input"
            />
          </div>

          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Buyer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{order.buyer.company}</strong>
                        <p className="buyer-contact">{order.buyer.contact}</p>
                      </div>
                    </td>
                    <td>{order.items.length} item(s)</td>
                    <td><strong>${order.amount.toFixed(2)}</strong></td>
                    <td>{order.date}</td>
                    <td>
                      <span className={`payment-badge payment-${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view"
                        onClick={() => handleViewDetails(order)}
                      >
                        👁️
                      </button>
                      {order.status === 'pending' && (
                        <button
                          className="action-btn accept"
                          onClick={() => handleStatusUpdate(order.id, 'processing')}
                          title="Accept Order"
                        >
                          ✓
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button
                          className="action-btn ship"
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          title="Mark as Shipped"
                        >
                          🚚
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Panel */}
        {selectedOrder && (
          <div className="order-details-panel">
            <div className="panel-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="panel-content">
              <div className="detail-section">
                <h3>Order Information</h3>
                <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                <p><strong>Date:</strong> {selectedOrder.date}</p>
                <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>{selectedOrder.status}</span></p>
                <p><strong>Payment:</strong> <span className={`payment-badge payment-${selectedOrder.paymentStatus}`}>{selectedOrder.paymentStatus}</span></p>
              </div>

              <div className="detail-section">
                <h3>Buyer Information</h3>
                <p><strong>Company:</strong> {selectedOrder.buyer.company}</p>
                <p><strong>Contact:</strong> {selectedOrder.buyer.contact}</p>
                <p><strong>Email:</strong> <a href={`mailto:${selectedOrder.buyer.email}`}>{selectedOrder.buyer.email}</a></p>
                <p><strong>Phone:</strong> <a href={`tel:${selectedOrder.buyer.phone}`}>{selectedOrder.buyer.phone}</a></p>
              </div>

              <div className="detail-section">
                <h3>Shipping Address</h3>
                <p>{selectedOrder.shippingAddress}</p>
                {selectedOrder.trackingNumber && (
                  <p><strong>Tracking:</strong> {selectedOrder.trackingNumber}</p>
                )}
              </div>

              <div className="detail-section">
                <h3>Order Items</h3>
                <div className="order-items">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="order-item">
                      <div>
                        <strong>{item.name}</strong>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                      <div className="item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <strong>Total: ${selectedOrder.amount.toFixed(2)}</strong>
                </div>
              </div>

              <div className="detail-actions">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button
                      className="btn-primary"
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                    >
                      Accept Order
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                    >
                      Decline Order
                    </button>
                  </>
                )}
                {selectedOrder.status === 'processing' && (
                  <button
                    className="btn-primary"
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                  >
                    Mark as Shipped
                  </button>
                )}
                <button className="btn-secondary">Print Invoice</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderManagement
