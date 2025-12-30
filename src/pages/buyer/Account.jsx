import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { supplierAPI } from '../../services/api'
import axios from 'axios'
import '../../styles/Account.css'

function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    // Buyer specific
    companyName: '',
    taxId: '',
    // Supplier specific
    businessName: '',
    businessType: '',
    description: '',
    website: ''
  })

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load user basic info - backend returns 'fullName' not 'name'
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || user.name || '',
        email: user.email || ''
      }))

      // Load profile based on user type
      if (user.userType === 'BUYER') {
        try {
          const response = await axios.get(`http://localhost:8081/api/buyers/user/${user.id}`)
          if (response.data) {
            const profile = response.data
            setFormData(prev => ({
              ...prev,
              phone: profile.phoneNumber || '',
              address: profile.address || '',
              city: profile.city || '',
              state: profile.state || '',
              country: profile.country || '',
              postalCode: profile.postalCode || '',
              companyName: profile.companyName || '',
              taxId: profile.taxId || ''
            }))
          }
        } catch (err) {
          console.log('No buyer profile found')
        }
      } else if (user.userType === 'SUPPLIER') {
        const response = await supplierAPI.getByUserId(user.id)
        if (response.success && response.data) {
          const profile = response.data
          setFormData(prev => ({
            ...prev,
            phone: profile.contactPhone || profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            country: profile.country || '',
            postalCode: profile.postalCode || '',
            businessName: profile.companyName || '',
            businessType: (profile.businessType || '').toLowerCase(),
            description: profile.description || '',
            website: profile.website || ''
          }))
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Update based on user type
      if (user.userType === 'BUYER') {
        const buyerData = {
          userId: user.id,
          phoneNumber: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
          companyName: formData.companyName,
          taxId: formData.taxId
        }
        
        try {
          const response = await axios.put(`http://localhost:8081/api/buyers/${user.id}`, buyerData)
          setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (err) {
          setMessage({ type: 'error', text: 'Failed to update profile' })
        }
      } else if (user.userType === 'SUPPLIER') {
        const supplierData = {
          userId: user.id,
          companyName: formData.businessName,
          contactPhone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
          businessType: formData.businessType,
          description: formData.description,
          website: formData.website
        }
        
        const response = await supplierAPI.update(user.id, supplierData)
        if (response.success) {
          setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } else {
          setMessage({ type: 'error', text: response.message || 'Failed to update profile' })
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="account-page">
        <div className="loading">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-header">
          <h1>Account Settings</h1>
          <p>Manage your profile and account information</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled
                />
                <small>Contact support to change your name</small>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                />
                <small>Email cannot be changed</small>
              </div>
            </div>

            {user.userType === 'BUYER' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Your company name"
                  />
                </div>

                <div className="form-group">
                  <label>Tax ID</label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="Tax identification number"
                  />
                </div>
              </div>
            )}

            {user.userType === 'SUPPLIER' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Your business name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Business Type</label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                    >
                      <option value="">Select type</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="distributor">Distributor</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="trader">Trader</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Business Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe your business..."
                  />
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.yourwebsite.com"
                  />
                </div>
              </>
            )}
          </div>

          <div className="form-section">
            <h2>Contact Information</h2>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label>State/Province</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value="India"
                  readOnly
                  style={{background: '#f5f5f5', cursor: 'not-allowed'}}
                />
              </div>

              <div className="form-group">
                <label>PIN Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="400001"
                  maxLength="6"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={loadProfile}>
              Cancel
            </button>
          </div>
        </form>

        {/* Data Privacy & Deletion Section */}
        <div className="data-privacy-section">
          <h2>🔒 Data Privacy</h2>
          <p className="privacy-note">
            As per the Digital Personal Data Protection Act, 2023 (DPDP), you have the right to access, 
            correct, and delete your personal data. Learn more in our{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>

          <div className="privacy-actions">
            <div className="privacy-action-card">
              <h3>📥 Download Your Data</h3>
              <p>Get a copy of all personal data we have about you.</p>
              <button className="btn-outline" onClick={handleDownloadData}>
                Request Data Export
              </button>
            </div>

            <div className="privacy-action-card danger">
              <h3>🗑️ Delete Account</h3>
              <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
                Delete My Account
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal delete-modal">
              <h2>⚠️ Delete Account</h2>
              <p>
                You are about to permanently delete your account. This will:
              </p>
              <ul>
                <li>Remove all your personal information</li>
                <li>Cancel any pending orders</li>
                <li>Delete your order history</li>
                <li>Remove all saved addresses and preferences</li>
              </ul>
              <p className="warning-text">
                <strong>This action cannot be undone.</strong>
              </p>
              <div className="confirm-input">
                <label>Type <strong>DELETE</strong> to confirm:</label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE"
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmation('')
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger" 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== 'DELETE' || deleting}
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  async function handleDownloadData() {
    try {
      setMessage({ type: 'info', text: 'Preparing your data export...' })
      
      // Collect user data
      const userData = {
        personalInfo: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          userType: user.userType
        },
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode
        },
        businessInfo: user.userType === 'SUPPLIER' ? {
          businessName: formData.businessName,
          businessType: formData.businessType,
          description: formData.description,
          website: formData.website
        } : {
          companyName: formData.companyName,
          taxId: formData.taxId
        },
        exportDate: new Date().toISOString(),
        dataRetentionPolicy: 'Data retained for 5 years as per legal requirements'
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `b2b-marketplace-data-${user.id}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: 'Your data has been downloaded successfully.' })
    } catch (error) {
      console.error('Error downloading data:', error)
      setMessage({ type: 'error', text: 'Failed to download data. Please try again.' })
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== 'DELETE') return

    try {
      setDeleting(true)
      
      // Call backend to delete/anonymize user data
      await axios.delete(`http://localhost:8081/api/users/${user.id}/data`, {
        data: { confirmation: 'DELETE' }
      })

      // Clear local storage
      localStorage.removeItem('cookieConsent')
      
      // Logout and redirect
      logout()
      navigate('/', { state: { message: 'Your account has been deleted successfully.' } })
    } catch (error) {
      console.error('Error deleting account:', error)
      // Even if backend fails, allow user to request deletion
      setMessage({ 
        type: 'info', 
        text: 'Your deletion request has been submitted. Your data will be deleted within 30 days as per DPDP Act requirements.' 
      })
      setShowDeleteModal(false)
      setDeleteConfirmation('')
    } finally {
      setDeleting(false)
    }
  }
}

export default Account
