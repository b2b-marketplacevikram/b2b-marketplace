import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import './NotificationSettings.css'

function NotificationSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    whatsappNumber: '',
    whatsappNotificationsEnabled: true,
    notifyOnSearch: true,
    notifyOnNewOrder: true,
    notifyOnPayment: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [testSending, setTestSending] = useState(false)

  const [supplierId, setSupplierId] = useState(null)

  useEffect(() => {
    fetchSupplierAndSettings()
  }, [])

  const fetchSupplierAndSettings = async () => {
    try {
      setLoading(true)
      
      // First, get the supplier ID from the user ID
      let supplierIdToUse = user?.supplierId
      
      if (!supplierIdToUse && user?.id) {
        // Fetch supplier by user ID
        const supplierResponse = await fetch(`http://localhost:8081/api/suppliers/user/${user.id}`)
        if (supplierResponse.ok) {
          const supplierData = await supplierResponse.json()
          supplierIdToUse = supplierData.id
          setSupplierId(supplierData.id)
        }
      } else {
        setSupplierId(supplierIdToUse)
      }
      
      if (!supplierIdToUse) {
        setMessage({ type: 'error', text: 'Supplier account not found' })
        setLoading(false)
        return
      }
      
      // Fetch settings
      const response = await fetch(`http://localhost:8081/api/suppliers/${supplierIdToUse}`)
      if (response.ok) {
        const data = await response.json()
        setSettings({
          whatsappNumber: data.whatsappNumber || '',
          whatsappNotificationsEnabled: data.whatsappNotificationsEnabled ?? true,
          notifyOnSearch: data.notifyOnSearch ?? true,
          notifyOnNewOrder: data.notifyOnNewOrder ?? true,
          notifyOnPayment: data.notifyOnPayment ?? true
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    // Validate phone number
    if (settings.whatsappNotificationsEnabled && !settings.whatsappNumber) {
      setMessage({ type: 'error', text: 'Please enter your WhatsApp number' })
      return
    }

    try {
      setSaving(true)
      
      if (!supplierId) {
        setMessage({ type: 'error', text: 'Supplier ID not found' })
        setSaving(false)
        return
      }
      
      const response = await fetch(`http://localhost:8081/api/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notification settings saved successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving settings' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  const handleTestNotification = async () => {
    if (!settings.whatsappNumber) {
      setMessage({ type: 'error', text: 'Please enter your WhatsApp number first' })
      return
    }

    try {
      setTestSending(true)
      const response = await fetch('http://localhost:8086/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: settings.whatsappNumber,
          message: '🧪 Test notification from MarketPlus B2B Marketplace!'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.demoMode 
            ? '✅ Demo mode: Notification logged (configure WhatsApp API for real messages)' 
            : '✅ Test notification sent to your WhatsApp!' 
        })
      } else {
        setMessage({ type: 'error', text: 'Failed to send test notification' })
      }
    } catch (error) {
      setMessage({ type: 'info', text: 'Notification service not running. Start the notification service to test.' })
    } finally {
      setTestSending(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  if (loading) {
    return (
      <div className="notification-settings-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="notification-settings-page">
      <div className="notification-settings-container">
        <div className="settings-header">
          <h1>📱 WhatsApp Notification Settings</h1>
          <p>Get instant WhatsApp notifications when buyers search for your products</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="settings-form">
          {/* WhatsApp Number */}
          <div className="form-section">
            <h3>📞 WhatsApp Number</h3>
            <div className="form-group">
              <label htmlFor="whatsappNumber">Your WhatsApp Number</label>
              <div className="phone-input-wrapper">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={settings.whatsappNumber}
                  onChange={handleChange}
                  placeholder="9876543210"
                  maxLength="10"
                  pattern="[0-9]{10}"
                />
              </div>
              <p className="input-hint">Enter your 10-digit mobile number linked to WhatsApp</p>
            </div>
          </div>

          {/* Master Toggle */}
          <div className="form-section">
            <h3>🔔 Notification Preferences</h3>
            
            <div className="toggle-group master-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="whatsappNotificationsEnabled"
                  checked={settings.whatsappNotificationsEnabled}
                  onChange={handleChange}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-text">
                  <strong>Enable WhatsApp Notifications</strong>
                  <small>Receive all notifications via WhatsApp</small>
                </span>
              </label>
            </div>

            {settings.whatsappNotificationsEnabled && (
              <div className="notification-types">
                <div className="toggle-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="notifyOnSearch"
                      checked={settings.notifyOnSearch}
                      onChange={handleChange}
                    />
                    <span className="toggle-switch"></span>
                    <span className="toggle-text">
                      <strong>🔍 Product Search Alerts</strong>
                      <small>When buyers search for products you sell</small>
                    </span>
                  </label>
                </div>

                <div className="toggle-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="notifyOnNewOrder"
                      checked={settings.notifyOnNewOrder}
                      onChange={handleChange}
                    />
                    <span className="toggle-switch"></span>
                    <span className="toggle-text">
                      <strong>🛒 New Order Alerts</strong>
                      <small>When you receive a new order</small>
                    </span>
                  </label>
                </div>

                <div className="toggle-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      name="notifyOnPayment"
                      checked={settings.notifyOnPayment}
                      onChange={handleChange}
                    />
                    <span className="toggle-switch"></span>
                    <span className="toggle-text">
                      <strong>💰 Payment Alerts</strong>
                      <small>When payment is received for an order</small>
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Sample Notification */}
          <div className="form-section sample-section">
            <h3>📋 Sample Notification</h3>
            <div className="sample-notification">
              <div className="whatsapp-preview">
                <div className="whatsapp-header">
                  <span className="whatsapp-icon">📱</span>
                  <span>WhatsApp</span>
                </div>
                <div className="whatsapp-message">
                  <strong>🔍 Product Interest Alert!</strong>
                  <br /><br />
                  Hi {user?.companyName || 'Supplier'},
                  <br /><br />
                  A buyer is looking for products you sell!
                  <br /><br />
                  🔎 <strong>Search:</strong> "Industrial Machine"
                  <br />
                  📍 <strong>Location:</strong> Mumbai
                  <br />
                  📦 <strong>Your Matching Products:</strong> 5
                  <br /><br />
                  💡 <strong>Tip:</strong> Make sure your products are well-stocked!
                  <br /><br />
                  <em>MarketPlus B2B Marketplace</em>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="test-btn"
              onClick={handleTestNotification}
              disabled={testSending || !settings.whatsappNumber}
            >
              {testSending ? '📤 Sending...' : '🧪 Send Test Notification'}
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={saving}
            >
              {saving ? '💾 Saving...' : '💾 Save Settings'}
            </button>
          </div>
        </form>

        {/* Info Section */}
        <div className="info-section">
          <h3>ℹ️ About WhatsApp Notifications</h3>
          <ul>
            <li>📱 Notifications are sent directly to your WhatsApp</li>
            <li>🔒 Your number is kept private and never shared with buyers</li>
            <li>⏰ Rate-limited to avoid spam (max 1 per 5 minutes per notification type)</li>
            <li>🛑 You can disable notifications anytime</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
