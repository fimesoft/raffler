'use client'

import { useState, useEffect } from 'react'
import styles from './scss/NumberSelector.module.scss'

interface NumberSelectorProps {
  maxNumbers: number
  selectedNumbers: number[]
  onSelectionChange: (numbers: number[]) => void
  soldNumbers: number[]
}

export default function NumberSelector({ 
  maxNumbers, 
  selectedNumbers, 
  onSelectionChange,
  soldNumbers 
}: NumberSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const numbersPerPage = 100
  
  // Filtrar números según búsqueda
  const filteredNumbers = Array.from({ length: maxNumbers }, (_, i) => i + 1)
    .filter(number => {
      if (!searchTerm) return true
      return number.toString().includes(searchTerm)
    })

  // Paginación
  const totalPages = Math.ceil(filteredNumbers.length / numbersPerPage)
  const startIndex = (currentPage - 1) * numbersPerPage
  const endIndex = startIndex + numbersPerPage
  const currentNumbers = filteredNumbers.slice(startIndex, endIndex)

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const toggleNumber = (number: number) => {
    if (soldNumbers.includes(number)) return // No permitir seleccionar números vendidos
    
    if (selectedNumbers.includes(number)) {
      onSelectionChange(selectedNumbers.filter(n => n !== number))
    } else {
      if (selectedNumbers.length >= 10) {
        alert('Máximo 10 números por compra')
        return
      }
      onSelectionChange([...selectedNumbers, number].sort((a, b) => a - b))
    }
  }

  const clearSelection = () => {
    onSelectionChange([])
  }

  const getNumberClass = (number: number) => {
    if (soldNumbers.includes(number)) return `${styles.number} ${styles.sold}`
    if (selectedNumbers.includes(number)) return `${styles.number} ${styles.selected}`
    return styles.number
  }

  const formatNumber = (number: number) => {
    const totalDigits = maxNumbers.toString().length
    return number.toString().padStart(totalDigits, '0')
  }

  return (
    <div className={styles.numberSelector}>
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21L16.65 16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.controls}>
          {selectedNumbers.length > 0 && (
            <button className={styles.clearButton} onClick={clearSelection}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Limpiar ({selectedNumbers.length})
            </button>
          )}
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.available}`}></div>
          <span>Disponible</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.selectedColor}`}></div>
          <span>Seleccionado</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.soldColor}`}></div>
          <span>Vendido</span>
        </div>
      </div>

      <div className={styles.numbersGrid}>
        {currentNumbers.map(number => (
          <button
            key={number}
            className={getNumberClass(number)}
            onClick={() => toggleNumber(number)}
            disabled={soldNumbers.includes(number)}
            title={soldNumbers.includes(number) ? 'Número ya vendido' : `Seleccionar número ${formatNumber(number)}`}
          >
            {formatNumber(number)}
          </button>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={styles.pageButton}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>

          <div className={styles.pageInfo}>
            <span>
              Página {currentPage} de {totalPages} 
              ({filteredNumbers.length} números)
            </span>
          </div>

          <button 
            className={styles.pageButton}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>
      )}

      {maxNumbers <= 50 && (
        <div className={styles.quickSelect}>
          <span>Selección rápida:</span>
          <button 
            className={styles.quickButton}
            onClick={() => {
              const availableNumbers = Array.from({ length: maxNumbers }, (_, i) => i + 1)
                .filter(n => !soldNumbers.includes(n))
              const randomNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)]
              if (randomNumber) toggleNumber(randomNumber)
            }}
          >
            Número aleatorio
          </button>
        </div>
      )}
    </div>
  )
}