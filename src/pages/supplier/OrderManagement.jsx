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
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ ...toast, show: false }), 4000)
  }

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
        showToast(`Order ${orderId} status updated to ${newStatus}`, 'success')
      } else {
        showToast('Failed to update order status: ' + result.message, 'error')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      showToast('An error occurred while updating the order status', 'error')
    }
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
  }

  const handlePrintInvoice = (order) => {
    const invoiceWindow = window.open('', '_blank')
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
          .invoice { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #ff6b35; }
          .logo { font-size: 28px; font-weight: 700; color: #ff6b35; }
          .logo span { color: #333; }
          .invoice-info { text-align: right; }
          .invoice-info h1 { font-size: 32px; color: #1e293b; margin-bottom: 8px; }
          .invoice-info p { color: #64748b; font-size: 14px; }
          .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .party h3 { font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 1px; }
          .party p { font-size: 14px; line-height: 1.6; }
          .party strong { font-size: 16px; color: #1e293b; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          .items-table td { padding: 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .items-table .qty, .items-table .price, .items-table .total { text-align: right; }
          .summary { display: flex; justify-content: flex-end; }
          .summary-table { width: 280px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .summary-row.total { border-top: 2px solid #1e293b; margin-top: 8px; padding-top: 16px; font-size: 18px; font-weight: 700; }
          .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .status-shipped { background: #cffafe; color: #0e7490; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-delivered { background: #d1fae5; color: #065f46; }
          .status-processing { background: #e0e7ff; color: #3730a3; }
          @media print { body { padding: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div class="logo">B2B <span>Marketplace</span></div>
            <div class="invoice-info">
              <h1>INVOICE</h1>
              <p><strong>${order.id}</strong></p>
              <p>Date: ${order.date}</p>
              <p><span class="status status-${order.status}">${order.status}</span></p>
            </div>
          </div>
          
          <div class="parties">
            <div class="party">
              <h3>Bill To</h3>
              <p><strong>${order.buyer.company}</strong></p>
              <p>${order.buyer.contact}</p>
              <p>${order.buyer.email}</p>
              <p>${order.buyer.phone}</p>
            </div>
            <div class="party">
              <h3>Ship To</h3>
              <p>${order.shippingAddress || 'N/A'}</p>
              ${order.trackingNumber ? `<p style="margin-top: 12px;"><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ''}
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th class="qty">Qty</th>
                <th class="price">Unit Price</th>
                <th class="total">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td class="qty">${item.quantity}</td>
                  <td class="price">$${item.price.toFixed(2)}</td>
                  <td class="total">$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-table">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>$${order.amount.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>$${order.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p style="margin-top: 8px;">B2B Marketplace | support@b2bmarketplace.com</p>
          </div>
        </div>
        
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `
    invoiceWindow.document.write(invoiceHTML)
    invoiceWindow.document.close()
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
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </div>
          <div className="toast-content">
            <p className="toast-message">{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => setToast({ ...toast, show: false })}>×</button>
        </div>
      )}

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
                      <Link to={`/supplier/orders/${order.id}`} className="order-id-link">
                        {order.id}
                      </Link>
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
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          title="Confirm Order"
                        >
                          ✓
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          className="action-btn process"
                          onClick={() => handleStatusUpdate(order.id, 'processing')}
                          title="Start Processing"
                        >
                          ⚙️
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
                      {order.status === 'shipped' && (
                        <button
                          className="action-btn deliver"
                          onClick={() => handleStatusUpdate(order.id, 'delivered')}
                          title="Mark as Delivered"
                        >
                          📦
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
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'confirmed')}
                    >
                      ✓ Confirm Order
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                    >
                      ✕ Decline Order
                    </button>
                  </>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button
                    className="btn-primary"
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                  >
                    ⚙️ Start Processing
                  </button>
                )}
                {selectedOrder.status === 'processing' && (
                  <button
                    className="btn-primary"
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'shipped')}
                  >
                    🚚 Mark as Shipped
                  </button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <button
                    className="btn-primary"
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                  >
                    📦 Mark as Delivered
                  </button>
                )}
                <button className="btn-secondary" onClick={() => handlePrintInvoice(selectedOrder)}>Print Invoice</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderManagement
