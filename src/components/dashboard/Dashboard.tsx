'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import CreateRaffleForm from './CreateRaffleForm'
import RaffleGrid from './RaffleGrid'
import DashboardSidebar from './DashboardSidebar'
import SalesManagement from './SalesManagement'
import { CircularProgress, CircularArrowButton } from '../shared'
import styles from './scss/Dashboard.module.scss'
import { API_CONFIG } from '@/config/api'
import authService from '@/services/auth'

// Iconos SVG Vintage
const VintageMoneyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
)

const VintageTicketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
    <path d="M13 5v2"/>
    <path d="M13 17v2"/>
    <path d="M13 11v2"/>
  </svg>
)

const VintageChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 3v18h18"/>
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
  </svg>
)

const VintageTrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55.47.98.97 1.21C12.04 18.75 14 20.24 14 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
)

const VintageActiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
)

const VintageClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 8,14"/>
    <path d="M16 8l-2 2"/>
    <path d="M8 16l2-2"/>
  </svg>
)

const VintageTrendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    <circle cx="9" cy="3" r="1" fill="currentColor"/>
    <circle cx="15" cy="21" r="1" fill="currentColor"/>
  </svg>
)

interface RaffleStats {
  totalRaffles: number
  activeRaffles: number
  expiredRaffles: number
  totalTicketsSold: number
  totalRevenue: number
  averageTicketPrice: number
  conversionRate: number
}

interface RaffleStatusResponse {
  activeRaffles: number
  expiredRaffles: number
}

interface UserRaffleStatsResponse {
  totalRaffles: number
  activeRaffles: number
  expiredRaffles: number
  totalTicketsSold: number
  totalTicketsInActiveRaffles: number
  totalRevenue: number
  averageTicketPrice: number
  conversionRate: number
}

