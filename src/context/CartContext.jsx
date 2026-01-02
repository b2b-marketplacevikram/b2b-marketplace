import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'
import axios from 'axios'

const CartContext = createContext()

const CART_API_URL = 'http://localhost:8085/api/cart'

export function useCart() {
  return useContext(CartContext)
}

export function CartProvider({ children }) {
  console.log('CartProvider rendering...')
  const { user } = useAuth()
  const toast = useToast()
  console.log('CartProvider user:', user)
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  // Load cart when user logs in or changes
  useEffect(() => {
    if (user?.id) {
      loadCartFromBackend(user.id)
    } else {
      // User logged out, clear cart
      setCart([])
    }
  }, [user?.id])

  const loadCartFromBackend = async (userId) => {
    if (!userId) return

    try {
      setLoading(true)
      const response = await axios.get(`${CART_API_URL}/${userId}`)
      const cartData = response.data
      
      // Transform backend cart data to frontend format
      const transformedCart = cartData.items.map(item => ({
        id: item.productId,
        cartItemId: item.id,
        name: item.productName,
        price: item.unitPrice,
        quantity: item.quantity,
        image: item.productImage || '/placeholder-product.jpg',
        supplier: item.supplierName,
        moq: 10, // Default MOQ
        supplierId: item.supplierId,
        availableStock: item.availableStock
      }))
      
      setCart(transformedCart)
      console.log(`Cart loaded for user ${userId}:`, transformedCart.length, 'items')
    } catch (error) {
      console.error('Error loading cart:', error)
      setCart([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product) => {
    if (!user?.id) {
      console.warn('User not logged in, cannot add to cart')
      toast?.warning('Please login to add items to cart', '🔐')
      return { success: false, message: 'Please login first' }
    }

    try {
      setLoading(true)
      console.log('Adding to cart:', { buyerId: user.id, productId: product.id, quantity: product.quantity || 1 })
      
      const response = await axios.post(CART_API_URL, {
        buyerId: parseInt(user.id),
        productId: product.id,
        quantity: product.quantity || 1
      })

      console.log('Added to cart successfully:', response.data)
      
      // Reload cart from backend
      await loadCartFromBackend(user.id)
      
      return { success: true, message: 'Added to cart successfully' }
    } catch (error) {
      console.error('Error adding to cart:', error)
      console.error('Error response:', error.response?.data)
      const errorMsg = error.response?.data?.message || 'Failed to add to cart. Please try again.'
      toast?.error(errorMsg, '❌')
      return { success: false, message: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (productId) => {
    if (!user?.id) return

    try {
      setLoading(true)
      const item = cart.find(i => i.id === productId)
      if (item && item.cartItemId) {
        await axios.delete(`${CART_API_URL}/items/${item.cartItemId}`)
        console.log('Removed from cart:', item.cartItemId)
        await loadCartFromBackend(user.id)
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (!user?.id) return

    try {
      setLoading(true)
      const item = cart.find(i => i.id === productId)
      if (item && item.cartItemId) {
        await axios.put(`${CART_API_URL}/items/${item.cartItemId}`, {
          quantity: quantity
        })
        console.log('Updated quantity:', item.cartItemId, quantity)
        await loadCartFromBackend(user.id)
      }
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      await axios.delete(`${CART_API_URL}/${user.id}`)
      console.log('Cart cleared for user:', user.id)
      setCart([])
    } catch (error) {
      console.error('Error clearing cart:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshCart = async () => {
    if (user?.id) {
      await loadCartFromBackend(user.id)
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemsCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    getCartTotal,
    getCartItemsCount,
    loading
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
