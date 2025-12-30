import { Link } from 'react-router-dom'
import '../../styles/LegalPages.css'

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="effective-date">Effective Date: January 1, 2024 | Last Updated: December 30, 2025</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              B2B MarketPlace ("we," "our," or "us") is committed to protecting your privacy and ensuring 
              the security of your personal information. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our B2B e-commerce platform.
            </p>
            <p>
              This policy is compliant with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>, 
              <strong>Information Technology Act, 2000</strong>, and <strong>E-Commerce Rules, 2020</strong> of India.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <ul>
              <li><strong>Identity Data:</strong> Name, username, company name, designation</li>
              <li><strong>Contact Data:</strong> Email address, phone number, business address</li>
              <li><strong>Business Data:</strong> GSTIN, PAN, trade license, business registration documents</li>
              <li><strong>Financial Data:</strong> Bank account details, UPI ID, payment transaction records</li>
              <li><strong>Transaction Data:</strong> Orders, quotes, invoices, purchase history</li>
            </ul>

            <h3>2.2 Technical Information</h3>
            <ul>
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Time zone setting and location</li>
              <li>Operating system and platform</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h3>2.3 Usage Information</h3>
            <ul>
              <li>Pages visited and features used</li>
              <li>Search queries and product views</li>
              <li>Communication preferences</li>
              <li>Feedback and support interactions</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul>
              <li><strong>Account Management:</strong> To create and manage your buyer/supplier account</li>
              <li><strong>Order Processing:</strong> To process orders, quotes, payments, and deliveries</li>
              <li><strong>Communication:</strong> To send order updates, notifications, and support responses</li>
              <li><strong>Verification:</strong> To verify business credentials and GSTIN</li>
              <li><strong>Legal Compliance:</strong> To comply with GST, tax, and regulatory requirements</li>
              <li><strong>Improvement:</strong> To improve our platform, services, and user experience</li>
              <li><strong>Security:</strong> To detect and prevent fraud, unauthorized access, and abuse</li>
              <li><strong>Marketing:</strong> To send promotional offers (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2>4. Legal Basis for Processing (DPDP Act 2023)</h2>
            <p>Under the Digital Personal Data Protection Act, 2023, we process your data based on:</p>
            <ul>
              <li><strong>Consent:</strong> For marketing communications and optional features</li>
              <li><strong>Contract:</strong> For order fulfillment and service delivery</li>
              <li><strong>Legal Obligation:</strong> For tax compliance, GST invoicing, and regulatory requirements</li>
              <li><strong>Legitimate Interest:</strong> For fraud prevention and platform security</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Business Partners:</strong> Suppliers/Buyers for order fulfillment (limited to transaction details)</li>
              <li><strong>Payment Processors:</strong> Banks, payment gateways for transaction processing</li>
              <li><strong>Logistics Partners:</strong> Shipping companies for delivery</li>
              <li><strong>Government Authorities:</strong> Tax authorities, regulatory bodies as required by law</li>
              <li><strong>Service Providers:</strong> Cloud hosting, analytics, customer support tools</li>
            </ul>
            <p className="highlight-box">
              ⚠️ We do NOT sell your personal data to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2>6. Your Rights Under DPDP Act 2023</h2>
            <p>As a Data Principal, you have the following rights:</p>
            <div className="rights-grid">
              <div className="right-card">
                <h4>📋 Right to Access</h4>
                <p>Request a summary of your personal data we hold</p>
              </div>
              <div className="right-card">
                <h4>✏️ Right to Correction</h4>
                <p>Request correction of inaccurate or incomplete data</p>
              </div>
              <div className="right-card">
                <h4>🗑️ Right to Erasure</h4>
                <p>Request deletion of your personal data (subject to legal retention)</p>
              </div>
              <div className="right-card">
                <h4>🚫 Right to Withdraw Consent</h4>
                <p>Withdraw consent for marketing and optional processing</p>
              </div>
              <div className="right-card">
                <h4>⚖️ Right to Grievance Redressal</h4>
                <p>Lodge complaints with our Grievance Officer or Data Protection Board</p>
              </div>
              <div className="right-card">
                <h4>📤 Right to Nominate</h4>
                <p>Nominate another person to exercise rights on your behalf</p>
              </div>
            </div>
            <p>To exercise these rights, contact us at <a href="mailto:privacy@b2bmarketplace.com">privacy@b2bmarketplace.com</a> or visit <Link to="/account">My Account</Link>.</p>
          </section>

          <section>
            <h2>7. Data Retention</h2>
            <table className="retention-table">
              <thead>
                <tr>
                  <th>Data Category</th>
                  <th>Retention Period</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Account Information</td>
                  <td>Until account deletion + 30 days</td>
                  <td>Service provision</td>
                </tr>
                <tr>
                  <td>Transaction Records</td>
                  <td>8 years from transaction</td>
                  <td>GST/Tax compliance</td>
                </tr>
                <tr>
                  <td>Invoices & Tax Documents</td>
                  <td>8 years</td>
                  <td>Legal requirement</td>
                </tr>
                <tr>
                  <td>Support Communications</td>
                  <td>3 years</td>
                  <td>Service improvement</td>
                </tr>
                <tr>
                  <td>Marketing Preferences</td>
                  <td>Until consent withdrawn</td>
                  <td>Consent-based</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>8. Data Security</h2>
            <p>We implement robust security measures including:</p>
            <ul>
              <li>SSL/TLS encryption for data transmission</li>
              <li>Encrypted storage of sensitive information</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          <section>
            <h2>9. Cookies Policy</h2>
            <p>We use cookies and similar technologies for:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for platform functionality (authentication, cart)</li>
              <li><strong>Analytics Cookies:</strong> To understand usage patterns and improve services</li>
              <li><strong>Preference Cookies:</strong> To remember your settings and preferences</li>
            </ul>
            <p>You can manage cookie preferences through your browser settings or our cookie consent banner.</p>
          </section>

          <section>
            <h2>10. Cross-Border Data Transfer</h2>
            <p>
              Your data is primarily stored and processed in India. If data transfer outside India is required, 
              we ensure compliance with DPDP Act requirements and implement appropriate safeguards.
            </p>
          </section>

          <section>
            <h2>11. Children's Privacy</h2>
            <p>
              Our platform is designed for business use and not intended for individuals under 18 years of age. 
              We do not knowingly collect data from minors.
            </p>
          </section>

          <section>
            <h2>12. Grievance Officer</h2>
            <div className="contact-card">
              <h4>Data Protection / Grievance Officer</h4>
              <p><strong>Name:</strong> Mr. Rajesh Kumar</p>
              <p><strong>Email:</strong> <a href="mailto:grievance@b2bmarketplace.com">grievance@b2bmarketplace.com</a></p>
              <p><strong>Phone:</strong> +91-80-4567-8901</p>
              <p><strong>Address:</strong> B2B MarketPlace Pvt. Ltd., 123 Tech Park, Bangalore, Karnataka 560001</p>
              <p><strong>Response Time:</strong> Within 48 hours of receiving your complaint</p>
            </div>
            <p>
              If you are not satisfied with our response, you may escalate to the 
              <strong> Data Protection Board of India</strong> as per DPDP Act, 2023.
            </p>
          </section>

          <section>
            <h2>13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes 
              via email or platform notification. Continued use of our services after changes constitutes 
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2>14. Contact Us</h2>
            <p>For privacy-related inquiries:</p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:privacy@b2bmarketplace.com">privacy@b2bmarketplace.com</a></li>
              <li><strong>Phone:</strong> +91-80-4567-8900</li>
              <li><strong>Address:</strong> B2B MarketPlace Pvt. Ltd., 123 Tech Park, Whitefield, Bangalore, Karnataka 560066, India</li>
            </ul>
          </section>
        </div>

        <div className="legal-footer">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/grievance">Grievance Redressal</Link>
          <Link to="/refund-policy">Return & Refund Policy</Link>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
