import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

const toastStyles = {
  success: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: '✓',
    iconBg: 'rgba(255, 255, 255, 0.2)'
  },
  error: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    icon: '✕',
    iconBg: 'rgba(255, 255, 255, 0.2)'
  },
  warning: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icon: '⚠',
    iconBg: 'rgba(255, 255, 255, 0.2)'
  },
  info: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    icon: 'ℹ',
    iconBg: 'rgba(255, 255, 255, 0.2)'
  }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((type, message, customIcon = null, duration = 3000) => {
    const id = Date.now() + Math.random()
    const style = toastStyles[type] || toastStyles.info
    const icon = customIcon || style.icon

    const newToast = { id, type, message, icon, style, duration }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((message, icon) => showToast('success', message, icon), [showToast])
  const error = useCallback((message, icon) => showToast('error', message, icon), [showToast])
  const warning = useCallback((message, icon) => showToast('warning', message, icon), [showToast])
  const info = useCallback((message, icon) => showToast('info', message, icon), [showToast])

  const value = {
    showToast,
    removeToast,
    success,
    error,
    warning,
    info
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px'
        }}
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            style={{
              background: toast.style.background,
              color: 'white',
              padding: '16px 20px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'slideIn 0.3s ease-out',
              cursor: 'pointer',
              minWidth: '280px'
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: toast.style.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0
              }}
            >
              {toast.icon}
            </span>
            <span style={{ flex: 1, fontWeight: 500 }}>{toast.message}</span>
            <span
              style={{
                opacity: 0.7,
                fontSize: '18px',
                marginLeft: '8px'
              }}
            >
              ×
            </span>
          </div>
        ))}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
