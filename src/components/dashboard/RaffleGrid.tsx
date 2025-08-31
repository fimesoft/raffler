'use client'

import { useState, useEffect } from 'react'
import { raffleService, type Raffle } from '../../services/raffleService'
import { useAuth } from '../../contexts/AuthContext'
import authService from '../../services/auth'
import RaffleCard from './RaffleCard'
import styles from './scss/RaffleGrid.module.scss'

interface RaffleGridProps {
  showUserRaffles?: boolean
}

export default function RaffleGrid({ showUserRaffles = false }: RaffleGridProps) {
  const { isAuthenticated } = useAuth()
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const loadRaffles = async (pageNumber = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      let response
      if (showUserRaffles) {
        if (!isAuthenticated) {
          setError('Debes iniciar sesión para ver tus rifas')
          setLoading(false)
          return
        }
        
        const token = authService.getAccessToken()
        if (!token) {
          setError('Error de autenticación. Intenta cerrar e iniciar sesión nuevamente.')
          setLoading(false)
          return
        }
        
        response = await raffleService.getUserRaffles(token, { page: pageNumber, limit: 12 })
      } else {
        response = await raffleService.getAllRaffles({ page: pageNumber, limit: 12 })
      }
      
      setRaffles(response.raffles)
      setPage(response.pagination.current)
      setTotalPages(response.pagination.pages)
      setTotal(response.pagination.total)
    } catch (err) {
      console.error('Error in loadRaffles:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar las rifas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRaffles()
  }, [showUserRaffles, isAuthenticated])

  const handleRefresh = () => {
    loadRaffles(page)
  }

  const handlePageChange = (newPage: number) => {
    loadRaffles(newPage)
  }

  const handleRaffleDeleted = (raffleId: string) => {
    setRaffles(prev => prev.filter(raffle => raffle.id !== raffleId))
    setTotal(prev => prev - 1)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando rifas...</p>
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
          <button onClick={handleRefresh} className={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (raffles.length === 0 && !loading) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          {showUserRaffles ? (
            <>
              <h3>No tienes rifas creadas</h3>
              <p>Crea tu primera rifa para comenzar a participar en el sistema de rifas.</p>
            </>
          ) : (
            <>
              <h3>No hay rifas disponibles</h3>
              <p>Vuelve más tarde para ver nuevas rifas</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.info}>
          <span className={styles.count}>
            {total} {total === 1 ? 'rifa' : 'rifas'} 
            {showUserRaffles ? ' tuya' + (total === 1 ? '' : 's') : ' disponible' + (total === 1 ? '' : 's')}
          </span>
        </div>
        <button onClick={handleRefresh} className={styles.refreshButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Actualizar
        </button>
      </div>

      <div className={styles.grid}>
        {raffles.map((raffle) => (
          <RaffleCard 
            key={raffle.id} 
            raffle={raffle} 
            showActions={showUserRaffles}
            onDeleted={handleRaffleDeleted}
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
    </div>
  )
}