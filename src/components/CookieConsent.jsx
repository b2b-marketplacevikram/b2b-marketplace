import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/CookieConsent.css'

function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setShowBanner(true)
    } else {
      try {
        const savedPreferences = JSON.parse(consent)
        setPreferences(savedPreferences)
      } catch (e) {
        setShowBanner(true)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted))
    setPreferences(allAccepted)
    setShowBanner(false)
    setShowPreferences(false)
  }

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary))
    setPreferences(onlyNecessary)
    setShowBanner(false)
    setShowPreferences(false)
  }

  const handleSavePreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookieConsent', JSON.stringify(consentData))
    setShowBanner(false)
    setShowPreferences(false)
  }

  const handlePreferenceChange = (key) => {
    if (key === 'necessary') return // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!showBanner) return null

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        {!showPreferences ? (
          <>
            <div className="cookie-consent-content">
              <h3>🍪 We Value Your Privacy</h3>
              <p>
                We use cookies and similar technologies to enhance your browsing experience, 
                analyze site traffic, and personalize content. By clicking "Accept All", 
                you consent to our use of cookies as described in our{' '}
                <Link to="/privacy" onClick={() => setShowBanner(false)}>Privacy Policy</Link>.
              </p>
              <p className="cookie-note">
                As per the Digital Personal Data Protection Act, 2023 (DPDP), you have the right 
                to manage your cookie preferences.
              </p>
            </div>
            <div className="cookie-consent-actions">
              <button className="cookie-btn reject" onClick={handleRejectAll}>
                Reject All
              </button>
              <button className="cookie-btn preferences" onClick={() => setShowPreferences(true)}>
                Manage Preferences
              </button>
              <button className="cookie-btn accept" onClick={handleAcceptAll}>
                Accept All
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cookie-preferences-content">
              <h3>🔧 Cookie Preferences</h3>
              <p>Manage your cookie settings below. You can change these preferences at any time.</p>
              
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h4>Necessary Cookies</h4>
                    <p>Required for the website to function properly. Cannot be disabled.</p>
                  </div>
                  <label className="toggle-switch disabled">
                    <input type="checkbox" checked={true} disabled />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h4>Analytics Cookies</h4>
                    <p>Help us understand how visitors interact with our website.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={preferences.analytics}
                      onChange={() => handlePreferenceChange('analytics')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h4>Functional Cookies</h4>
                    <p>Enable enhanced functionality and personalization.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={preferences.functional}
                      onChange={() => handlePreferenceChange('functional')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h4>Marketing Cookies</h4>
                    <p>Used to track visitors and display relevant ads.</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={preferences.marketing}
                      onChange={() => handlePreferenceChange('marketing')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="cookie-consent-actions">
              <button className="cookie-btn back" onClick={() => setShowPreferences(false)}>
                ← Back
              </button>
              <button className="cookie-btn save" onClick={handleSavePreferences}>
                Save Preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CookieConsent
