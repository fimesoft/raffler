'use client'

import styles from './scss/HowItWorks.module.scss'

const steps = [
  {
    id: 1,
    icon: '🎯',
    title: 'Elige tu Rifa',
    description: 'Explora las rifas activas y selecciona la que más te guste. Cada rifa muestra el premio, precio y cantidad de boletos disponibles.'
  },
  {
    id: 2,
    icon: '🎫',
    title: 'Compra tus Boletos',
    description: 'Selecciona los números que prefieras o déjalos al azar. Completa tu compra de forma rápida y segura.'
  },
  {
    id: 3,
    icon: '🎲',
    title: 'Espera el Sorteo',
    description: 'Una vez que se completen todos los boletos o llegue la fecha límite, se realizará el sorteo de forma automática y transparente.'
  },
  {
    id: 4,
    icon: '🏆',
    title: '¡Gana Premios!',
    description: 'Si tu número es el ganador, serás notificado inmediatamente. Los resultados son públicos y verificables.'
  }
]

export default function HowItWorks() {
  return (
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>¿Cómo Funciona Rifala?</h2>
          <p>Participar en nuestras rifas es fácil, rápido y seguro</p>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((step, index) => (
            <div key={step.id} className={styles.stepCard}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.ctaSection}>
          <h3>¿Listo para participar?</h3>
          <button className={styles.primaryButton}>Ver Rifas Activas</button>
          <button className={styles.secondaryButton}>Crear mi Rifa</button>
        </div>
      </div>
    </section>
  )
}
