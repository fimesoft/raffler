'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import CreateRaffleForm from './CreateRaffleForm'
import RaffleGrid from './RaffleGrid'
import DashboardSidebar from './DashboardSidebar'
import DashboardCharts from './DashboardCharts'
import SalesManagement from './SalesManagement'
import styles from './scss/DashboardContent.module.scss'

export default function DashboardContent() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage' | 'browse' | 'sales'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className={styles.dashboard}>
      <DashboardSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onSidebarToggle={setSidebarOpen}
      />
      
      <div className={`${styles.container} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <header className={styles.header}>
          <div className={styles.headerCards}>
            <div className={styles.headerCard}>
              <div className={styles.cardContent}>
                <h2>Bienvenido al Dashboard</h2>
                <p>Hola, {session?.user?.name || 'Usuario'}</p>
              </div>
            </div>
            
            <div className={styles.headerCard}>
              <div className={styles.cardContent}>
                {/* Contenido vacío para la segunda card */}
              </div>
            </div>
            
            <div className={styles.headerCard}>
              <div className={styles.cardContent}>
                {/* Contenido vacío para la tercera card */}
              </div>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          {activeTab === 'overview' && (
            <div className={styles.overview}>
              <div className={styles.welcomeSection}>
                <h2>Resumen del Dashboard</h2>
                <p className={styles.welcomeText}>
                  Aquí puedes ver el rendimiento de tus rifas y estadísticas importantes
                </p>
              </div>
              
              <DashboardCharts />
              
              <div className={styles.quickActions}>
                <h3>Acciones Rápidas</h3>
                <div className={styles.actionsGrid}>
                  <button 
                    className={styles.primaryButton}
                    onClick={() => setActiveTab('create')}
                  >
                    <span className={styles.buttonIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </span>
                    Crear Nueva Rifa
                  </button>
                  <button 
                    className={styles.secondaryButton}
                    onClick={() => setActiveTab('manage')}
                  >
                    <span className={styles.buttonIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    </span>
                    Ver Mis Rifas
                  </button>
                  <button 
                    className={styles.secondaryButton}
                    onClick={() => setActiveTab('browse')}
                  >
                    <span className={styles.buttonIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                        <circle cx="11" cy="8" r="1"/>
                        <circle cx="8" cy="14" r="1"/>
                        <circle cx="14" cy="14" r="1"/>
                      </svg>
                    </span>
                    Explorar Rifas
                  </button>
                  <button 
                    className={styles.secondaryButton}
                    onClick={() => setActiveTab('sales')}
                  >
                    <span className={styles.buttonIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </span>
                    Ver Ventas
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className={styles.createSection}>
              <h2>Crear Nueva Rifa</h2>
              <CreateRaffleForm onRaffleCreated={() => setActiveTab('manage')} />
            </div>
          )}

          {activeTab === 'browse' && (
            <div className={styles.browseSection}>
              <h2>Explorar Rifas</h2>
              <p className={styles.sectionDescription}>
                Descubre y participa en rifas disponibles
              </p>
              <RaffleGrid showUserRaffles={false} />
            </div>
          )}

          {activeTab === 'manage' && (
            <div className={styles.manageSection}>
              <h2>Mis Rifas</h2>
              <p className={styles.sectionDescription}>
                Administra las rifas que has creado
              </p>
              <RaffleGrid showUserRaffles={true} />
            </div>
          )}

          {activeTab === 'sales' && (
            <div className={styles.salesSection}>
              <SalesManagement />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}