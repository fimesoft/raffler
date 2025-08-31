'use client'

import { useState, useEffect } from 'react'
import { type Raffle, raffleService } from '@/services/raffleService'
import { useAuth } from '@/contexts/AuthContext'
import authService from '@/services/auth'
import NumberSelector from './NumberSelector'
import styles from './scss/RaffleDetailModal.module.scss'

interface RaffleDetailModalProps {
  raffle: Raffle
  onClose: () => void
  onTicketPurchased: () => void
}

export default function RaffleDetailModal({ raffle, onClose, onTicketPurchased }: RaffleDetailModalProps) {
  const { isAuthenticated } = useAuth()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [soldNumbers, setSoldNumbers] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'manual' | 'random'>('manual')
  const [quantity, setQuantity] = useState(1)
  const [loadingSoldNumbers, setLoadingSoldNumbers] = useState(true)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const availableNumbers = raffle.maxTickets - raffle.soldTickets
  const totalCost = selectedNumbers.length * raffle.ticketPrice
  const shouldUseRandomSelection = raffle.maxTickets > 1000

  // Cargar números vendidos al abrir el modal
  useEffect(() => {
    const loadSoldNumbers = async () => {
      try {
        setLoadingSoldNumbers(true)
        const response = await raffleService.getRaffleTickets(raffle.id)
        setSoldNumbers(response.soldNumbers)
      } catch (error) {
        console.error('Error loading sold numbers:', error)
        setSoldNumbers([])
      } finally {
        setLoadingSoldNumbers(false)
      }
    }

    loadSoldNumbers()
  }, [raffle.id])

  // Auto-seleccionar modo aleatorio para rifas grandes
  useEffect(() => {
    if (shouldUseRandomSelection) {
      setSelectionMode('random')
    }
  }, [shouldUseRandomSelection])

  const handleRandomSelection = () => {
    // Filtrar números disponibles (no vendidos)
    const available = Array.from({ length: raffle.maxTickets }, (_, i) => i + 1)
      .filter(num => !soldNumbers.includes(num))
    
    const randomNumbers = []
    const maxQuantity = Math.min(quantity, available.length)
    
    for (let i = 0; i < maxQuantity; i++) {
      const randomIndex = Math.floor(Math.random() * available.length)
      const selectedNumber = available[randomIndex]
      randomNumbers.push(selectedNumber)
      available.splice(randomIndex, 1)
    }
    
    setSelectedNumbers(randomNumbers.sort((a, b) => a - b))
  }

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para comprar boletos')
      return
    }

    if (selectedNumbers.length === 0) {
      alert('Debes seleccionar al menos un número')
      return
    }

    try {
      setIsProcessing(true)
      const token = authService.getAccessToken()
      
      if (!token) {
        alert('Error de autenticación. Intenta cerrar e iniciar sesión nuevamente.')
        return
      }

      console.log('Comprando boletos:', {
        raffleId: raffle.id,
        numbers: selectedNumbers,
        totalCost
      })

      const response = await raffleService.purchaseTickets(raffle.id, selectedNumbers, token)
      
      alert(`¡Compra exitosa! Has adquirido los números: ${response.purchasedNumbers.join(', ')}\nID de transacción: ${response.transactionId}`)
      onTicketPurchased()
      
    } catch (error) {
      console.error('Error al comprar boletos:', error)
      alert('Error al procesar la compra. Intenta de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{raffle.title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalContent}>
          {raffle.image && (
            <div className={styles.imageContainer}>
              <img src={raffle.image} alt={raffle.title} />
            </div>
          )}

          <div className={styles.raffleInfo}>
            <div className={styles.prize}>
              <h3>Premio</h3>
              <p>{raffle.prize}</p>
            </div>

            <div className={styles.description}>
              <h3>Descripción</h3>
              <p>{raffle.description}</p>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.label}>Precio por boleto</span>
                <span className={styles.value}>{formatPrice(raffle.ticketPrice)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>Números disponibles</span>
                <span className={styles.value}>{availableNumbers} de {raffle.maxTickets}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>Organizada por</span>
                <span className={styles.value}>{raffle.user?.name}</span>
              </div>
            </div>
          </div>

          <div className={styles.numberSelection}>
            <h3>Selección de números</h3>
            
            {shouldUseRandomSelection ? (
              <div className={styles.randomModeInfo}>
                <div className={styles.infoBox}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <p>
                    Esta rifa tiene más de 1000 números. Los números se asignarán automáticamente 
                    de forma aleatoria para garantizar una selección justa.
                  </p>
                </div>
                
                <div className={styles.quantitySelector}>
                  <label>¿Cuántos boletos quieres comprar?</label>
                  <div className={styles.quantityControls}>
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(availableNumbers, parseInt(e.target.value) || 1)))}
                      min="1"
                      max={availableNumbers}
                    />
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.min(availableNumbers, quantity + 1))}
                      disabled={quantity >= availableNumbers}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                  className={styles.generateButton}
                  onClick={handleRandomSelection}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                  Generar números aleatorios
                </button>
              </div>
            ) : (
              <div className={styles.manualMode}>
                <div className={styles.selectionModeToggle}>
                  <button 
                    className={`${styles.modeButton} ${selectionMode === 'manual' ? styles.active : ''}`}
                    onClick={() => setSelectionMode('manual')}
                  >
                    Manual
                  </button>
                  <button 
                    className={`${styles.modeButton} ${selectionMode === 'random' ? styles.active : ''}`}
                    onClick={() => setSelectionMode('random')}
                  >
                    Aleatorio
                  </button>
                </div>

                {selectionMode === 'random' ? (
                  <div className={styles.randomSelection}>
                    <div className={styles.quantitySelector}>
                      <label>¿Cuántos boletos quieres?</label>
                      <div className={styles.quantityControls}>
                        <button 
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(availableNumbers, parseInt(e.target.value) || 1)))}
                          min="1"
                          max={Math.min(availableNumbers, 10)}
                        />
                        <button 
                          type="button"
                          onClick={() => setQuantity(Math.min(Math.min(availableNumbers, 10), quantity + 1))}
                          disabled={quantity >= Math.min(availableNumbers, 10)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button 
                      className={styles.generateButton}
                      onClick={handleRandomSelection}
                    >
                      Generar números aleatorios
                    </button>
                  </div>
                ) : (
                  <>
                    {loadingSoldNumbers ? (
                      <div className={styles.loadingNumbers}>
                        <div className={styles.spinner}></div>
                        <span>Cargando números disponibles...</span>
                      </div>
                    ) : (
                      <NumberSelector 
                        maxNumbers={raffle.maxTickets}
                        selectedNumbers={selectedNumbers}
                        onSelectionChange={setSelectedNumbers}
                        soldNumbers={soldNumbers}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {selectedNumbers.length > 0 && (
              <div className={styles.selectedNumbers}>
                <h4>Números seleccionados ({selectedNumbers.length})</h4>
                <div className={styles.numbersList}>
                  {selectedNumbers.map(number => (
                    <span key={number} className={styles.selectedNumber}>
                      {number.toString().padStart(raffle.maxTickets.toString().length, '0')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.totalCost}>
            <span className={styles.label}>Total a pagar</span>
            <span className={styles.amount}>{formatPrice(totalCost)}</span>
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button 
              className={styles.purchaseButton}
              onClick={handlePurchase}
              disabled={selectedNumbers.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className={styles.spinner}></div>
                  Procesando...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M12 2a10 10 0 1 0 10 10"/>
                  </svg>
                  Comprar boletos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}