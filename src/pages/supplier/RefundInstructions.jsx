import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { disputeAPI, orderAPI } from '../../services/api'
import './RefundInstructions.css'

function RefundInstructions() {
  const { ticketNumber } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  const [dispute, setDispute] = useState(location.state?.dispute || null)
  const [buyerBankDetails, setBuyerBankDetails] = useState(null)
  const [loading, setLoading] = useState(!dispute)
  const [uploading, setUploading] = useState(false)
  const [refundProof, setRefundProof] = useState(null)
  const [transactionId, setTransactionId] = useState('')
  const [bankName, setBankName] = useState('')
  const [transactionDate, setTransactionDate] = useState('')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [submitted, setSubmitted] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [selectedBank, setSelectedBank] = useState('')

  // Bank list with NetBanking URLs
  const bankList = [
    { name: 'State Bank of India (SBI)', url: 'https://www.onlinesbi.sbi/' },
    { name: 'HDFC Bank', url: 'https://netbanking.hdfcbank.com/' },
    { name: 'ICICI Bank', url: 'https://www.icicibank.com/online-banking' },
    { name: 'Axis Bank', url: 'https://www.axisbank.com/bank-smart/internet-banking' },
    { name: 'Kotak Mahindra Bank', url: 'https://www.kotak.com/en/digital-banking/ways-to-bank/net-banking.html' },
    { name: 'Punjab National Bank', url: 'https://netbanking.pnb.co.in/' },
    { name: 'Bank of Baroda', url: 'https://www.barodaconnect.com/' },
    { name: 'Canara Bank', url: 'https://netbanking.canarabank.in/' },
    { name: 'Union Bank of India', url: 'https://www.unionbankofindia.co.in/english/internet-banking.aspx' },
    { name: 'Bank of India', url: 'https://bankofindia.co.in/internet-banking' },
    { name: 'IndusInd Bank', url: 'https://indusnet.indusind.com/' },
    { name: 'Yes Bank', url: 'https://netbanking.yesbank.in/' },
    { name: 'IDBI Bank', url: 'https://www.idbibank.in/internet-banking.asp' },
    { name: 'Federal Bank', url: 'https://www.federalbank.co.in/internet-banking' },
    { name: 'South Indian Bank', url: 'https://www.southindianbank.com/content/personal-banking/digital-banking/internet-banking' },
  ]

  useEffect(() => {
    if (!dispute) {
      fetchDisputeDetails()
    } else {
      fetchBuyerBankDetails()
    }
  }, [ticketNumber, dispute])

  const fetchBuyerBankDetails = async () => {
    try {
      const result = await disputeAPI.getBuyerBankDetailsForDispute(ticketNumber)
      if (result.success && result.data) {
        setBuyerBankDetails(result.data)
      }
    } catch (error) {
      console.error('Error fetching buyer bank details:', error)
    }
  }

  const fetchDisputeDetails = async () => {
    try {
      setLoading(true)
      const result = await disputeAPI.getByTicketNumber(ticketNumber)
      if (result.success && result.data?.data) {
        setDispute(result.data.data)
        // Fetch bank details after dispute is loaded
        await fetchBuyerBankDetails()
      } else {
        setMessage({ type: 'error', text: 'Failed to load dispute details' })
      }
    } catch (error) {
      console.error('Error fetching dispute:', error)
      setMessage({ type: 'error', text: 'Failed to load dispute details' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please upload an image file (PNG, JPG, etc.)' })
        return
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 10MB' })
        return
      }
      setRefundProof(file)
      setMessage({ type: '', text: '' })
    }
  }

  const handleSubmitRefund = async (e) => {
    e.preventDefault()
    
    if (!transactionId.trim()) {
      setMessage({ type: 'error', text: 'Please enter the transaction ID/reference number' })
      return
    }
    
    if (!bankName.trim()) {
      setMessage({ type: 'error', text: 'Please enter your bank name' })
      return
    }
    
    if (!refundProof) {
      setMessage({ type: 'error', text: 'Please upload refund proof (screenshot or receipt)' })
      return
    }

    try {
      setUploading(true)
      
      // Step 1: Upload the proof file
      const formData = new FormData()
      formData.append('file', refundProof)
      
      const uploadResult = await disputeAPI.uploadRefundProof(formData)
      
      if (!uploadResult.success) {
        setMessage({ 
          type: 'error', 
          text: uploadResult.message || 'Failed to upload proof. Please try again.' 
        })
        return
      }

      // Step 2: Submit the refund transaction with the uploaded file URL
      const proofUrl = `http://localhost:8083${uploadResult.url}`
      
      const result = await disputeAPI.submitRefundTransaction(ticketNumber, {
        transactionId: transactionId.trim(),
        bankName: bankName.trim(),
        transactionDate: transactionDate || new Date().toISOString(),
        proofUrl: proofUrl,
        notes: notes.trim()
      })

      if (result.success) {
        setSubmitted(true)
        setMessage({ 
          type: 'success', 
          text: 'Refund transaction submitted successfully! The buyer will verify and confirm receipt.' 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message || 'Failed to submit refund transaction. Please try again.' 
        })
      }
    } catch (error) {
      console.error('Error submitting refund:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit refund transaction. Please try again.' 
      })
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    setMessage({ type: 'success', text: `${label} copied to clipboard!` })
    setTimeout(() => {
      setMessage({ type: '', text: '' })
      setCopiedField(null)
    }, 2000)
  }

  const handleBankSelect = (e) => {
    const bankUrl = e.target.value
    setSelectedBank(bankUrl)
    if (bankUrl) {
      window.open(bankUrl, '_blank')
      setMessage({ type: 'info', text: 'Bank website opened in new tab. Complete your transfer there.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 4000)
    }
  }

  const copyAllBankDetails = () => {
    const details = `
Bank Name: ${buyerBankDetails?.bankName || 'N/A'}
Account Name: ${buyerBankDetails?.accountHolderName || 'N/A'}
Account Number: ${buyerBankDetails?.accountNumber || 'N/A'}
IFSC Code: ${buyerBankDetails?.ifscCode || 'N/A'}
${buyerBankDetails?.branchName ? `Branch: ${buyerBankDetails.branchName}` : ''}

Refund Amount: ₹${dispute?.refundAmount?.toFixed(2) || '0.00'}
Reference: Dispute #${ticketNumber}
    `.trim()
    
    navigator.clipboard.writeText(details)
    setMessage({ type: 'success', text: 'All buyer bank details copied to clipboard!' })
    setTimeout(() => setMessage({ type: '', text: '' }), 2000)
  }

  if (loading) {
    return (
      <div className="refund-instructions-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading refund details...</p>
        </div>
      </div>
    )
  }

  if (!dispute) {
    return (
      <div className="refund-instructions-page">
        <div className="error-state">
          <h2>Dispute Not Found</h2>
          <p>Unable to load dispute details.</p>
          <button onClick={() => navigate('/supplier/disputes')}>Back to Disputes</button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="refund-instructions-page">
        <div className="success-state">
          <div className="success-icon">✅</div>
          <h2>Refund Transaction Submitted!</h2>
          <p>Your refund transaction details have been submitted successfully.</p>
          <p>The buyer will verify the refund and confirm receipt.</p>
          
          <div className="transaction-summary">
            <h3>Transaction Summary</h3>
            <div className="summary-item">
              <span className="label">Transaction ID:</span>
              <span className="value">{transactionId}</span>
            </div>
            <div className="summary-item">
              <span className="label">Bank:</span>
              <span className="value">{bankName}</span>
            </div>
            <div className="summary-item">
              <span className="label">Amount:</span>
              <span className="value">₹{dispute.refundAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="btn-secondary"
              onClick={() => navigate(`/supplier/disputes/${ticketNumber}`)}
            >
              View Dispute Details
            </button>
            <button 
              className="btn-primary"
              onClick={() => navigate('/supplier/disputes')}
            >
              Back to Disputes
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="refund-instructions-page">
      <div className="refund-instructions-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate(`/supplier/disputes/${ticketNumber}`)}>
              ← Back
            </button>
            <div>
              <h1>💸 Submit Refund Transaction</h1>
              <p className="subtitle">Process refund for Dispute #{dispute.ticketNumber}</p>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`message-banner ${message.type}`}>
            <span className="icon">
              {message.type === 'success' && '✓'}
              {message.type === 'error' && '⚠'}
              {message.type === 'info' && 'ℹ'}
            </span>
            {message.text}
          </div>
        )}

        <div className="content-grid">
          {/* Left Column - Refund Details */}
          <div className="refund-details-section">
            <div className="card">
              <div className="card-header">
                <h2>📋 Refund Details</h2>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="label">Dispute Ticket:</span>
                  <span className="value">#{dispute.ticketNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Order Number:</span>
                  <span className="value">{dispute.orderNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Refund Amount:</span>
                  <span className="value amount">₹{dispute.refundAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Buyer:</span>
                  <span className="value">{dispute.buyerName || 'Buyer'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Resolution:</span>
                  <span className="value">{dispute.resolutionTypeLabel || 'Refund'}</span>
                </div>
              </div>
            </div>

            {/* Buyer Bank Details */}
            <div className="card">
              <div className="card-header">
                <h3>🏦 Buyer's Bank Details</h3>
                {buyerBankDetails && (
                  <button
                    type="button"
                    className="btn-copy-all"
                    onClick={copyAllBankDetails}
                  >
                    📋 Copy All Details
                  </button>
                )}
              </div>
              <div className="card-body">
                {buyerBankDetails ? (
                  <>
                    <div className="bank-detail-item">
                      <span className="label">Bank Name:</span>
                      <div className="value-group">
                        <span className="value">{buyerBankDetails.bankName}</span>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(buyerBankDetails.bankName, 'Bank Name')}
                        >
                          {copiedField === 'Bank Name' ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>

                    <div className="bank-detail-item">
                      <span className="label">Account Name:</span>
                      <div className="value-group">
                        <span className="value">{buyerBankDetails.accountHolderName}</span>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(buyerBankDetails.accountHolderName, 'Account Name')}
                        >
                          {copiedField === 'Account Name' ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>

                    <div className="bank-detail-item">
                      <span className="label">Account Number:</span>
                      <div className="value-group">
                        <span className="value">{buyerBankDetails.accountNumber}</span>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(buyerBankDetails.accountNumber, 'Account Number')}
                        >
                          {copiedField === 'Account Number' ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>

                    <div className="bank-detail-item">
                      <span className="label">IFSC Code:</span>
                      <div className="value-group">
                        <span className="value">{buyerBankDetails.ifscCode}</span>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(buyerBankDetails.ifscCode, 'IFSC Code')}
                        >
                          {copiedField === 'IFSC Code' ? '✓' : '📋'}
                        </button>
                      </div>
                    </div>

                    {buyerBankDetails.branchName && (
                      <div className="bank-detail-item">
                        <span className="label">Branch:</span>
                        <div className="value-group">
                          <span className="value">{buyerBankDetails.branchName}</span>
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={() => copyToClipboard(buyerBankDetails.branchName, 'Branch')}
                          >
                            {copiedField === 'Branch' ? '✓' : '📋'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Refund Amount Highlight */}
                    <div className="amount-highlight">
                      <div className="amount-row">
                        <span className="amount-label">Refund Amount:</span>
                        <div className="value-group">
                          <span className="amount-value">₹{dispute.refundAmount?.toFixed(2)}</span>
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={() => copyToClipboard(dispute.refundAmount?.toFixed(2), 'Amount')}
                          >
                            {copiedField === 'Amount' ? '✓' : '📋'}
                          </button>
                        </div>
                      </div>
                      <div className="reference-row">
                        <span className="label">Use Reference:</span>
                        <div className="value-group">
                          <span className="value">Dispute-{ticketNumber}</span>
                          <button
                            type="button"
                            className="copy-btn"
                            onClick={() => copyToClipboard(`Dispute-${ticketNumber}`, 'Reference')}
                          >
                            {copiedField === 'Reference' ? '✓' : '📋'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-bank-details">
                    <p>Buyer's bank details not available</p>
                    <small>Contact buyer for bank account information</small>
                  </div>
                )}

                {/* Quick NetBanking Transfer - Always show */}
                <div className="netbanking-section">
                  <label>🏦 Quick transfer via NetBanking:</label>
                  <select
                    value={selectedBank}
                    onChange={handleBankSelect}
                    className="bank-select"
                  >
                    <option value="">-- Select Your Bank --</option>
                    {bankList.map((bank, index) => (
                      <option key={index} value={bank.url}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  <small className="help-text">
                    Select your bank to open NetBanking in a new tab
                  </small>
                </div>
              </div>
            </div>

            <div className="card info-card">
              <div className="card-header">
                <h3>💡 Instructions</h3>
              </div>
              <div className="card-body">
                <ol className="instructions-list">
                  <li>Transfer <strong>₹{dispute.refundAmount?.toFixed(2)}</strong> to the buyer's bank account</li>
                  <li>Note down the transaction ID/UTR number</li>
                  <li>Take a screenshot of the transaction confirmation</li>
                  <li>Fill in the transaction details below</li>
                  <li>Upload the payment proof screenshot</li>
                  <li>Submit for buyer verification</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right Column - Submit Form */}
          <div className="submit-section">
            <div className="card">
              <div className="card-header">
                <h2>📝 Submit Refund Transaction</h2>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmitRefund}>
                  <div className="form-group">
                    <label>
                      Transaction ID / UTR Number <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction reference number"
                      required
                      disabled={uploading}
                    />
                    <small className="help-text">
                      Enter the unique transaction reference from your bank statement
                    </small>
                  </div>

                  <div className="form-group">
                    <label>
                      Your Bank Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., State Bank of India"
                      required
                      disabled={uploading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Transaction Date & Time</label>
                    <input
                      type="datetime-local"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      disabled={uploading}
                    />
                    <small className="help-text">Leave blank to use current date/time</small>
                  </div>

                  <div className="form-group">
                    <label>
                      Payment Proof / Screenshot <span className="required">*</span>
                    </label>
                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="refund-proof"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="refund-proof" className="file-upload-label">
                        {refundProof ? (
                          <div className="file-selected">
                            <span className="file-icon">📄</span>
                            <div className="file-info">
                              <span className="file-name">{refundProof.name}</span>
                              <span className="file-size">
                                {(refundProof.size / 1024).toFixed(2)} KB
                              </span>
                            </div>
                            <span className="check-icon">✓</span>
                          </div>
                        ) : (
                          <div className="file-placeholder">
                            <span className="upload-icon">📤</span>
                            <span className="upload-text">Click to upload screenshot</span>
                            <span className="upload-hint">PNG, JPG up to 10MB</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Additional Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional information about the refund transaction..."
                      rows="3"
                      disabled={uploading}
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => navigate(`/supplier/disputes/${ticketNumber}`)}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <span className="spinner-small"></span>
                          Submitting...
                        </>
                      ) : (
                        '✓ Submit Refund Transaction'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefundInstructions
