import { Link } from 'react-router-dom'
import '../../styles/LegalPages.css'

function RefundPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Return & Refund Policy</h1>
          <p className="effective-date">Effective Date: January 1, 2024 | Last Updated: December 30, 2025</p>
        </div>

        <div className="legal-content">
          <section className="highlight-section">
            <p>
              This policy is compliant with the <strong>Consumer Protection Act, 2019</strong> and 
              <strong> Consumer Protection (E-Commerce) Rules, 2020</strong>. We are committed to 
              ensuring customer satisfaction with every purchase.
            </p>
          </section>

          <section>
            <h2>1. Return Eligibility</h2>
            <h3>1.1 Eligible for Return</h3>
            <ul>
              <li>Products received in damaged or defective condition</li>
              <li>Wrong product delivered (different from what was ordered)</li>
              <li>Missing items from the order</li>
              <li>Products significantly different from description/images</li>
              <li>Products not meeting agreed quality standards</li>
            </ul>

            <h3>1.2 Conditions for Return</h3>
            <ul>
              <li>Return request must be raised within <strong>7 days</strong> of delivery</li>
              <li>Product must be unused and in original packaging</li>
              <li>All tags, labels, and accessories must be intact</li>
              <li>Proof of purchase (order number/invoice) required</li>
              <li>Photos/videos of defect or damage required</li>
            </ul>

            <h3>1.3 Non-Returnable Items</h3>
            <ul>
              <li>Custom-made or personalized products</li>
              <li>Perishable goods</li>
              <li>Products with broken seals (software, consumables)</li>
              <li>Intimate or sanitary goods</li>
              <li>Hazardous materials</li>
              <li>Products explicitly marked as non-returnable</li>
            </ul>
          </section>

          <section>
            <h2>2. Return Process</h2>
            <div className="process-steps">
              <div className="process-step">
                <span className="step-num">1</span>
                <div>
                  <h4>Initiate Return Request</h4>
                  <p>Go to "My Orders" → Select Order → Click "Raise Dispute" → Choose return reason</p>
                </div>
              </div>
              <div className="process-step">
                <span className="step-num">2</span>
                <div>
                  <h4>Upload Evidence</h4>
                  <p>Attach photos/videos of the product showing the issue</p>
                </div>
              </div>
              <div className="process-step">
                <span className="step-num">3</span>
                <div>
                  <h4>Supplier Review</h4>
                  <p>Supplier reviews request within 48 hours</p>
                </div>
              </div>
              <div className="process-step">
                <span className="step-num">4</span>
                <div>
                  <h4>Return Pickup</h4>
                  <p>If approved, pickup scheduled within 3-5 business days</p>
                </div>
              </div>
              <div className="process-step">
                <span className="step-num">5</span>
                <div>
                  <h4>Quality Check</h4>
                  <p>Product inspected upon receipt at supplier/warehouse</p>
                </div>
              </div>
              <div className="process-step">
                <span className="step-num">6</span>
                <div>
                  <h4>Refund/Replacement</h4>
                  <p>Refund processed or replacement shipped</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>3. Refund Policy</h2>
            <h3>3.1 Refund Timeline</h3>
            <table className="refund-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Refund Initiation</th>
                  <th>Credit to Account</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Order Cancellation (before shipment)</td>
                  <td>Within 24 hours</td>
                  <td>2-3 business days</td>
                </tr>
                <tr>
                  <td>Non-Delivery</td>
                  <td>Within 24 hours of confirmation</td>
                  <td>3-5 business days</td>
                </tr>
                <tr>
                  <td>Wrong/Damaged Product</td>
                  <td>After product pickup</td>
                  <td>5-7 business days</td>
                </tr>
                <tr>
                  <td>Quality Issue (after inspection)</td>
                  <td>After quality verification</td>
                  <td>7-10 business days</td>
                </tr>
              </tbody>
            </table>

            <h3>3.2 Refund Method</h3>
            <table className="refund-table">
              <thead>
                <tr>
                  <th>Original Payment Method</th>
                  <th>Refund Method</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Credit/Debit Card</td>
                  <td>Same card (5-7 business days)</td>
                </tr>
                <tr>
                  <td>Net Banking</td>
                  <td>Bank account (3-5 business days)</td>
                </tr>
                <tr>
                  <td>UPI</td>
                  <td>Same UPI ID (1-3 business days)</td>
                </tr>
                <tr>
                  <td>Bank Transfer (NEFT/RTGS)</td>
                  <td>Bank account (3-5 business days)</td>
                </tr>
                <tr>
                  <td>Credit Terms</td>
                  <td>Credit note / Account adjustment</td>
                </tr>
              </tbody>
            </table>

            <h3>3.3 Refund Amount</h3>
            <ul>
              <li><strong>Full Refund:</strong> Product cost + Shipping (for seller's fault)</li>
              <li><strong>Partial Refund:</strong> Product cost only (for buyer's change of mind, where applicable)</li>
              <li><strong>Shipping not refunded:</strong> If return is due to buyer's preference, not defect</li>
            </ul>
          </section>

          <section>
            <h2>4. Replacement Policy</h2>
            <p>Replacement may be offered instead of refund in the following cases:</p>
            <ul>
              <li>Same product available in stock</li>
              <li>Customer prefers replacement over refund</li>
              <li>For warranty claims (within warranty period)</li>
            </ul>
            <p>Replacement delivery: 5-10 business days (depending on location)</p>
          </section>

          <section>
            <h2>5. Order Cancellation</h2>
            <h3>5.1 Buyer Initiated Cancellation</h3>
            <table className="cancellation-table">
              <thead>
                <tr>
                  <th>Cancellation Stage</th>
                  <th>Cancellation Fee</th>
                  <th>Refund</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Before order confirmation</td>
                  <td>None</td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td>After confirmation, before shipment</td>
                  <td>None</td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td>After shipment (RTO)</td>
                  <td>Shipping charges</td>
                  <td>Product value only</td>
                </tr>
                <tr>
                  <td>Custom/Made-to-order products</td>
                  <td>May not be cancellable</td>
                  <td>Subject to supplier policy</td>
                </tr>
              </tbody>
            </table>

            <h3>5.2 Seller Initiated Cancellation</h3>
            <p>If seller cancels due to stock unavailability or other reasons:</p>
            <ul>
              <li>100% refund within 24-48 hours</li>
              <li>No cancellation fee charged to buyer</li>
            </ul>
          </section>

          <section>
            <h2>6. B2B Specific Terms</h2>
            <ul>
              <li><strong>Bulk Orders:</strong> Return policies may vary for large quantity orders (subject to negotiation)</li>
              <li><strong>Credit Terms:</strong> Refunds will be adjusted against outstanding credit</li>
              <li><strong>Sample Orders:</strong> Samples are typically non-refundable</li>
              <li><strong>Contract Orders:</strong> Subject to individual contract terms</li>
            </ul>
          </section>

          <section>
            <h2>7. Dispute Resolution</h2>
            <p>If you disagree with a return/refund decision:</p>
            <ol>
              <li>Respond to the dispute ticket with additional evidence</li>
              <li>Request escalation to senior support</li>
              <li>Escalate to Grievance Officer if unresolved</li>
              <li>Final resolution within 30 days as per E-Commerce Rules 2020</li>
            </ol>
            <p>
              <Link to="/grievance">Contact Grievance Officer →</Link>
            </p>
          </section>

          <section>
            <h2>8. Contact for Returns</h2>
            <div className="contact-card">
              <p><strong>Email:</strong> <a href="mailto:returns@b2bmarketplace.com">returns@b2bmarketplace.com</a></p>
              <p><strong>Phone:</strong> +91-80-4567-8902</p>
              <p><strong>Working Hours:</strong> Monday to Saturday, 9:00 AM - 6:00 PM IST</p>
            </div>
          </section>
        </div>

        <div className="legal-footer">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/grievance">Grievance Redressal</Link>
        </div>
      </div>
    </div>
  )
}

export default RefundPolicy
