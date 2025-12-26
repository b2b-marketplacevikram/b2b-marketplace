import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  console.log('AuthProvider rendering...')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('AuthProvider useEffect running...')
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (storedUser && token) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
    console.log('AuthProvider initialized')
  }, [])

  const login = async (credentials) => {
    try {
      const result = await authAPI.login(credentials)
      
      if (result.success) {
        const { token, ...userData } = result.data
        
        // Store token and user data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Update state
        setUser(userData)
        
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'An error occurred during login' }
    }
  }

  const register = async (userData) => {
    try {
      const result = await authAPI.register(userData)
      
      if (result.success) {
        const { token, ...user } = result.data
        
        // Store token and user data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Update state
        setUser(user)
        
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: 'An error occurred during registration' }
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isSupplier: user?.userType?.toLowerCase() === 'supplier' || user?.type === 'supplier',
    isBuyer: user?.userType?.toLowerCase() === 'buyer' || user?.type === 'buyer',
    loading
  }

  // Don't block rendering - let the app load with a loading state
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
