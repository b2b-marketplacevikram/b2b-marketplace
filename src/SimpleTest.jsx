import React from 'react'

function SimpleTest() {
  return (
    <div style={{
      padding: '50px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{color: '#2c3e50'}}>✅ React is Working!</h1>
      <p style={{fontSize: '18px', color: '#27ae60'}}>
        If you can see this, React is rendering correctly.
      </p>
      
      <div style={{
        background: '#3498db',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>B2B Marketplace</h2>
        <p>Your application is loading...</p>
      </div>
      
      <div style={{marginTop: '30px'}}>
        <h3>Next Steps:</h3>
        <ol>
          <li>Check browser console (F12) for any errors</li>
          <li>Verify all backend services are running</li>
          <li>Try navigating to <a href="/login">/login</a></li>
        </ol>
      </div>
    </div>
  )
}

export default SimpleTest
