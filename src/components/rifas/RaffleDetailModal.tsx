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

type PaymentMethod = 'mercadopago' | 'bank_transfer' | null

export default function RaffleDetailModal({ raffle, onClose, onTicketPurchased }: RaffleDetailModalProps) {
  const { isAuthenticated } = useAuth()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [soldNumbers, setSoldNumbers] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'manual' | 'random'>('manual')
  const [quantity, setQuantity] = useState(1)
  const [loadingSoldNumbers, setLoadingSoldNumbers] = useState(true)
  const [step, setStep] = useState<'selection' | 'payment'>('selection')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)

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

  const handleContinueToPayment = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para comprar boletos')
      return
    }

    if (selectedNumbers.length === 0) {
      alert('Debes seleccionar al menos un número')
      return
    }

    setStep('payment')
  }

  const handlePurchase = async () => {
    if (!paymentMethod) {
      alert('Debes seleccionar un método de pago')
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
        totalCost,
        paymentMethod
      })

      const response = await raffleService.purchaseTickets(
        raffle.id,
        selectedNumbers,
        token,
        paymentMethod
      )

      if (paymentMethod === 'bank_transfer') {
        alert(`¡Reserva exitosa! Has reservado los números: ${response.purchasedNumbers.join(', ')}\n\nTus boletos estarán reservados por 24 horas. Por favor realiza la transferencia y envía el comprobante.\n\nID de transacción: ${response.transactionId}`)
      } else {
        alert(`¡Compra exitosa! Has adquirido los números: ${response.purchasedNumbers.join(', ')}\nID de transacción: ${response.transactionId}`)
      }

      onTicketPurchased()

    } catch (error) {
      console.error('Error al comprar boletos:', error)
      alert('Error al procesar la compra. Intenta de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBackToSelection = () => {
    setStep('selection')
    setPaymentMethod(null)
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
          {step === 'selection' ? (
            <>
              <div className={styles.raffleInfo}>
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
                    <span className={styles.value}>{raffle.creator?.name}</span>
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
            </>
          ) : (
            <div className={styles.paymentSelection}>
              <h3>Método de pago</h3>
              <p className={styles.paymentInstructions}>
                Selecciona cómo deseas realizar el pago de tus boletos
              </p>

              <div className={styles.paymentMethods}>
                <button
                  className={`${styles.paymentMethod} ${paymentMethod === 'mercadopago' ? styles.selected : ''}`}
                  onClick={() => setPaymentMethod('mercadopago')}
                >
                  <div className={styles.paymentMethodIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  </div>
                  <div className={styles.paymentMethodInfo}>
                    <h4>MercadoPago</h4>
                    <p>Pago inmediato con tarjeta o PSE</p>
                  </div>
                  {paymentMethod === 'mercadopago' && (
                    <div className={styles.checkmark}>✓</div>
                  )}
                </button>

                <button
                  className={`${styles.paymentMethod} ${paymentMethod === 'bank_transfer' ? styles.selected : ''}`}
                  onClick={() => setPaymentMethod('bank_transfer')}
                >
                  <div className={styles.paymentMethodIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <div className={styles.paymentMethodInfo}>
                    <h4>Transferencia Bancaria</h4>
                    <p>Tus boletos se reservan por 24 horas</p>
                  </div>
                  {paymentMethod === 'bank_transfer' && (
                    <div className={styles.checkmark}>✓</div>
                  )}
                </button>
              </div>

              {paymentMethod === 'bank_transfer' && (
                <div className={styles.bankDetails}>
                  <h4>Datos bancarios</h4>
                  <div className={styles.bankInfo}>
                    <div className={styles.bankInfoRow}>
                      <span className={styles.bankLabel}>Banco:</span>
                      <span className={styles.bankValue}>Bancolombia</span>
                    </div>
                    <div className={styles.bankInfoRow}>
                      <span className={styles.bankLabel}>Tipo de cuenta:</span>
                      <span className={styles.bankValue}>Ahorros</span>
                    </div>
                    <div className={styles.bankInfoRow}>
                      <span className={styles.bankLabel}>Número de cuenta:</span>
                      <span className={styles.bankValue}>1234-5678-9012</span>
                    </div>
                    <div className={styles.bankInfoRow}>
                      <span className={styles.bankLabel}>Titular:</span>
                      <span className={styles.bankValue}>Raffler SAS</span>
                    </div>
                    <div className={styles.bankInfoRow}>
                      <span className={styles.bankLabel}>NIT:</span>
                      <span className={styles.bankValue}>900.123.456-7</span>
                    </div>
                  </div>
                  <div className={styles.bankNote}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <p>
                      Por favor realiza la transferencia por <strong>{formatPrice(totalCost)}</strong> y
                      envía el comprobante a nuestro WhatsApp o correo electrónico.
                      Tus números quedarán reservados por 24 horas.
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.orderSummary}>
                <h4>Resumen de compra</h4>
                <div className={styles.summaryRow}>
                  <span>Números seleccionados:</span>
                  <span>{selectedNumbers.length}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Precio por boleto:</span>
                  <span>{formatPrice(raffle.ticketPrice)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total a pagar:</span>
                  <span>{formatPrice(totalCost)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          {step === 'selection' ? (
            <>
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
                  onClick={handleContinueToPayment}
                  disabled={selectedNumbers.length === 0}
                >
                  Continuar al pago
                </button>
              </div>
            </>
          ) : (
            <div className={styles.actions}>
              <button className={styles.cancelButton} onClick={handleBackToSelection}>
                ← Volver
              </button>
              <button
                className={styles.purchaseButton}
                onClick={handlePurchase}
                disabled={!paymentMethod || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className={styles.spinner}></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'bank_transfer' ? 'Reservar boletos' : 'Comprar boletos'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}