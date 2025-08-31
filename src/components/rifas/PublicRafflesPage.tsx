'use client'

import { useState, useEffect } from 'react'
import { raffleService, type Raffle } from '@/services/raffleService'
import { useAuth } from '@/contexts/AuthContext'
import RafflePublicCard from './RafflePublicCard'
import RaffleDetailModal from './RaffleDetailModal'
import styles from './scss/PublicRafflesPage.module.scss'

export default function PublicRafflesPage() {
  const { isAuthenticated } = useAuth()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<'all' | 'ending-soon' | 'popular'>('all')

  const loadRaffles = async (pageNumber = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await raffleService.getAllRaffles({ 
        page: pageNumber, 
        limit: 12,
        isActive: true // Solo rifas activas
      })
      
      let filteredRaffles = response.raffles
      
      // Aplicar filtros
      if (filter === 'ending-soon') {
        const now = new Date()
        const dayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        filteredRaffles = filteredRaffles.filter(raffle => 
          new Date(raffle.endDate) <= dayFromNow && new Date(raffle.endDate) > now
        )
      } else if (filter === 'popular') {
        filteredRaffles = [...filteredRaffles].sort((a, b) => 
          (b.soldTickets / b.maxTickets) - (a.soldTickets / a.maxTickets)
        )
      }
      
      setRaffles(filteredRaffles)
      setPage(response.pagination.current)
      setTotalPages(response.pagination.pages)
    } catch (err) {
      console.error('Error loading raffles:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar las rifas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRaffles()
  }, [filter])

  const handleRaffleClick = (raffle: Raffle) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para participar en las rifas')
      return
    }
    setSelectedRaffle(raffle)
  }

  const handleCloseModal = () => {
    setSelectedRaffle(null)
  }

  const handleTicketPurchased = () => {
    // Actualizar la lista de rifas después de comprar
    loadRaffles(page)
    setSelectedRaffle(null)
  }

  const handlePageChange = (newPage: number) => {
    loadRaffles(newPage)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando rifas disponibles...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Error al cargar las rifas</h3>
          <p>{error}</p>
          <button onClick={() => loadRaffles()} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Rifas Disponibles</h1>
          <p className={styles.subtitle}>
            Participa en rifas emocionantes y gana increíbles premios
          </p>
        </div>
        
        <div className={styles.filters}>
          <button 
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'ending-soon' ? styles.active : ''}`}
            onClick={() => setFilter('ending-soon')}
          >
            Terminan Pronto
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'popular' ? styles.active : ''}`}
            onClick={() => setFilter('popular')}
          >
            Populares
          </button>
        </div>
      </header>

      {raffles.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
            </svg>
          </div>
          <h3>No hay rifas disponibles</h3>
          <p>Vuelve más tarde para ver nuevas rifas emocionantes</p>
        </div>
      ) : (
        <>
          <div className={styles.statsBar}>
            <span className={styles.count}>
              {raffles.length} rifa{raffles.length !== 1 ? 's' : ''} disponible{raffles.length !== 1 ? 's' : ''}
            </span>
            <button onClick={() => loadRaffles(page)} className={styles.refreshButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 4V10H7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 20V14H17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Actualizar
            </button>
          </div>

          <div className={styles.grid}>
            {raffles.map((raffle) => (
              <RafflePublicCard 
                key={raffle.id} 
                raffle={raffle} 
                onClick={() => handleRaffleClick(raffle)}
              />
            ))}
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

      {selectedRaffle && (
        <RaffleDetailModal 
          raffle={selectedRaffle}
          onClose={handleCloseModal}
          onTicketPurchased={handleTicketPurchased}
        />
      )}
    </div>
  )
}