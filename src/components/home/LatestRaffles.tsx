'use client'

import { useEffect, useState } from 'react'
import { raffleService, Raffle } from '@/services/raffleService'
import styles from './scss/LatestRaffles.module.scss'

export default function LatestRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLatestRaffles()
  }, [])

  const fetchLatestRaffles = async () => {
    try {
      setLoading(true)
      const response = await raffleService.getAllRaffles({
        page: 1,
        limit: 5,
        isActive: true,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      setRaffles(response.raffles)
    } catch (err) {
      console.error('Error al cargar rifas:', err)
      setError('No se pudieron cargar las rifas')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const calculateProgress = (sold: number, max: number) => {
    return Math.round((sold / max) * 100)
  }

  if (loading) {
    return (
      <section className={styles.latestRaffles}>
        <div className={styles.container}>
          <h2>Cargando rifas...</h2>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.latestRaffles}>
        <div className={styles.container}>
          <h2>{error}</h2>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.latestRaffles}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Rifas Más Recientes</h2>
          <p>Descubre las últimas oportunidades para ganar increíbles premios</p>
        </div>

        <div className={styles.rafflesGrid}>
          {raffles.map((raffle) => (
            <div key={raffle.id} className={styles.raffleCard}>
              <div className={styles.imageContainer}>
                {raffle.image ? (
                  <img src={raffle.image} alt={raffle.title} />
                ) : (
                  <div className={styles.placeholderImage}>
                    <span>🎁</span>
                  </div>
                )}
                <div className={styles.badge}>Activa</div>
              </div>

              <div className={styles.cardContent}>
                <h3>{raffle.title}</h3>
                <p className={styles.description}>{raffle.description}</p>

                <div className={styles.prize}>
                  <span className={styles.label}>Premio:</span>
                  <span className={styles.value}>{raffle.prize}</span>
                </div>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.label}>Precio</span>
                    <span className={styles.value}>{formatPrice(raffle.ticketPrice)}</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.label}>Boletos</span>
                    <span className={styles.value}>{raffle.soldTickets}/{raffle.maxTickets}</span>
                  </div>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{ width: `${calculateProgress(raffle.soldTickets, raffle.maxTickets)}%` }}
                  />
                </div>
                <div className={styles.progressText}>
                  {calculateProgress(raffle.soldTickets, raffle.maxTickets)}% vendido
                </div>

                <button className={styles.participateButton}>
                  Participar Ahora
                </button>
              </div>
            </div>
          ))}
        </div>

        {raffles.length === 0 && (
          <div className={styles.emptyState}>
            <p>No hay rifas disponibles en este momento</p>
          </div>
        )}

        <div className={styles.viewAll}>
          <button className={styles.viewAllButton}>Ver Todas las Rifas</button>
        </div>
      </div>
    </section>
  )
}
