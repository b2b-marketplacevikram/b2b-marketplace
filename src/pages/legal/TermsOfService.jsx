import { Link } from 'react-router-dom'
import '../../styles/LegalPages.css'

function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Terms of Service</h1>
          <p className="effective-date">Effective Date: January 1, 2024 | Last Updated: December 30, 2025</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the B2B MarketPlace platform ("Platform"), you agree to be bound by these 
              Terms of Service ("Terms"), our <Link to="/privacy">Privacy Policy</Link>, and all applicable laws 
              and regulations. If you do not agree with any of these terms, you are prohibited from using this Platform.
            </p>
            <p>
              These Terms are governed by the laws of India, including the <strong>Information Technology Act, 2000</strong>, 
              <strong>Consumer Protection Act, 2019</strong>, <strong>E-Commerce Rules, 2020</strong>, and 
              <strong>Indian Contract Act, 1872</strong>.
            </p>
          </section>

          <section>
            <h2>2. Definitions</h2>
            <ul>
              <li><strong>"Platform"</strong> - The B2B MarketPlace website and mobile applications</li>
              <li><strong>"User"</strong> - Any person or entity accessing the Platform</li>
              <li><strong>"Buyer"</strong> - A registered user purchasing products/services</li>
              <li><strong>"Supplier/Seller"</strong> - A registered user selling products/services</li>
              <li><strong>"Content"</strong> - Text, images, data, and materials on the Platform</li>
              <li><strong>"Products"</strong> - Goods and services listed on the Platform</li>
              <li><strong>"Order"</strong> - A confirmed purchase transaction between Buyer and Supplier</li>
            </ul>
          </section>

          <section>
            <h2>3. Eligibility</h2>
            <p>To use this Platform, you must:</p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Be a registered business entity (for B2B transactions)</li>
              <li>Have a valid GSTIN (for transactions within India)</li>
              <li>Have legal authority to enter into binding contracts</li>
              <li>Not be prohibited from using the Platform under applicable laws</li>
            </ul>
          </section>

          <section>
            <h2>4. Account Registration</h2>
            <h3>4.1 Registration Requirements</h3>
            <ul>
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain and update your information to keep it current</li>
              <li>Keep your login credentials confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            
            <h3>4.2 Verification</h3>
            <p>
              We may require verification of your business credentials, including GSTIN, PAN, 
              trade license, or other documents. Suppliers must complete verification before listing products.
            </p>

            <h3>4.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms, 
              engage in fraudulent activity, or provide false information.
            </p>
          </section>

          <section>
            <h2>5. Buyer Obligations</h2>
            <ul>
              <li>Review product details, specifications, and pricing before ordering</li>
              <li>Provide accurate shipping and billing information</li>
              <li>Make timely payments as per agreed terms</li>
              <li>Inspect products upon delivery and report issues within 48 hours</li>
              <li>Comply with minimum order quantity (MOQ) requirements</li>
              <li>Honor credit terms and payment commitments</li>
            </ul>
          </section>

          <section>
            <h2>6. Supplier Obligations</h2>
            <ul>
              <li>Provide accurate product descriptions, images, and specifications</li>
              <li>Display <strong>Country of Origin</strong> for all products (E-Commerce Rules 2020)</li>
              <li>Maintain valid GSTIN and provide GST-compliant invoices</li>
              <li>Include HSN codes on all products</li>
              <li>Honor listed prices, MOQ, and delivery timelines</li>
              <li>Acknowledge and respond to disputes within 48 hours</li>
              <li>Resolve disputes within 30 days (Consumer Protection Act 2019)</li>
              <li>Comply with return and refund policies</li>
              <li>Maintain product quality and safety standards</li>
              <li>Display manufacturing/expiry dates for applicable products</li>
            </ul>
          </section>

          <section>
            <h2>7. Pricing and Payments</h2>
            <h3>7.1 Pricing</h3>
            <ul>
              <li>All prices are in Indian Rupees (₹) unless stated otherwise</li>
              <li>Prices are exclusive of GST unless marked as inclusive</li>
              <li>Suppliers must display accurate MRP and selling prices</li>
              <li>Bulk/negotiated pricing may be available through RFQ</li>
            </ul>

            <h3>7.2 Payment Methods</h3>
            <ul>
              <li>Online payment (Credit/Debit cards, Net Banking, UPI)</li>
              <li>Bank Transfer (NEFT/RTGS/IMPS)</li>
              <li>Credit Terms (for approved buyers)</li>
            </ul>

            <h3>7.3 GST Compliance</h3>
            <p>
              All transactions are subject to applicable GST rates. Suppliers must issue 
              GST-compliant tax invoices with proper HSN codes and tax breakdowns.
            </p>
          </section>

          <section>
            <h2>8. Orders and Delivery</h2>
            <h3>8.1 Order Confirmation</h3>
            <p>
              An order is confirmed only upon payment receipt and confirmation email. 
              Order confirmation creates a binding contract between Buyer and Supplier.
            </p>

            <h3>8.2 Delivery</h3>
            <ul>
              <li>Delivery timelines are estimated and may vary based on location</li>
              <li>Shipping costs are calculated based on weight, dimensions, and destination</li>
              <li>Buyer must inspect goods upon delivery</li>
              <li>Damage or discrepancies must be reported within 48 hours</li>
            </ul>

            <h3>8.3 Order Cancellation</h3>
            <ul>
              <li>Buyers may cancel before shipment (subject to cancellation fees)</li>
              <li>Suppliers may cancel due to stock unavailability (full refund provided)</li>
              <li>Custom/made-to-order products may not be cancellable</li>
            </ul>
          </section>

          <section>
            <h2>9. Returns and Refunds</h2>
            <p>Per <strong>Consumer Protection Act, 2019</strong> and <strong>E-Commerce Rules, 2020</strong>:</p>
            <ul>
              <li>Returns accepted within 7 days for defective/wrong products</li>
              <li>Products must be in original condition with packaging</li>
              <li>Refunds processed within 5-7 business days upon approval</li>
              <li>Refund method matches original payment method</li>
              <li>Custom/perishable products may have different policies</li>
            </ul>
            <p>For detailed policy, see our <Link to="/refund-policy">Return & Refund Policy</Link>.</p>
          </section>

          <section>
            <h2>10. Dispute Resolution</h2>
            <h3>10.1 Grievance Redressal</h3>
            <p>Per <strong>E-Commerce Rules, 2020</strong>:</p>
            <ul>
              <li>All disputes must be acknowledged within <strong>48 hours</strong></li>
              <li>Resolution must be provided within <strong>30 days</strong></li>
              <li>Disputes can be escalated to our Grievance Officer</li>
            </ul>

            <h3>10.2 Escalation Levels</h3>
            <ol>
              <li><strong>Level 1:</strong> Customer Support Team</li>
              <li><strong>Level 2:</strong> Senior Support / Management</li>
              <li><strong>Level 3:</strong> Grievance Officer</li>
            </ol>

            <h3>10.3 Arbitration</h3>
            <p>
              Disputes not resolved through grievance redressal shall be subject to 
              arbitration under the <strong>Arbitration and Conciliation Act, 1996</strong>. 
              Arbitration shall be conducted in Bangalore, Karnataka.
            </p>

            <h3>10.4 Jurisdiction</h3>
            <p>
              These Terms are governed by the laws of India. Courts in Bangalore, Karnataka 
              shall have exclusive jurisdiction.
            </p>
          </section>

          <section>
            <h2>11. Intellectual Property</h2>
            <ul>
              <li>The Platform, logos, and content are owned by B2B MarketPlace</li>
              <li>Product images and descriptions remain property of respective Suppliers</li>
              <li>Users may not copy, reproduce, or distribute Platform content without permission</li>
              <li>Suppliers grant us license to display their product information</li>
            </ul>
          </section>

          <section>
            <h2>12. Prohibited Activities</h2>
            <p>Users must not:</p>
            <ul>
              <li>Provide false or misleading information</li>
              <li>List counterfeit, illegal, or prohibited products</li>
              <li>Engage in fraudulent transactions</li>
              <li>Harass or abuse other users</li>
              <li>Attempt to bypass security measures</li>
              <li>Use automated bots or scrapers</li>
              <li>Violate any applicable laws</li>
              <li>Manipulate ratings or reviews</li>
            </ul>
          </section>

          <section>
            <h2>13. Limitation of Liability</h2>
            <p>
              B2B MarketPlace acts as an intermediary platform connecting Buyers and Suppliers. 
              We are not liable for:
            </p>
            <ul>
              <li>Quality, safety, or legality of products listed by Suppliers</li>
              <li>Accuracy of product descriptions provided by Suppliers</li>
              <li>Disputes between Buyers and Suppliers</li>
              <li>Delays in delivery by third-party logistics</li>
              <li>Indirect, incidental, or consequential damages</li>
            </ul>
            <p>
              Our total liability shall not exceed the transaction value in dispute.
            </p>
          </section>

          <section>
            <h2>14. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless B2B MarketPlace, its directors, employees, 
              and affiliates from any claims, damages, or expenses arising from your use of the 
              Platform or violation of these Terms.
            </p>
          </section>

          <section>
            <h2>15. Modifications</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be posted on 
              this page with an updated effective date. Continued use after changes constitutes 
              acceptance of modified Terms.
            </p>
          </section>

          <section>
            <h2>16. Severability</h2>
            <p>
              If any provision of these Terms is found invalid or unenforceable, the remaining 
              provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2>17. Contact Information</h2>
            <div className="contact-card">
              <h4>B2B MarketPlace Pvt. Ltd.</h4>
              <p><strong>Address:</strong> 123 Tech Park, Whitefield, Bangalore, Karnataka 560066, India</p>
              <p><strong>Email:</strong> <a href="mailto:support@b2bmarketplace.com">support@b2bmarketplace.com</a></p>
              <p><strong>Phone:</strong> +91-80-4567-8900</p>
              <p><strong>CIN:</strong> U72200KA2020PTC123456</p>
              <p><strong>GSTIN:</strong> 29AABCT1234A1ZV</p>
            </div>
          </section>
        </div>

        <div className="legal-footer">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/grievance">Grievance Redressal</Link>
          <Link to="/refund-policy">Return & Refund Policy</Link>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService
