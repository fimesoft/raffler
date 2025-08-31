'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Header.module.scss'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, setShowLoginModal, logout } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.nav}>
          <div className={styles.logo}>
            <Link href="/">
              Raffler
            </Link>
          </div>

          <nav className={styles.desktopNav}>
            <div className={styles.navLinks}>
              {!isAuthenticated && (
                <>
                  <Link href="/">
                    Inicio
                  </Link>
                  <Link href="/rifas">
                    Rifas
                  </Link>
                </>
              )}
              {isAuthenticated ? (
                <>
                  <span className={styles.userWelcome}>
                    Hola, {user?.name || 'Usuario'}
                  </span>
                  <button 
                    onClick={logout}
                    className={styles.logoutButton}
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className={styles.loginButton}
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </nav>

          <button
            onClick={toggleMenu}
            className={styles.hamburger}
            aria-expanded={isMenuOpen}
          >
            <span className={styles.srOnly}>Abrir menú principal</span>
            <div className={styles.iconContainer}>
              <span className={`${styles.topLine} ${isMenuOpen ? styles.open : ''}`}></span>
              <span className={`${styles.middleLine} ${isMenuOpen ? styles.open : ''}`}></span>
              <span className={`${styles.bottomLine} ${isMenuOpen ? styles.open : ''}`}></span>
            </div>
          </button>
        </div>

        <div className={`${styles.mobileNav} ${isMenuOpen ? styles.open : styles.closed}`}>
          <div className={styles.mobileNavContent}>
            <div className={styles.mobileNavLinks}>
              {!isAuthenticated && (
                <>
                  <Link 
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <Link 
                    href="/rifas"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Rifas
                  </Link>
                </>
              )}
              {isAuthenticated ? (
                <>
                  <span className={styles.mobileUserWelcome}>
                    Hola, {user?.name || 'Usuario'}
                  </span>
                  <button 
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className={styles.mobileLogoutButton}
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setShowLoginModal(true)
                    setIsMenuOpen(false)
                  }}
                  className={styles.mobileLoginButton}
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}