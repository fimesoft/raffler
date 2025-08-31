'use client'

import styles from './scss/DashboardCharts.module.scss'

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

export default function DashboardCharts() {
  const stats: RaffleStats = {
    totalRaffles: 3,
    activeRaffles: 2,
    expiredRaffles: 1,
    totalTicketsSold: 45,
    totalRevenue: 450000,
    averageTicketPrice: 10000,
    conversionRate: 75
  }
  const loading = false

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }


  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#ff9800' }: {
    percentage: number
    size?: number
    strokeWidth?: number
    color?: string
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className={styles.circularProgress} style={{ width: size, height: size }}>
        <svg width={size} height={size} className={styles.progressSvg}>
          <circle
            className={styles.progressBackground}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <circle
            className={styles.progressBar}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            style={{
              stroke: color,
              strokeDasharray,
              strokeDashoffset,
              transformOrigin: '50% 50%',
              transform: 'rotate(-90deg)'
            }}
          />
        </svg>
        <div className={styles.progressText}>
          <span className={styles.progressNumber}>{Math.round(percentage)}%</span>
        </div>
      </div>
    )
  }

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
        {/* Estado de Rifas */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Estado de Rifas</h3>
          <div className={styles.statusContainer}>
            <div className={styles.statusChart}>
              <CircularProgress 
                percentage={67} 
                size={100} 
                color="#22c55e"
              />
              <div className={styles.statusLabel}>Activas</div>
            </div>
            <div className={styles.statusStats}>
              <div className={styles.statusItem}>
                <div className={styles.statusDot} style={{ backgroundColor: '#22c55e' }}></div>
                <span>Activas: {stats.activeRaffles}</span>
              </div>
              <div className={styles.statusItem}>
                <div className={styles.statusDot} style={{ backgroundColor: '#ef4444' }}></div>
                <span>Finalizadas: {stats.expiredRaffles}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rendimiento de Ventas */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Rendimiento de Ventas</h3>
          <div className={styles.performanceContainer}>
            <CircularProgress 
              percentage={stats.conversionRate} 
              size={130} 
              strokeWidth={10}
              color={stats.conversionRate > 70 ? '#22c55e' : stats.conversionRate > 40 ? '#ff9800' : '#ef4444'}
            />
            <div className={styles.performanceInfo}>
              <div className={styles.performanceText}>
                <span className={styles.performanceLabel}>Tasa de Conversión</span>
                <span className={styles.performanceDescription}>
                  {stats.totalTicketsSold} boletos vendidos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Resumen Financiero</h3>
          <div className={styles.revenueStats}>
            <div className={styles.revenueStat}>
              <div className={styles.revenueIcon}>
                <VintageMoneyIcon />
              </div>
              <div className={styles.revenueInfo}>
                <span className={styles.revenueValue}>{formatCurrency(stats.totalRevenue)}</span>
                <span className={styles.revenueLabel}>Ingresos Totales</span>
              </div>
            </div>
            <div className={styles.revenueStat}>
              <div className={styles.revenueIcon}>
                <VintageTicketIcon />
              </div>
              <div className={styles.revenueInfo}>
                <span className={styles.revenueValue}>{stats.totalTicketsSold}</span>
                <span className={styles.revenueLabel}>Boletos Vendidos</span>
              </div>
            </div>
            <div className={styles.revenueStat}>
              <div className={styles.revenueIcon}>
                <VintageChartIcon />
              </div>
              <div className={styles.revenueInfo}>
                <span className={styles.revenueValue}>{formatCurrency(stats.averageTicketPrice)}</span>
                <span className={styles.revenueLabel}>Precio Promedio</span>
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
              <div className={styles.metricValue}>{stats.totalRaffles}</div>
              <div className={styles.metricLabel}>Total Rifas</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricIcon}>
                <VintageActiveIcon />
              </div>
              <div className={styles.metricValue}>{stats.activeRaffles}</div>
              <div className={styles.metricLabel}>Activas</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricIcon}>
                <VintageClockIcon />
              </div>
              <div className={styles.metricValue}>{stats.expiredRaffles}</div>
              <div className={styles.metricLabel}>Finalizadas</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricIcon}>
                <VintageTrendIcon />
              </div>
              <div className={styles.metricValue}>{Math.round(stats.conversionRate)}%</div>
              <div className={styles.metricLabel}>Conversión</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}