'use client'

import { useState, useEffect } from 'react'
import styles from './scss/HeroCarousel.module.scss'

const carouselImages = [
  {
    id: 1,
    url: '/images/carousel/lottery-1.jpg',
    title: 'Gana Increíbles Premios',
    subtitle: 'Participa en rifas y sorteos con solo un clic'
  },
  {
    id: 2,
    url: '/images/carousel/lottery-2.jpg',
    title: 'Crea tu Propia Rifa',
    subtitle: 'Organiza sorteos de forma fácil y segura'
  },
  {
    id: 3,
    url: '/images/carousel/lottery-3.jpg',
    title: 'Resultados Transparentes',
    subtitle: 'Sistema aleatorio verificable y justo'
  }
]

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <section className={styles.heroCarousel}>
      <div className={styles.carouselContainer}>
        {carouselImages.map((image, index) => (
          <div
            key={image.id}
            className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${image.url})`
            }}
          >
            <div className={styles.slideContent}>
              <h1>{image.title}</h1>
              <p>{image.subtitle}</p>
              <button className={styles.ctaButton}>Explorar Rifas</button>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button className={styles.prevButton} onClick={prevSlide} aria-label="Anterior">
          ‹
        </button>
        <button className={styles.nextButton} onClick={nextSlide} aria-label="Siguiente">
          ›
        </button>

        {/* Dots Indicators */}
        <div className={styles.dotsContainer}>
          {carouselImages.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
