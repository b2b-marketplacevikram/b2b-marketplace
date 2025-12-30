import { Link } from 'react-router-dom'
import '../../styles/LegalPages.css'

function GrievanceOfficer() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Grievance Redressal</h1>
          <p className="effective-date">As per Consumer Protection Act, 2019 & E-Commerce Rules, 2020</p>
        </div>

        <div className="legal-content">
          <section className="highlight-section">
            <h2>📋 Grievance Redressal Mechanism</h2>
            <p>
              In compliance with the <strong>Consumer Protection Act, 2019</strong> and 
              <strong> Consumer Protection (E-Commerce) Rules, 2020</strong>, we have established 
              a robust grievance redressal mechanism to address your concerns promptly.
            </p>
          </section>

          <section>
            <h2>⏱️ Response Timeline Commitment</h2>
            <div className="timeline-grid">
              <div className="timeline-card">
                <span className="time">48 Hours</span>
                <p>Acknowledgment of your grievance</p>
              </div>
              <div className="timeline-card">
                <span className="time">7 Days</span>
                <p>Initial response and investigation update</p>
              </div>
              <div className="timeline-card">
                <span className="time">30 Days</span>
                <p>Final resolution of the grievance</p>
              </div>
            </div>
          </section>

          <section>
            <h2>👤 Grievance Officer Details</h2>
            <div className="officer-card">
              <div className="officer-photo">👨‍💼</div>
              <div className="officer-details">
                <h3>Mr. Rajesh Kumar</h3>
                <p className="designation">Grievance Officer & Data Protection Officer</p>
                <div className="contact-info">
                  <div className="contact-item">
                    <span className="icon">📧</span>
                    <div>
                      <strong>Email:</strong>
                      <a href="mailto:grievance@b2bmarketplace.com">grievance@b2bmarketplace.com</a>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="icon">📞</span>
                    <div>
                      <strong>Phone:</strong>
                      <span>+91-80-4567-8901</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="icon">🕐</span>
                    <div>
                      <strong>Working Hours:</strong>
                      <span>Monday to Friday, 9:00 AM - 6:00 PM IST</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="icon">📍</span>
                    <div>
                      <strong>Address:</strong>
                      <span>B2B MarketPlace Pvt. Ltd., 123 Tech Park, Whitefield, Bangalore, Karnataka 560066, India</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>📝 How to File a Grievance</h2>
            <div className="steps-container">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>Login to Your Account</h4>
                  <p>Access your B2B MarketPlace account and navigate to "My Orders"</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>Select the Order</h4>
                  <p>Find the order you have an issue with and click "View Details"</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h4>Raise Dispute</h4>
                  <p>Click "Raise Dispute" and fill in the details of your grievance</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <div className="step-content">
                  <h4>Track Status</h4>
                  <p>Monitor your ticket status in "My Tickets" section</p>
                </div>
              </div>
            </div>
            <p className="cta-section">
              <Link to="/disputes" className="btn-primary">View My Tickets</Link>
            </p>
          </section>

          <section>
            <h2>🔢 Escalation Levels</h2>
            <div className="escalation-container">
              <div className="escalation-level">
                <div className="level-header">
                  <span className="level-badge">Level 1</span>
                  <h4>Customer Support Team</h4>
                </div>
                <p>First point of contact for all grievances</p>
                <ul>
                  <li>Response within 24 hours</li>
                  <li>Resolution for common issues within 48-72 hours</li>
                </ul>
              </div>

              <div className="escalation-arrow">↓</div>

              <div className="escalation-level">
                <div className="level-header">
                  <span className="level-badge">Level 2</span>
                  <h4>Senior Support / Management</h4>
                </div>
                <p>For unresolved issues after Level 1</p>
                <ul>
                  <li>Detailed investigation</li>
                  <li>Resolution within 7 days</li>
                </ul>
              </div>

              <div className="escalation-arrow">↓</div>

              <div className="escalation-level highlight">
                <div className="level-header">
                  <span className="level-badge urgent">Level 3</span>
                  <h4>Grievance Officer</h4>
                </div>
                <p>Final escalation for complex disputes</p>
                <ul>
                  <li>Direct handling by designated Grievance Officer</li>
                  <li>Final resolution within 30 days</li>
                  <li>Written response provided</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>📋 Types of Grievances We Handle</h2>
            <div className="grievance-types-grid">
              <div className="type-card">
                <span className="icon">📦</span>
                <h4>Product Issues</h4>
                <ul>
                  <li>Wrong product received</li>
                  <li>Damaged/defective product</li>
                  <li>Quality concerns</li>
                  <li>Missing items</li>
                </ul>
              </div>
              <div className="type-card">
                <span className="icon">🚚</span>
                <h4>Delivery Issues</h4>
                <ul>
                  <li>Delayed delivery</li>
                  <li>Non-delivery</li>
                  <li>Delivery to wrong address</li>
                </ul>
              </div>
              <div className="type-card">
                <span className="icon">💳</span>
                <h4>Payment Issues</h4>
                <ul>
                  <li>Incorrect charges</li>
                  <li>Refund delays</li>
                  <li>Payment failures</li>
                </ul>
              </div>
              <div className="type-card">
                <span className="icon">📄</span>
                <h4>Other Issues</h4>
                <ul>
                  <li>Account problems</li>
                  <li>Seller disputes</li>
                  <li>Warranty claims</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2>💰 Refund Policy Summary</h2>
            <table className="policy-table">
              <thead>
                <tr>
                  <th>Issue Type</th>
                  <th>Refund Timeline</th>
                  <th>Refund Method</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Wrong Product</td>
                  <td>5-7 business days</td>
                  <td>Original payment method</td>
                </tr>
                <tr>
                  <td>Damaged Product</td>
                  <td>5-7 business days</td>
                  <td>Original payment method</td>
                </tr>
                <tr>
                  <td>Non-Delivery</td>
                  <td>3-5 business days</td>
                  <td>Original payment method</td>
                </tr>
                <tr>
                  <td>Order Cancellation (before shipment)</td>
                  <td>2-3 business days</td>
                  <td>Original payment method</td>
                </tr>
              </tbody>
            </table>
            <p><Link to="/refund-policy">View Full Refund Policy →</Link></p>
          </section>

          <section>
            <h2>⚖️ External Remedies</h2>
            <p>If you are not satisfied with our resolution, you may approach:</p>
            <div className="external-remedies">
              <div className="remedy-card">
                <h4>Consumer Forum</h4>
                <p>District Consumer Disputes Redressal Forum</p>
                <p className="link">
                  <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer">
                    consumerhelpline.gov.in
                  </a>
                </p>
              </div>
              <div className="remedy-card">
                <h4>National Consumer Helpline</h4>
                <p>Toll-free: <strong>1800-11-4000</strong></p>
                <p>SMS: 8130009809</p>
              </div>
              <div className="remedy-card">
                <h4>Data Protection Board</h4>
                <p>For data privacy concerns under DPDP Act, 2023</p>
              </div>
            </div>
          </section>

          <section>
            <h2>📞 Quick Contact</h2>
            <div className="quick-contact">
              <a href="mailto:grievance@b2bmarketplace.com" className="contact-btn email">
                📧 Email Grievance Officer
              </a>
              <a href="tel:+918045678901" className="contact-btn phone">
                📞 Call: +91-80-4567-8901
              </a>
              <Link to="/disputes" className="contact-btn ticket">
                🎫 View My Tickets
              </Link>
            </div>
          </section>
        </div>

        <div className="legal-footer">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/refund-policy">Return & Refund Policy</Link>
        </div>
      </div>
    </div>
  )
}

export default GrievanceOfficer
