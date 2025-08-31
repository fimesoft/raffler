'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import authService from '@/services/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getAccessToken()
      
      if (!token) {
        setIsAuthenticated(false)
        router.push('/')
        return
      }

      try {
        // Optionally verify token with backend
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth verification failed:', error)
        authService.clearTokens()
        setIsAuthenticated(false)
        router.push('/')
      }
    }

    checkAuth()
  }, [router])

  if (isAuthenticated === null) {
    return (
      fallback || (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          fontSize: '16px',
          color: '#666'
        }}>
          <div>Cargando...</div>
        </div>
      )
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}