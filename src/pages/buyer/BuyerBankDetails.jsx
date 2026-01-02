import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { refundAPI } from '../../services/api'
import './BuyerBankDetails.css'

function BuyerBankDetails() {
  const { user } = useAuth()
  const [bankDetails, setBankDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    swiftCode: '',
    branchName: '',
    isPrimary: false
  })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
  }

  useEffect(() => {
    if (user?.id) {
      fetchBankDetails()
    }
  }, [user])

  const fetchBankDetails = async () => {
    try {
      setLoading(true)
      const result = await refundAPI.getBuyerBankDetails(user.id)
      if (result.success) {
        setBankDetails(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching bank details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.bankName || !formData.accountHolderName || !formData.accountNumber) {
      showToast('Please fill in required fields', 'error')
      return
    }

    try {
      setSaving(true)
      
      let result
      if (editingId) {
        result = await refundAPI.updateBuyerBankDetails(editingId, formData)
      } else {
        result = await refundAPI.addBuyerBankDetails(user.id, formData)
      }

      if (result.success) {
        showToast(editingId ? 'Bank details updated!' : 'Bank details added!', 'success')
        setShowAddModal(false)
        setEditingId(null)
        resetForm()
        fetchBankDetails()
      } else {
        showToast(result.message || 'Failed to save bank details', 'error')
      }
    } catch (error) {
      showToast('Failed to save bank details', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (details) => {
    setFormData({
      bankName: details.bankName || '',
      accountHolderName: details.accountHolderName || '',
      accountNumber: details.accountNumber || '',
      ifscCode: details.ifscCode || '',
      upiId: details.upiId || '',
      swiftCode: details.swiftCode || '',
      branchName: details.branchName || '',
      isPrimary: details.isPrimary || false
    })
    setEditingId(details.id)
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return

    try {
      const result = await refundAPI.deleteBuyerBankDetails(id)
      if (result.success) {
        showToast('Bank details deleted', 'success')
        fetchBankDetails()
      } else {
        showToast('Failed to delete bank details', 'error')
      }
    } catch (error) {
      showToast('Failed to delete bank details', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
      swiftCode: '',
      branchName: '',
      isPrimary: false
    })
  }

  const maskAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber
    return '•'.repeat(accountNumber.length - 4) + accountNumber.slice(-4)
  }

  if (loading) {
    return (
      <div className="bank-details-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading bank details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bank-details-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-header">
        <div className="header-content">
          <h1>🏦 Bank Details</h1>
          <p>Manage your bank accounts for receiving refunds</p>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setEditingId(null); setShowAddModal(true) }}>
          + Add Bank Account
        </button>
      </div>

      {bankDetails.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏦</div>
          <h2>No Bank Accounts Added</h2>
          <p>Add your bank account details to receive refunds directly to your account</p>
          <button className="add-first-btn" onClick={() => setShowAddModal(true)}>
            + Add Your First Bank Account
          </button>
        </div>
      ) : (
        <div className="bank-cards-grid">
          {bankDetails.map(details => (
            <div key={details.id} className={`bank-card ${details.isPrimary ? 'primary' : ''}`}>
              {details.isPrimary && <span className="primary-badge">Primary</span>}
              <div className="bank-card-header">
                <div className="bank-icon">🏦</div>
                <div className="bank-info">
                  <h3>{details.bankName}</h3>
                  <p>{details.branchName || 'Branch not specified'}</p>
                </div>
              </div>
              <div className="bank-card-body">
                <div className="detail-row">
                  <span className="label">Account Holder</span>
                  <span className="value">{details.accountHolderName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Account Number</span>
                  <span className="value account-number">{maskAccountNumber(details.accountNumber)}</span>
                </div>
                {details.ifscCode && (
                  <div className="detail-row">
                    <span className="label">IFSC Code</span>
                    <span className="value">{details.ifscCode}</span>
                  </div>
                )}
                {details.upiId && (
                  <div className="detail-row">
                    <span className="label">UPI ID</span>
                    <span className="value">{details.upiId}</span>
                  </div>
                )}
              </div>
              <div className="bank-card-actions">
                <button className="edit-btn" onClick={() => handleEdit(details)}>
                  ✏️ Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(details.id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="bank-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? '✏️ Edit Bank Account' : '➕ Add Bank Account'}</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Bank Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="e.g., State Bank of India"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Branch Name</label>
                    <input
                      type="text"
                      name="branchName"
                      value={formData.branchName}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Branch"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Account Holder Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleInputChange}
                    placeholder="Enter account holder name"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Account Number <span className="required">*</span></label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>IFSC Code</label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      placeholder="e.g., SBIN0001234"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>UPI ID (Optional)</label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      placeholder="e.g., yourname@upi"
                    />
                  </div>
                  <div className="form-group">
                    <label>SWIFT Code (For International)</label>
                    <input
                      type="text"
                      name="swiftCode"
                      value={formData.swiftCode}
                      onChange={handleInputChange}
                      placeholder="e.g., SBININBB"
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isPrimary"
                      checked={formData.isPrimary}
                      onChange={handleInputChange}
                    />
                    <span>Set as primary account for refunds</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : (editingId ? 'Update Account' : 'Add Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuyerBankDetails
