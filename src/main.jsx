import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './styles/index.css'

console.log('main.jsx loading...')

try {
  const root = document.getElementById('root')
  console.log('Root element:', root)
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
  
  console.log('React app rendered successfully')
} catch (error) {
  console.error('Error rendering React app:', error)
  document.body.innerHTML = `
    <div style="padding: 50px; text-align: center; font-family: Arial;">
      <h1 style="color: red;">React Rendering Error</h1>
      <p>${error.message}</p>
      <pre style="background: #f5f5f5; padding: 20px; text-align: left;">${error.stack}</pre>
    </div>
  `
}
