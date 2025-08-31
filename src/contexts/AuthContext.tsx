'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import authService from '@/services/auth'

interface User {
  id: string
  email: string
  name: string
  createdAt?: string
}

interface DecodedToken {
  userId: string
  email: string
  iat: number
  exp: number
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
  logout: () => void
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const checkAuthStatus = async () => {
    const token = authService.getAccessToken()
    
    if (token) {
      try {
        // Decode JWT to extract user information
        const decoded = jwtDecode<DecodedToken>(token)
        
        // Check if token is expired
        const currentTime = Date.now() / 1000
        if (decoded.exp < currentTime) {
          throw new Error('Token expired')
        }

        setIsAuthenticated(true)
        
        const savedUserData = localStorage.getItem('user')
        let userName = 'Usuario'
        
        if (savedUserData) {
          const parsedUser = JSON.parse(savedUserData)
          userName = parsedUser.name || userName
        }

        setUser({
          id: decoded.userId,
          email: decoded.email,
          name: userName,
          createdAt: new Date().toISOString()
        })
      } catch (error) {
        console.error('Auth verification failed:', error)
        authService.clearTokens()
        localStorage.removeItem('user')
        setIsAuthenticated(false)
        setUser(null)
      }
    } else {
      console.log("ENTRO ACA")
      setIsAuthenticated(false)
      setUser(null)
    }
    
    setIsInitialized(true)
  }

  const logout = () => {
    authService.clearTokens()
    setIsAuthenticated(false)
    setUser(null)
    // Redirect to home page
    window.location.href = '/'
  }

  const refreshAuth = async () => {
    await checkAuthStatus()
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        <div>Inicializando...</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      showLoginModal,
      setShowLoginModal,
      logout,
      refreshAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}