'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import authService from '@/services/auth'
import { raffleService } from '@/services/raffleService'
import styles from './scss/RaffleDrawer.module.scss'

interface Winner {
  position: number
  ticketNumber: number
  ticketId: string
  buyer: {
    id: string
    name: string
    email: string
    documentNumber: string | null
    phone: string | null
  }
  medal: 'gold' | 'silver' | 'bronze'
}

interface DrawResult {
  raffleId: string
  raffleTitle: string
  drawDate: string
  winners: Winner[]
  totalParticipants: number
  drawNumber: string
}

interface RaffleDrawerProps {
  raffleId: string
  raffleTitle: string
  onClose: () => void
}

// Medal Icons
const GoldMedalIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
    <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#B8860B" fontWeight="bold">1</text>
  </svg>
)

const SilverMedalIcon = () => (
  <svg width="35" height="35" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="7" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="2"/>
    <text x="12" y="16" textAnchor="middle" fontSize="11" fill="#696969" fontWeight="bold">2</text>
  </svg>
)

const BronzeMedalIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="6" fill="#CD7F32" stroke="#A0522D" strokeWidth="2"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#8B4513" fontWeight="bold">3</text>
  </svg>
)

export default function RaffleDrawer({ raffleId, raffleTitle, onClose }: RaffleDrawerProps) {
  const { isAuthenticated } = useAuth()
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawResult, setDrawResult] = useState<DrawResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [spinPhase, setSpinPhase] = useState<'idle' | 'spinning' | 'slowing' | 'stopped'>('idle')

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
              
              // Show the first winner number briefly
              if (response.draw.winners.length > 0) {
                setCurrentNumber(response.draw.winners[0].ticketNumber)
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

  const renderMedal = (medal: 'gold' | 'silver' | 'bronze') => {
    switch (medal) {
      case 'gold':
        return <GoldMedalIcon />
      case 'silver':
        return <SilverMedalIcon />
      case 'bronze':
        return <BronzeMedalIcon />
    }
  }

  const getMedalText = (medal: 'gold' | 'silver' | 'bronze') => {
    switch (medal) {
      case 'gold':
        return '🥇 Primer Lugar'
      case 'silver':
        return '🥈 Segundo Lugar'
      case 'bronze':
        return '🥉 Tercer Lugar'
    }
  }

  return (
    <div className={styles.overlay}>
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
                    ¡Listo para sortear 3 ganadores!
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

            <div className={styles.winners}>
              {drawResult.winners.map((winner, index) => (
                <div key={winner.ticketId} className={`${styles.winner} ${styles[winner.medal]}`}>
                  <div className={styles.medal}>
                    {renderMedal(winner.medal)}
                  </div>
                  <div className={styles.winnerInfo}>
                    <h4>{getMedalText(winner.medal)}</h4>
                    <div className={styles.ticketNumber}>
                      Boleto #{winner.ticketNumber.toString().padStart(3, '0')}
                    </div>
                    <div className={styles.buyerInfo}>
                      <p><strong>{winner.buyer.name}</strong></p>
                      <p>{winner.buyer.email}</p>
                      {winner.buyer.documentNumber && (
                        <p>Doc: {winner.buyer.documentNumber}</p>
                      )}
                      {winner.buyer.phone && (
                        <p>Tel: {winner.buyer.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
}