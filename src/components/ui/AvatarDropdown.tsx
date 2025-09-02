'use client'

import { useState, useRef, useEffect } from 'react'
import Avatar from './Avatar'
import styles from './AvatarDropdown.module.scss'

interface AvatarDropdownProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  onAddAvatar?: () => void
  onChangePassword?: () => void
  onLogout?: () => void
  className?: string
}

export default function AvatarDropdown({ 
  name, 
  size = 'md', 
  onAddAvatar,
  onChangePassword,
  onLogout,
  className = '' 
}: AvatarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleAvatarClick = () => {
    setIsOpen(!isOpen)
  }

  const handleMenuItemClick = (action: () => void | undefined) => {
    if (action) {
      action()
    }
    setIsOpen(false)
  }

  return (
    <div className={`${styles.avatarDropdown} ${className}`} ref={dropdownRef}>
      <button 
        className={styles.avatarButton}
        onClick={handleAvatarClick}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Menú de usuario"
      >
        <Avatar name={name} size={size} />
        <svg 
          className={`${styles.dropdownIcon} ${isOpen ? styles.open : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M4 6L8 10L12 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="menu">
          {onAddAvatar && (
            <button 
              className={styles.menuItem}
              onClick={() => handleMenuItemClick(onAddAvatar)}
              role="menuitem"
            >
              <svg 
                className={styles.menuIcon}
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M8 2V14M2 8H14" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              Agregar Avatar
            </button>
          )}
          
          {onChangePassword && (
            <button 
              className={styles.menuItem}
              onClick={() => handleMenuItemClick(onChangePassword)}
              role="menuitem"
            >
              <svg 
                className={styles.menuIcon}
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 7V5C4 3.89543 4.89543 3 6 3H10C11.1046 3 12 3.89543 12 5V7M3 7H13C13.5523 7 14 7.44772 14 8V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V8C2 7.44772 2.44772 7 3 7Z" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              Cambiar Contraseña
            </button>
          )}

          <div className={styles.menuSeparator} />

          {onLogout && (
            <button 
              className={`${styles.menuItem} ${styles.danger}`}
              onClick={() => handleMenuItemClick(onLogout)}
              role="menuitem"
            >
              <svg 
                className={styles.menuIcon}
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M6 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H6M10 5L14 9L10 13M14 9H6" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              Cerrar Sesión
            </button>
          )}
        </div>
      )}
    </div>
  )
}