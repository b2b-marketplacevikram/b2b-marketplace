import { useState } from 'react'
import './BankTransferDetails.css'

const BankTransferDetails = ({ orderNumber, amount, onCopySuccess }) => {
  const [copied, setCopied] = useState('')

  // Bank details - In production, these would come from backend/config
  const bankDetails = {
    accountName: 'B2B Marketplace Pvt Ltd',
    accountNumber: '1234567890123456',
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0001234',
    branch: 'Electronic City Branch, Bangalore',
    swiftCode: 'SBININBB123', // For international transfers
    upiId: 'b2bmarketplace@sbi'
  }

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 2000)
    if (onCopySuccess) onCopySuccess(field)
  }

  const copyAll = () => {
    const allDetails = `
Bank Transfer Details for Order #${orderNumber}
Amount: $${amount?.toFixed(2) || '0.00'}

Account Name: ${bankDetails.accountName}
Account Number: ${bankDetails.accountNumber}
Bank Name: ${bankDetails.bankName}
IFSC Code: ${bankDetails.ifscCode}
Branch: ${bankDetails.branch}
SWIFT Code: ${bankDetails.swiftCode}
UPI ID: ${bankDetails.upiId}

Important: Please include order number "${orderNumber}" in the payment reference.
    `.trim()
    
    navigator.clipboard.writeText(allDetails)
    setCopied('all')
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="bank-transfer-details">
      <div className="bank-header">
        <div className="bank-icon">🏦</div>
        <div className="bank-title">
          <h3>Bank Transfer Details</h3>
          <p>Transfer the amount to complete your order</p>
        </div>
      </div>

      <div className="amount-box">
        <span className="amount-label">Amount to Transfer</span>
        <span className="amount-value">${amount?.toFixed(2) || '0.00'}</span>
      </div>

      <div className="bank-details-grid">
        <div className="detail-row">
          <div className="detail-label">Account Name</div>
          <div className="detail-value">
            <span>{bankDetails.accountName}</span>
            <button 
              className={`copy-btn ${copied === 'accountName' ? 'copied' : ''}`}
              onClick={() => handleCopy(bankDetails.accountName, 'accountName')}
            >
              {copied === 'accountName' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Account Number</div>
          <div className="detail-value">
            <span className="mono">{bankDetails.accountNumber}</span>
            <button 
              className={`copy-btn ${copied === 'accountNumber' ? 'copied' : ''}`}
              onClick={() => handleCopy(bankDetails.accountNumber, 'accountNumber')}
            >
              {copied === 'accountNumber' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Bank Name</div>
          <div className="detail-value">
            <span>{bankDetails.bankName}</span>
            <button 
              className={`copy-btn ${copied === 'bankName' ? 'copied' : ''}`}
              onClick={() => handleCopy(bankDetails.bankName, 'bankName')}
            >
              {copied === 'bankName' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">IFSC Code</div>
          <div className="detail-value">
            <span className="mono">{bankDetails.ifscCode}</span>
            <button 
              className={`copy-btn ${copied === 'ifscCode' ? 'copied' : ''}`}
              onClick={() => handleCopy(bankDetails.ifscCode, 'ifscCode')}
            >
              {copied === 'ifscCode' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">Branch</div>
          <div className="detail-value">
            <span>{bankDetails.branch}</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="detail-label">SWIFT Code</div>
          <div className="detail-value">
            <span className="mono">{bankDetails.swiftCode}</span>
            <button 
              className={`copy-btn ${copied === 'swiftCode' ? 'copied' : ''}`}
              onClick={() => handleCopy(bankDetails.swiftCode, 'swiftCode')}
            >
              {copied === 'swiftCode' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="detail-row upi-row">
          <div className="detail-label">UPI ID</div>
          <div className="detail-value">
            <span className="mono">{bankDetails.upiId}</span>
            <button 
              className={`copy-btn ${copied === 'upiId' ? 'copied' : ''}`}
              onClick={() => handleCopy(bankDetails.upiId, 'upiId')}
            >
              {copied === 'upiId' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <div className="reference-box">
        <div className="reference-icon">⚠️</div>
        <div className="reference-content">
          <strong>Important: Include this reference in your payment</strong>
          <div className="reference-number">
            <span>{orderNumber}</span>
            <button 
              className={`copy-btn ${copied === 'reference' ? 'copied' : ''}`}
              onClick={() => handleCopy(orderNumber, 'reference')}
            >
              {copied === 'reference' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <button className={`copy-all-btn ${copied === 'all' ? 'copied' : ''}`} onClick={copyAll}>
        {copied === 'all' ? '✓ All Details Copied!' : '📋 Copy All Details'}
      </button>

      <div className="bank-instructions">
        <h4>How to complete your payment:</h4>
        <ol>
          <li>Log in to your bank's internet/mobile banking</li>
          <li>Add the above account as a beneficiary</li>
          <li>Transfer the exact amount shown above</li>
          <li>Include the order number <strong>{orderNumber}</strong> in remarks/reference</li>
          <li>Your order will be processed within 24 hours of payment confirmation</li>
        </ol>
      </div>

      <div className="bank-note">
        <p>💡 <strong>Tip:</strong> For faster processing, you can also pay via UPI using the UPI ID above.</p>
        <p>📧 After making the payment, you can email the transaction receipt to <a href="mailto:payments@b2bmarketplace.com">payments@b2bmarketplace.com</a> for quicker verification.</p>
      </div>
    </div>
  )
}

export default BankTransferDetails
