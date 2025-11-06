'use client'

import { useState, useEffect } from 'react'
import { raffleService } from '@/services/raffleService'
import { useAuth } from '@/contexts/AuthContext'
import authService from '@/services/auth'
import styles from './scss/SalesManagement.module.scss'

interface SalesData {
  id: string
  buyerId: string
  raffleId: string
  buyer: {
    id: string
    name: string
    email: string
    documentNumber: string | null
    phone: string | null
  }
  raffle: {
    id: string
    title: string
    ticketPrice: number
    maxTickets: number
  }
  numbers: number[]
  ticketCount: number
  totalAmount: number
  purchaseDate: string
  status: string
}

interface Raffle {
  id: string
  title: string
}

export default function SalesManagement() {
  const { isAuthenticated } = useAuth()
  const [sales, setSales] = useState<SalesData[]>([])
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSales, setTotalSales] = useState(0)
  
  // Filtros
  const [selectedRaffle, setSelectedRaffle] = useState<string>('')
  const [buyerEmailFilter, setBuyerEmailFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const loadSales = async (pageNumber = 1, raffleId = selectedRaffle, buyerEmail = buyerEmailFilter) => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      setError(null)
      
      const token = authService.getAccessToken()
      if (!token) {
        setError('Error de autenticación')
        return
      }

      const params: any = { 
        page: pageNumber, 
        limit: 20 
      }
      
      if (raffleId) params.raffleId = raffleId
      if (buyerEmail.trim()) params.buyerEmail = buyerEmail.trim()
      
      const response = await raffleService.getRaffleSales(token, params)
      
      setSales(response.sales)
      setPage(response.pagination.current)
      setTotalPages(response.pagination.pages)
      setTotalSales(response.pagination.total)
      
    } catch (err) {
      console.error('Error loading sales:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar las ventas')
    } finally {
      setLoading(false)
    }
  }

  const loadUserRaffles = async () => {
    if (!isAuthenticated) return
    
    try {
      const token = authService.getAccessToken()
      if (!token) return

      const response = await raffleService.getUserRaffles(token, { page: 1, limit: 100 })
      setRaffles(response.raffles)
    } catch (err) {
      console.error('Error loading user raffles:', err)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadUserRaffles()
      loadSales()
    }
  }, [isAuthenticated])

  const handleSearch = () => {
    setBuyerEmailFilter(searchInput)
    setPage(1)
    loadSales(1, selectedRaffle, searchInput)
  }

  const handleRaffleFilter = (raffleId: string) => {
    setSelectedRaffle(raffleId)
    setPage(1)
    loadSales(1, raffleId, buyerEmailFilter)
  }

  const handleClearFilters = () => {
    setSelectedRaffle('')
    setBuyerEmailFilter('')
    setSearchInput('')
    setPage(1)
    loadSales(1, '', '')
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    loadSales(newPage, selectedRaffle, buyerEmailFilter)
  }

  const getTotalRevenue = () => {
    return sales.reduce((total, sale) => total + sale.totalAmount, 0)
  }

  const handleConfirmPayment = async (raffleId: string, buyerId: string) => {
    if (!confirm('¿Confirmar que el pago ha sido recibido? Esto cambiará el estado de RESERVADO a VENDIDO.')) {
      return
    }

    try {
      const token = authService.getAccessToken()
      if (!token) {
        alert('Error de autenticación')
        return
      }

      await raffleService.confirmTicketPayment(raffleId, buyerId, token)
      alert('Pago confirmado exitosamente')

      // Recargar las ventas
      loadSales(page, selectedRaffle, buyerEmailFilter)
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert(error instanceof Error ? error.message : 'Error al confirmar el pago')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Acceso denegado</h3>
          <p>Debes iniciar sesión para ver las ventas</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando ventas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Error al cargar las ventas</h3>
          <p>{error}</p>
          <button onClick={() => loadSales()} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Gestión de Ventas</h1>
          <p className={styles.subtitle}>
            Administra las compras realizadas en tus rifas
          </p>
        </div>

        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.label}>Total Ventas</span>
            <span className={styles.value}>{totalSales}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>Ventas Actuales</span>
            <span className={styles.value}>{sales.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>Ingresos Página</span>
            <span className={styles.value}>{formatPrice(getTotalRevenue())}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.label}>Página Actual</span>
            <span className={styles.value}>{page} de {totalPages}</span>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Filtrar por rifa:</label>
          <select 
            value={selectedRaffle} 
            onChange={(e) => handleRaffleFilter(e.target.value)}
            className={styles.select}
          >
            <option value="">Todas las rifas ({raffles.length})</option>
            {raffles.map((raffle) => (
              <option key={raffle.id} value={raffle.id}>
                {raffle.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Buscar por email del comprador:</label>
          <div className={styles.searchGroup}>
            <input
              type="email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="email@ejemplo.com"
              className={styles.input}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Buscar
            </button>
          </div>
        </div>

        {(selectedRaffle || buyerEmailFilter) && (
          <button onClick={handleClearFilters} className={styles.clearButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Limpiar Filtros
          </button>
        )}
      </div>

      {sales.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h3>No hay ventas registradas</h3>
          <p>
            {selectedRaffle || buyerEmailFilter 
              ? 'No se encontraron ventas con los filtros aplicados'
              : 'Aún no tienes ventas en tus rifas'}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            {loading && (
              <div className={styles.loadingOverlay}>
                <div className={styles.miniSpinner}></div>
                <span>Actualizando...</span>
              </div>
            )}
            <table className={styles.salesTable}>
              <thead>
                <tr>
                  <th>Comprador</th>
                  <th>Rifa</th>
                  <th>Números</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={`${sale.buyerId}-${sale.raffleId}`}>
                    <td>
                      <div className={styles.buyerInfo}>
                        <div className={styles.buyerName}>{sale.buyer.name}</div>
                        <div className={styles.buyerEmail}>{sale.buyer.email}</div>
                        {sale.buyer.documentNumber && (
                          <div className={styles.buyerDoc}>Doc: {sale.buyer.documentNumber}</div>
                        )}
                        {sale.buyer.phone && (
                          <div className={styles.buyerPhone}>Tel: {sale.buyer.phone}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.raffleInfo}>
                        <div className={styles.raffleTitle}>{sale.raffle.title}</div>
                        <div className={styles.rafflePrice}>
                          {formatPrice(sale.raffle.ticketPrice)} / boleto
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.numbers}>
                        {sale.numbers.length <= 8 ? (
                          <div className={styles.numbersGrid}>
                            {sale.numbers.map(num => (
                              <span key={num} className={styles.number}>
                                {num.toString().padStart(sale.raffle.maxTickets.toString().length, '0')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className={styles.numbersCollapsed}>
                            <div className={styles.numbersPreview}>
                              {sale.numbers.slice(0, 4).map(num => (
                                <span key={num} className={styles.number}>
                                  {num.toString().padStart(sale.raffle.maxTickets.toString().length, '0')}
                                </span>
                              ))}
                            </div>
                            <span className={styles.moreNumbers}>+{sale.numbers.length - 4} más</span>
                            <div className={styles.numberRange}>
                              {Math.min(...sale.numbers)}-{Math.max(...sale.numbers)}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.ticketCount}>{sale.ticketCount}</td>
                    <td className={styles.totalAmount}>{formatPrice(sale.totalAmount)}</td>
                    <td className={styles.date}>{formatDate(sale.purchaseDate)}</td>
                    <td>
                      <span className={`${styles.status} ${styles[sale.status.toLowerCase()]}`}>
                        {sale.status === 'SOLD' ? 'Vendido' :
                         sale.status === 'RESERVED' ? 'Reservado' :
                         sale.status}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      {sale.status === 'RESERVED' && (
                        <button
                          onClick={() => handleConfirmPayment(sale.raffleId, sale.buyerId)}
                          className={styles.confirmButton}
                          title="Confirmar pago"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className={styles.paginationButton}
              >
                Anterior
              </button>
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5 && page > 3) {
                    pageNum = page - 2 + i
                    if (pageNum > totalPages) pageNum = totalPages - 4 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`${styles.pageButton} ${page === pageNum ? styles.active : ''}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className={styles.paginationButton}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}