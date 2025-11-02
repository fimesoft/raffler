'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import AvatarDropdown from '@/components/ui/AvatarDropdown'
import styles from './Header.module.scss'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, setShowLoginModal, logout } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleAddAvatar = () => {
    console.log('Add Avatar clicked')
    // TODO: Implement add avatar functionality
  }

  const handleChangePassword = () => {
    console.log('Change Password clicked')
    // TODO: Implement change password functionality
  }

  // Close menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMenuOpen])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && !(event.target as Element).closest('[data-menu-container]')) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  return (
    <header className={styles.header} data-menu-container>
      <div className={styles.container}>
        <div className={styles.nav}>
          <div className={styles.logo}>
            <Link href="/">
              Rifala
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
                <div className={styles.userSection}>
                  <span className={styles.userWelcome}>
                    Hola, {user?.name || 'Usuario'}
                  </span>
                  <AvatarDropdown
                    name={user?.name || 'Usuario'}
                    size="sm"
                    onAddAvatar={handleAddAvatar}
                    onChangePassword={handleChangePassword}
                    onLogout={logout}
                  />
                </div>
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
            {isAuthenticated ? (
              <>
                {/* User Section */}
                <div className={styles.mobileUserSection}>
                  <div className={styles.userInfo}>
                    <AvatarDropdown
                      name={user?.name || 'Usuario'}
                      size="lg"
                      onAddAvatar={handleAddAvatar}
                      onChangePassword={handleChangePassword}
                      onLogout={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                    />
                    <div className={styles.userDetails}>
                      <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                      <span className={styles.userEmail}>{user?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Navigation */}
                <div className={styles.mobileNavSection}>
                  <h3 className={styles.navSectionTitle}>Dashboard</h3>
                  <div className={styles.mobileNavLinks}>
                    <Link 
                      href="/dashboard?tab=overview"
                      onClick={() => setIsMenuOpen(false)}
                      className={styles.navLink}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      <span>Resumen</span>
                    </Link>
                    <Link 
                      href="/dashboard?tab=create"
                      onClick={() => setIsMenuOpen(false)}
                      className={styles.navLink}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      <span>Crear Rifa</span>
                    </Link>
                    <Link 
                      href="/dashboard?tab=browse"
                      onClick={() => setIsMenuOpen(false)}
                      className={styles.navLink}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                      </svg>
                      <span>Explorar Rifas</span>
                    </Link>
                    <Link 
                      href="/dashboard?tab=manage"
                      onClick={() => setIsMenuOpen(false)}
                      className={styles.navLink}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 6h13"/>
                        <path d="M8 12h13"/>
                        <path d="M8 18h13"/>
                        <path d="M3 6h.01"/>
                        <path d="M3 12h.01"/>
                        <path d="M3 18h.01"/>
                      </svg>
                      <span>Mis Rifas</span>
                    </Link>
                    <Link 
                      href="/dashboard?tab=sales"
                      onClick={() => setIsMenuOpen(false)}
                      className={styles.navLink}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                      <span>Ventas</span>
                    </Link>
                  </div>
                </div>

                {/* Public Navigation */}
                <div className={styles.mobileNavSection}>
                  <h3 className={styles.navSectionTitle}>Navegación</h3>
                  <div className={styles.mobileNavLinks}>
                    <Link 
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className={styles.navLink}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                      </svg>
                      <span>Inicio</span>
                    </Link>
                    <Link 
                      href="/rifas"
                      onClick={() => setIsMenuOpen(false)}
                      className={styles.navLink}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6"/>
                        <path d="m21 12-6 0m-6 0-6 0"/>
                      </svg>
                      <span>Rifas Públicas</span>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              /* Non-authenticated user menu */
              <div className={styles.mobileNavLinks}>
                <Link 
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={styles.navLink}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                  <span>Inicio</span>
                </Link>
                <Link 
                  href="/rifas"
                  onClick={() => setIsMenuOpen(false)}
                  className={styles.navLink}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6"/>
                    <path d="m21 12-6 0m-6 0-6 0"/>
                  </svg>
                  <span>Rifas</span>
                </Link>
                <button 
                  onClick={() => {
                    setShowLoginModal(true)
                    setIsMenuOpen(false)
                  }}
                  className={styles.mobileLoginButton}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10,17 15,12 10,7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  <span>Iniciar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}