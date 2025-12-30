import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { orderAPI } from '../../services/api'
import './BankDetails.css'

function BankDetails() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: '',
    swiftCode: '',
    branchName: '',
    branchAddress: '',
    isPrimary: true
  })
  const [hasExistingDetails, setHasExistingDetails] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadBankDetails()
    }
  }, [user])

  const loadBankDetails = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getSupplierBankDetails(user.id)
      
      if (response.success && response.data && response.data.id) {
        setFormData({
          bankName: response.data.bankName || '',
          accountHolderName: response.data.accountHolderName || '',
          accountNumber: response.data.accountNumber || '',
          confirmAccountNumber: response.data.accountNumber || '',
          ifscCode: response.data.ifscCode || '',
          upiId: response.data.upiId || '',
          swiftCode: response.data.swiftCode || '',
          branchName: response.data.branchName || '',
          branchAddress: response.data.branchAddress || '',
          isPrimary: response.data.isPrimary ?? true
        })
        setHasExistingDetails(true)
      }
    } catch (error) {
      console.error('Error loading bank details:', error)
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

  const validateForm = () => {
    if (!formData.bankName.trim()) {
      setMessage({ type: 'error', text: 'Bank name is required' })
      return false
    }
    if (!formData.accountHolderName.trim()) {
      setMessage({ type: 'error', text: 'Account holder name is required' })
      return false
    }
    if (!formData.accountNumber.trim()) {
      setMessage({ type: 'error', text: 'Account number is required' })
      return false
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setMessage({ type: 'error', text: 'Account numbers do not match' })
      return false
    }
    if (!formData.ifscCode.trim()) {
      setMessage({ type: 'error', text: 'IFSC code is required' })
      return false
    }
    // Validate IFSC format (11 characters, first 4 letters, 5th is 0, last 6 alphanumeric)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    if (!ifscRegex.test(formData.ifscCode.toUpperCase())) {
      setMessage({ type: 'error', text: 'Invalid IFSC code format (e.g., HDFC0001234)' })
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      
      const response = await orderAPI.saveSupplierBankDetails(user.id, {
        bankName: formData.bankName.trim(),
        accountHolderName: formData.accountHolderName.trim(),
        accountNumber: formData.accountNumber.trim(),
        ifscCode: formData.ifscCode.toUpperCase().trim(),
        upiId: formData.upiId.trim() || null,
        swiftCode: formData.swiftCode.trim() || null,
        branchName: formData.branchName.trim() || null,
        branchAddress: formData.branchAddress.trim() || null,
        isPrimary: formData.isPrimary
      })
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Bank details saved successfully!' })
        setHasExistingDetails(true)
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to save bank details' })
      }
    } catch (error) {
      console.error('Error saving bank details:', error)
      setMessage({ type: 'error', text: 'An error occurred while saving bank details' })
    } finally {
      setSaving(false)
    }
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
      <div className="bank-details-container">
        <div className="page-header">
          <h1>🏦 Bank Account Details</h1>
          <p>Add your bank account details to receive payments from buyers</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? '✓' : '⚠'} {message.text}
          </div>
        )}

        {hasExistingDetails && (
          <div className="info-banner">
            <span className="info-icon">ℹ️</span>
            <p>Your bank details are already saved. You can update them below.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bank-details-form">
          <div className="form-section">
            <h2>Bank Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bankName">Bank Name *</label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="e.g., HDFC Bank"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="branchName">Branch Name</label>
                <input
                  type="text"
                  id="branchName"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="e.g., Koramangala Branch"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="branchAddress">Branch Address</label>
              <input
                type="text"
                id="branchAddress"
                name="branchAddress"
                value={formData.branchAddress}
                onChange={handleInputChange}
                placeholder="Full branch address"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Account Details</h2>
            
            <div className="form-group">
              <label htmlFor="accountHolderName">Account Holder Name *</label>
              <input
                type="text"
                id="accountHolderName"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                placeholder="Name as per bank records"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accountNumber">Account Number *</label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Your bank account number"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmAccountNumber">Confirm Account Number *</label>
                <input
                  type="text"
                  id="confirmAccountNumber"
                  name="confirmAccountNumber"
                  value={formData.confirmAccountNumber}
                  onChange={handleInputChange}
                  placeholder="Re-enter account number"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ifscCode">IFSC Code *</label>
                <input
                  type="text"
                  id="ifscCode"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="e.g., HDFC0001234"
                  maxLength={11}
                  style={{ textTransform: 'uppercase' }}
                  required
                />
                <small>11 character code (e.g., HDFC0001234)</small>
              </div>
              <div className="form-group">
                <label htmlFor="swiftCode">SWIFT Code (for international transfers)</label>
                <input
                  type="text"
                  id="swiftCode"
                  name="swiftCode"
                  value={formData.swiftCode}
                  onChange={handleInputChange}
                  placeholder="e.g., HDFCINBB"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>UPI Details (Optional)</h2>
            <p className="section-description">Add your UPI ID for quick payments</p>
            
            <div className="form-group">
              <label htmlFor="upiId">UPI ID</label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                placeholder="e.g., yourname@upi or yourname@bankname"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : hasExistingDetails ? (
                'Update Bank Details'
              ) : (
                'Save Bank Details'
              )}
            </button>
          </div>

          <div className="security-note">
            <span className="lock-icon">🔒</span>
            <p>
              Your bank details are encrypted and stored securely. 
              We never share your banking information with third parties.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BankDetails
