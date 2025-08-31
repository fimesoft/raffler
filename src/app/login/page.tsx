'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { setShowLoginModal, isAuthenticated } = useAuth()

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard')
      return
    }

    // Open login modal and redirect to home
    setShowLoginModal(true)
    router.push('/')
  }, [isAuthenticated, setShowLoginModal, router])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '50vh',
      fontSize: '16px',
      color: '#666'
    }}>
      <div>Redirigiendo...</div>
    </div>
  )
}