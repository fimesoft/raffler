'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './LoginModal'

export default function AuthModal() {
  const { showLoginModal, setShowLoginModal } = useAuth()

  if (!showLoginModal) {
    return null
  }

  return (
    <LoginModal onClose={() => setShowLoginModal(false)} />
  )
}