export default function Dashboard() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage' | 'browse' | 'sales'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [raffleStatus, setRaffleStatus] = useState<RaffleStatusResponse | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<UserRaffleStatsResponse>()
  const [loadingUserStats, setLoadingUserStats] = useState(true)
  const [userStatsError, setUserStatsError] = useState<string | null>(null)
  
  // Combine data from different APIs or use defaults

  
  const loading = false

  // Handle URL query parameters for active tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'create', 'manage', 'browse', 'sales'].includes(tab)) {
      setActiveTab(tab as 'overview' | 'create' | 'manage' | 'browse' | 'sales')
    }
  }, [searchParams])

  // Fetch raffle status from API
  /*useEffect(() => {
    const fetchRaffleStatus = async () => {
      try {
        setLoadingStatus(true)
        setStatusError(null)
        
        const response = await fetch(`${API_CONFIG.baseURL}/api/raffles/status`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch raffle status')
        }
        
        const data: RaffleStatusResponse = await response.json()
        setRaffleStatus(data)
      } catch (error) {
        console.error('Error fetching raffle status:', error)
        setStatusError('Error loading raffle statistics')
      } finally {
        setLoadingStatus(false)
      }
    }

    fetchRaffleStatus()
  }, [])*/

  // Fetch user's raffle stats from API
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoadingUserStats(true)
        setUserStatsError(null)

        const token = authService.getAccessToken()
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch(`${API_CONFIG.baseURL}/api/raffles/my/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user raffle stats')
        }

        const data: UserRaffleStatsResponse = await response.json()
        setUserStats(data)
      } catch (error) {
        console.error('Error fetching user raffle stats:', error)
        setUserStatsError('Error loading user statistics')
      } finally {
        setLoadingUserStats(false)
      }
    }

    fetchUserStats()
  }, [session])

  const renderCharts = () => {
    if (loading) {
      return (
        <div className={styles.chartsContainer}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando estadísticas...</p>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.chartsContainer}>
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Rendimiento de Ventas</h3>
            <div className={styles.performanceContainer}>
              <CircularProgress
                percentage={userStats?.conversionRate ?? 0}
                size={85}
                color="#F2771A"
              />
              <div className={styles.performanceStats}>
                <div className={styles.performanceStat}>
                  <span className={styles.performanceLabel}>Tasa de Conversión</span>
                  <span className={styles.performanceValue}>{userStats?.conversionRate ?? 0}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Resumen Financiero</h3>
            <div className={styles.revenueStats}>
              <div className={styles.revenueStat}>
                <div className={styles.revenueIcon}>
                  <VintageMoneyIcon />
                </div>
                <div className={styles.revenueInfo}>
                  <div className={styles.revenueValue}>{userStats?.totalRevenue ?? 0}</div>
                  <div className={styles.revenueLabel}>Ingresos Totales</div>
                </div>
              </div>
              <div className={styles.revenueStat}>
                <div className={styles.revenueIcon}>
                  <VintageTicketIcon />
                </div>
                <div className={styles.revenueInfo}>
                  <div className={styles.revenueValue}>{userStats?.totalTicketsSold ?? 0}</div>
                  <div className={styles.revenueLabel}>Boletos Vendidos</div>
                </div>
              </div>
              <div className={styles.revenueStat}>
                <div className={styles.revenueIcon}>
                  <VintageChartIcon />
                </div>
                <div className={styles.revenueInfo}>
                  <div className={styles.revenueValue}>{userStats?.averageTicketPrice ?? 0}</div>
                  <div className={styles.revenueLabel}>Precio Promedio</div>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas Clave */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Métricas Clave</h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metric}>
                <div className={styles.metricIcon}>
                  <VintageTrophyIcon />
                </div>
                <div className={styles.metricValue}>{userStats?.totalRaffles ?? 0}</div>
                <div className={styles.metricLabel}>Total Rifas</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricIcon}>
                  <VintageActiveIcon />
                </div>
                <div className={styles.metricValue}>{userStats?.activeRaffles ?? 0}</div>
                <div className={styles.metricLabel}>Activas</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricIcon}>
                  <VintageClockIcon />
                </div>
                <div className={styles.metricValue}>{userStats?.expiredRaffles ?? 0}</div>
                <div className={styles.metricLabel}>Finalizadas</div>
              </div>
              <div className={styles.metric}>
                <div className={styles.metricIcon}>
                  <VintageTrendIcon />
                </div>
                <div className={styles.metricValue}>{userStats?.conversionRate ?? 0}%</div>
                <div className={styles.metricLabel}>Conversión</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <DashboardSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onSidebarToggle={setSidebarOpen}
      />
      
      <div className={`${styles.container} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        {/* Solo mostrar el header con estadísticas en overview, manage y sales */}
        {activeTab !== 'create' && activeTab !== 'browse' && activeTab !== 'manage' && activeTab !== 'sales' && (
          <div className={styles.header}>
            <button
              className={styles.primaryButton}
              onClick={() => setActiveTab('create')}
            >
              <span className={styles.buttonIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              Nuevo Sorteo
            </button>
            <div className={styles.headerCards}>
              <div className={styles.headerCard}>
                <CircularArrowButton onClick={() => setActiveTab('manage')} />
                <div className={styles.cardContent}>
                  <h2>Sorteos Totales</h2>
                  <p>{userStats?.totalRaffles ?? 0}</p>
                </div>
              </div>
              <div className={styles.headerCard}>
                <div className={styles.cardContent}>
                  <h3 className={styles.chartTitle}>Estado de los sorteos</h3>
                    <div className={styles.statusContainer}>
                      <div className={styles.statusChart}>
                        <CircularProgress
                          percentage={(userStats?.totalRaffles ?? 0) > 0 ? Math.round(((userStats?.activeRaffles ?? 0) / (userStats?.totalRaffles ?? 1)) * 100) : 0}
                          size={85}
                          color="#F2771A"
                        />
                        <div className={styles.statusLabel}>
                          {(userStats?.totalRaffles ?? 0) > 0 ? `${Math.round(((userStats?.activeRaffles ?? 0) / (userStats?.totalRaffles ?? 1)) * 100)}%` : '0%'} Activas
                        </div>
                      </div>
                      <div className={styles.statusStats}>
                        <div className={styles.statusItem}>
                          <div className={styles.statusDot} style={{ backgroundColor: '#F2771A' }}></div>
                          <span>Activas: {userStats?.activeRaffles ?? 0}</span>
                        </div>
                        <div className={styles.statusItem}>
                          <div className={styles.statusDot} style={{ backgroundColor: '#ef4444' }}></div>
                          <span>Finalizadas: {userStats?.expiredRaffles ?? 0}</span>
                        </div>
                      </div>
                    </div>
                </div>
              </div>

              <div className={styles.headerCard}>
                <div className={styles.cardContent}>
                  <h3 className={styles.chartTitle}>Cantidad de Tickets Vendidos</h3>
                  {loadingUserStats ? (
                    <div className={styles.loading}>
                      <div className={styles.spinner}></div>
                      <p>Cargando...</p>
                    </div>
                  ) : userStatsError ? (
                    <div className={styles.noData}>
                      <p>{userStatsError}</p>
                    </div>
                  ) : (
                    <div className={styles.statusContainer}>
                      <div className={styles.statusChart}>
                        <CircularProgress
                          percentage={(userStats?.totalTicketsInActiveRaffles ?? 0) > 0 ? Math.min(100, Math.round(((userStats?.totalTicketsSold ?? 0) / (userStats?.totalTicketsInActiveRaffles ?? 1)) * 100)) : 0}
                          size={85}
                          color="#F2771A"
                        />
                        <div className={styles.statusLabel}>Vendidos</div>
                      </div>
                      <div className={styles.statusStats}>
                        <div className={styles.statusItem}>
                          <div className={styles.statusDot} style={{ backgroundColor: '#F2771A' }}></div>
                          <span>Total: {userStats?.totalTicketsSold ?? 0}</span>
                        </div>
                        <div className={styles.statusItem}>
                          <div className={styles.statusDot} style={{ backgroundColor: '#3b82f6' }}></div>
                          <span>Ingresos: {userStats?.totalRevenue ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <main className={`${styles.content}`}>
          {activeTab === 'overview' && (
            <div className={styles.overview}>
              {renderCharts()}
              <div className={styles.quickActions}>
                <h3>Acciones Rápidas</h3>
                <div className={styles.actionsGrid}>
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