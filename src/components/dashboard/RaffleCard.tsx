'use client'

import { useState } from 'react'
import { type Raffle, raffleService } from '../../services/raffleService'
import { useAuth } from '../../contexts/AuthContext'
import authService from '../../services/auth'
import RaffleDrawer from './RaffleDrawer'
import styles from './scss/RaffleCard.module.scss'

interface RaffleCardProps {
  raffle: Raffle
  showActions?: boolean
  onDeleted?: (raffleId: string) => void
}

export default function RaffleCard({ raffle, showActions = false, onDeleted }: RaffleCardProps) {
  const { isAuthenticated } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

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
    
    if (diff <= 0) return 'Finalizada'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days} día${days === 1 ? '' : 's'} restante${days === 1 ? '' : 's'}`
    } else if (hours > 0) {
      return `${hours} hora${hours === 1 ? '' : 's'} restante${hours === 1 ? '' : 's'}`
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return `${minutes} minuto${minutes === 1 ? '' : 's'} restante${minutes === 1 ? '' : 's'}`
    }
  }

  const handleDelete = async () => {
    if (!onDeleted || raffle.soldTickets > 0 || !isAuthenticated) return

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar la rifa "${raffle.title}"?`
    )

    if (!confirmed) return

    try {
      setIsDeleting(true)
      const token = authService.getAccessToken()
      
      if (!token) {
        alert('Error de autenticación. Intenta cerrar e iniciar sesión nuevamente.')
        return
      }
      
      await raffleService.deleteRaffle(raffle.id, token)
      onDeleted(raffle.id)
    } catch (error) {
      console.error('Error al eliminar la rifa:', error)
      alert('No se pudo eliminar la rifa. Intenta de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  const progressPercentage = Math.round((raffle.soldTickets / raffle.maxTickets) * 100)
  const timeRemaining = getTimeRemaining(raffle.endDate)
  const isExpired = timeRemaining === 'Finalizada'

  return (
    <div className={`${styles.card} ${isExpired ? styles.expired : ''}`}>
      {raffle.image && (
        <div className={styles.imageContainer}>
          <img src={raffle.image} alt={raffle.title} className={styles.image} />
        </div>
      )}
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{raffle.title}</h3>
          <div className={styles.status}>
            {isExpired ? (
              <span className={styles.statusExpired}>Finalizada</span>
            ) : (
              <span className={styles.statusActive}>Activa</span>
            )}
          </div>
        </div>

        <p className={styles.description}>
          {raffle.description.length > 100 
            ? `${raffle.description.substring(0, 100)}...` 
            : raffle.description
          }
        </p>

        <div className={styles.prize}>
          <strong>Premio:</strong> {raffle.prize}
        </div>

        <div className={styles.details}>
          <div className={styles.detail}>
            <span className={styles.label}>Precio por boleto:</span>
            <span className={styles.value}>{formatPrice(raffle.ticketPrice)}</span>
          </div>
          
          <div className={styles.detail}>
            <span className={styles.label}>Creado por:</span>
            <span className={styles.value}>{raffle.user?.name}</span>
          </div>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressHeader}>
            <span>Boletos vendidos</span>
            <span>{raffle.soldTickets}/{raffle.maxTickets}</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className={styles.progressText}>
            {progressPercentage}% vendido
          </div>
        </div>

        <div className={styles.timing}>
          <div className={styles.timeRemaining}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {timeRemaining}
          </div>
          <div className={styles.endDate}>
            Termina: {formatDate(raffle.endDate)}
          </div>
        </div>

        {showActions && (
          <div className={styles.actions}>
            <button className={styles.viewButton}>
              Ver Detalles
            </button>
            
            {raffle.soldTickets >= 3 && !raffle.winnerId && (
              <button 
                className={styles.drawButton}
                onClick={() => setShowDrawer(true)}
              >
                🎲 Sortear Ganadores
              </button>
            )}
            
            {raffle.winnerId && (
              <button className={styles.winnersButton}>
                🏆 Ver Ganadores
              </button>
            )}
            
            {raffle.soldTickets === 0 && (
              <>
                <button className={styles.editButton}>
                  Editar
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </>
            )}
          </div>
        )}

        {!showActions && !isExpired && (
          <div className={styles.actions}>
            <button className={styles.buyButton}>
              Comprar Boletos
            </button>
          </div>
        )}
      </div>

      {showDrawer && (
        <RaffleDrawer
          raffleId={raffle.id}
          raffleTitle={raffle.title}
          onClose={() => setShowDrawer(false)}
        />
      )}
    </div>
  )
}