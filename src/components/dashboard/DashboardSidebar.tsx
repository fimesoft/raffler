'use client'

import { useState } from 'react'
import styles from './scss/DashboardSidebar.module.scss'

interface DashboardSidebarProps {
  activeTab: 'overview' | 'create' | 'manage' | 'browse' | 'sales'
  onTabChange: (tab: 'overview' | 'create' | 'manage' | 'browse' | 'sales') => void
  onSidebarToggle?: (isOpen: boolean) => void
}

// SVG Icons Components
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
)

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 6h13"/>
    <path d="M8 12h13"/>
    <path d="M8 18h13"/>
    <path d="M3 6h.01"/>
    <path d="M3 12h.01"/>
    <path d="M3 18h.01"/>
  </svg>
)

const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15,18 9,12 15,6"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
)

const SalesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)

export default function DashboardSidebar({ activeTab, onTabChange, onSidebarToggle }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const menuItems = [
    {
      key: 'overview' as const,
      icon: <DashboardIcon />,
      label: 'Resumen',
      description: 'Vista general y estadísticas'
    },
    {
      key: 'create' as const,
      icon: <PlusIcon />,
      label: 'Crear Rifa',
      description: 'Crear una nueva rifa'
    },
    {
      key: 'browse' as const,
      icon: <SearchIcon />,
      label: 'Explorar Rifas',
      description: 'Descubre rifas disponibles'
    },
    {
      key: 'manage' as const,
      icon: <ListIcon />,
      label: 'Mis Rifas',
      description: 'Administra tus rifas'
    },
    {
      key: 'sales' as const,
      icon: <SalesIcon />,
      label: 'Ventas',
      description: 'Gestiona las compras de tus rifas'
    }
  ]

  const toggleSidebar = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onSidebarToggle?.(newState)
  }

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          {isOpen && <span className={styles.logoText}>Dashboard</span>}
        </div>
        <button 
          onClick={toggleSidebar}
          className={styles.toggleButton}
          aria-label={isOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
        >
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>
      </div>

      <nav className={styles.navigation}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.key} className={styles.menuItem}>
              <button
                onClick={() => onTabChange(item.key)}
                className={`${styles.menuButton} ${activeTab === item.key ? styles.active : ''}`}
                title={!isOpen ? item.label : undefined}
                aria-label={item.label}
              >
                <span className={styles.menuIcon}>
                  {item.icon}
                </span>
                {isOpen && (
                  <div className={styles.menuContent}>
                    <span className={styles.menuLabel}>{item.label}</span>
                    <span className={styles.menuDescription}>{item.description}</span>
                  </div>
                )}
              </button>
              
              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipContent}>
                    <span className={styles.tooltipLabel}>{item.label}</span>
                    <span className={styles.tooltipDescription}>{item.description}</span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.footerContent}>
          {isOpen && (
            <div className={styles.footerText}>
              <span>Raffler</span>
              <span className={styles.version}>v1.0</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}