'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import authService from '@/services/auth'
import { raffleService } from '@/services/raffleService'
import styles from './scss/RaffleDrawer.module.scss'

interface Winner {
  ticketNumber: number
  ticketId: string
  buyer: {
    id: string
    name: string
    email: string
    documentNumber: string | null
    phone: string | null
  }
}

interface DrawResult {
  raffleId: string
  raffleTitle: string
  drawDate: string
  winner: Winner
  totalParticipants: number
  drawNumber: string
}

interface RaffleDrawerProps {
  raffleId: string
  raffleTitle: string
  onClose: () => void
}

// Trophy Icon
const TrophyIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="#FFD700" strokeWidth="2"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="#FFD700" strokeWidth="2"/>
    <path d="M4 22h16" stroke="#FFA500" strokeWidth="2"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" stroke="#FFD700" strokeWidth="2"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" stroke="#FFD700" strokeWidth="2"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
  </svg>
)

export default function RaffleDrawer({ raffleId, raffleTitle, onClose }: RaffleDrawerProps) {
  const { isAuthenticated } = useAuth()
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [spinPhase, setSpinPhase] = useState<'idle' | 'spinning' | 'slowing' | 'stopped'>('idle')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden'

    return () => {
      setMounted(false)
      document.body.style.overflow = ''
    }
  }, [])

  const handleDrawWinners = async () => {
    if (!isAuthenticated) {
      setError('Debes estar autenticado para sortear')
      return
    }

    try {
      setIsDrawing(true)
      setError(null)
      setSpinPhase('spinning')

      const token = authService.getAccessToken()
      if (!token) {
        setError('Error de autenticación')
        return
      }

      // Simulate roulette animation
      let counter = 0
      const maxCount = 50 // Number of spins before stopping
      
      const spinInterval = setInterval(() => {
        counter++
        setCurrentNumber(Math.floor(Math.random() * 100) + 1)
        
        if (counter >= maxCount) {
          clearInterval(spinInterval)
          setSpinPhase('slowing')
          
          // After slowing animation, make the API call
          setTimeout(async () => {
            try {
              const response = await raffleService.drawRaffleWinners(raffleId, token)
              setDrawResult(response.draw)
              setSpinPhase('stopped')

              // Show the winner number
              if (response.draw.winner) {
                setCurrentNumber(response.draw.winner.ticketNumber)
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Error al sortear ganadores')
              setSpinPhase('idle')
            }
          }, 1000)
        }
      }, counter < 20 ? 100 : counter < 40 ? 200 : 300) // Gradually slow down

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al sortear ganadores')
      setSpinPhase('idle')
    } finally {
      setIsDrawing(false)
    }
  }


  if (!mounted) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const drawerContent = (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      {/* Header fijo en la parte superior */}
      <div className={styles.floatingHeader}>
        <h2>Sorteo de Ganadores - {raffleTitle}</h2>
        <button onClick={onClose} className={styles.closeButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {!drawResult ? (
        <>
          {/* Ruleta en el centro de la pantalla */}
          <div className={styles.centerRoulette}>
            <div className={`${styles.roulette} ${spinPhase !== 'idle' ? styles.spinning : ''}`}>
              <div className={`${styles.wheel} ${styles[spinPhase]}`}>
                <div className={styles.pointer}></div>
                <div className={styles.numberDisplay}>
                  {currentNumber || '?'}
                </div>
              </div>
            </div>

            {/* Estado de sorteo debajo de la ruleta */}
            <div className={styles.rouletteStatus}>
              {error && (
                <div className={styles.error}>
                  <p>{error}</p>
                </div>
              )}

              {!isDrawing && spinPhase === 'idle' && (
                <div className={styles.drawSection}>
                  <p className={styles.instructionText}>
                    ¡Listo para sortear al ganador!
                  </p>
                  <button
                    onClick={handleDrawWinners}
                    className={styles.drawButton}
                    disabled={isDrawing}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <polygon points="10,8 16,12 10,16"/>
                    </svg>
                    Comenzar Sorteo
                  </button>
                </div>
              )}

              {isDrawing && (
                <div className={styles.drawingStatus}>
                  <div className={styles.spinner}></div>
                  <p>
                    {spinPhase === 'spinning' && 'Girando la ruleta...'}
                    {spinPhase === 'slowing' && 'Determinando ganadores...'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Modal de resultados */
        <div className={styles.resultsModal}>
          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <h3>🎉 ¡Sorteo Completado! 🎉</h3>
              <div className={styles.drawInfo}>
                <p><strong>Fecha:</strong> {new Date(drawResult.drawDate).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                <p><strong>Participantes:</strong> {drawResult.totalParticipants}</p>
                <p><strong>Número de sorteo:</strong> #{drawResult.drawNumber}</p>
              </div>
            </div>

            <div className={styles.winnerContainer}>
              <div className={styles.trophy}>
                <TrophyIcon />
              </div>
              <div className={styles.winnerCard}>
                <h4 className={styles.winnerTitle}>🎊 GANADOR 🎊</h4>
                <div className={styles.ticketNumber}>
                  Boleto #{drawResult.winner.ticketNumber.toString().padStart(3, '0')}
                </div>
                <div className={styles.winnerDetails}>
                  <div className={styles.winnerName}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <strong>{drawResult.winner.buyer.name}</strong>
                  </div>
                  <div className={styles.winnerEmail}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {drawResult.winner.buyer.email}
                  </div>
                  {drawResult.winner.buyer.documentNumber && (
                    <div className={styles.winnerDoc}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                      Doc: {drawResult.winner.buyer.documentNumber}
                    </div>
                  )}
                  {drawResult.winner.buyer.phone && (
                    <div className={styles.winnerPhone}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      Tel: {drawResult.winner.buyer.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button onClick={onClose} className={styles.closeResultsButton}>
                Cerrar Resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(drawerContent, document.body)
}