'use client'

import { type Raffle } from '@/services/raffleService'
import styles from './scss/RafflePublicCard.module.scss'

interface RafflePublicCardProps {
  raffle: Raffle
  onClick: () => void
}

export default function RafflePublicCard({ raffle, onClick }: RafflePublicCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return { text: 'Finalizada', urgent: false }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 1) {
      return { text: `${days} días restantes`, urgent: false }
    } else if (days === 1) {
      return { text: `1 día restante`, urgent: true }
    } else if (hours > 0) {
      return { text: `${hours} horas restantes`, urgent: true }
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return { text: `${minutes} min restantes`, urgent: true }
    }
  }

  const getPopularityLevel = () => {
    const percentage = (raffle.soldTickets / raffle.maxTickets) * 100
    if (percentage >= 80) return 'hot'
    if (percentage >= 50) return 'popular'
    return 'normal'
  }

  const progressPercentage = Math.round((raffle.soldTickets / raffle.maxTickets) * 100)
  const timeInfo = getTimeRemaining(raffle.endDate)
  const isExpired = timeInfo.text === 'Finalizada'
  const popularityLevel = getPopularityLevel()

  if (isExpired) return null // No mostrar rifas finalizadas

  return (
    <div 
      className={`${styles.card} ${styles[popularityLevel]} ${timeInfo.urgent ? styles.urgent : ''}`}
      onClick={onClick}
    >
      {popularityLevel === 'hot' && (
        <div className={styles.hotBadge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
          Popular
        </div>
      )}

      {raffle.image && (
        <div className={styles.imageContainer}>
          <img src={raffle.image} alt={raffle.title} className={styles.image} />
          <div className={styles.imageOverlay}>
            <div className={styles.ticketInfo}>
              <span className={styles.ticketPrice}>{formatPrice(raffle.ticketPrice)}</span>
              <span className={styles.ticketLabel}>por boleto</span>
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{raffle.title}</h3>
          <div className={`${styles.timeRemaining} ${timeInfo.urgent ? styles.urgent : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            {timeInfo.text}
          </div>
        </div>

        <div className={styles.prize}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55.47.98.97 1.21C12.04 18.75 14 20.24 14 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
          </svg>
          <strong>{raffle.prize}</strong>
        </div>

        <p className={styles.description}>
          {raffle.description.length > 80 
            ? `${raffle.description.substring(0, 80)}...` 
            : raffle.description
          }
        </p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Números disponibles</span>
            <span className={styles.statValue}>
              {raffle.maxTickets - raffle.soldTickets} de {raffle.maxTickets}
            </span>
          </div>
          
          <div className={styles.stat}>
            <span className={styles.statLabel}>Organizador</span>
            <span className={styles.statValue}>{raffle.creator?.name}</span>
          </div>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressHeader}>
            <span>Progreso de la rifa</span>
            <span className={styles.progressPercentage}>{progressPercentage}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className={styles.progressInfo}>
            <span>{raffle.soldTickets} vendidos</span>
            <span>{raffle.maxTickets - raffle.soldTickets} disponibles</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.participateButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
              <line x1="13" y1="5" x2="13" y2="19"/>
              <line x1="13" y1="17" x2="13" y2="19"/>
              <line x1="13" y1="11" x2="13" y2="13"/>
            </svg>
            Participar Ahora
          </button>
          
          <div className={styles.endDate}>
            Termina: {formatDate(raffle.endDate)}
          </div>
        </div>
      </div>
    </div>
  )
}