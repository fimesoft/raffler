'use client'

import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { raffleService } from '../../services/raffleService'
import { useAuth } from '../../contexts/AuthContext'
import authService from '../../services/auth'
import styles from './scss/CreateRaffleForm.module.scss'

const raffleSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  prize: z.string().min(3, 'Describe el premio'),
  ticketPrice: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  maxTickets: z.number().min(1, 'Debe haber al menos 1 boleto'),
  endDate: z.string().min(1, 'Selecciona una fecha de finalización'),
  image: z.any().optional()
})

type RaffleFormData = z.infer<typeof raffleSchema>

interface CreateRaffleFormProps {
  onRaffleCreated?: () => void
}

export default function CreateRaffleForm({ onRaffleCreated }: CreateRaffleFormProps) {
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RaffleFormData>({
    resolver: zodResolver(raffleSchema)
  })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Opciones de compresión
        const options = {
          maxSizeMB: 0.5,          // Máximo 1MB
          maxWidthOrHeight: 1280, // Máximo 1920px de ancho/alto
          useWebWorker: true,    // Usar Web Worker para no bloquear UI
          fileType: 'image/jpeg', // Convertir a JPEG para mejor compresión
          quality: 0.7          // 80% de calidad (buen balance calidad/tamaño)
        }

        const compressedFile = await imageCompression(file, options)
        
        // Crear preview de la imagen comprimida
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(compressedFile)
        
        console.log(`Imagen original: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
        console.log(`Imagen comprimida: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
        
      } catch (error) {
        console.error('Error al comprimir imagen:', error)
        alert('Error al procesar la imagen. Intenta con una imagen más pequeña.')
      }
    }
  }

  const onSubmit = async (data: RaffleFormData) => {
    if (!isAuthenticated) {
      console.log(isAuthenticated);
      alert('Debes iniciar sesión para crear una rifa ------- ^_^!')
      return
    }

    setIsSubmitting(true)
    setSuccess(null)
    
    try {
      console.log('Obteniendo token de autenticación...')
      const token = authService.getAccessToken()
      
      if (!token) {
        alert('Error de autenticación. Intenta cerrar e iniciar sesión nuevamente.')
        return
      }
      
      console.log('Token obtenido, creando rifa...')
      
      const raffleData = {
        title: data.title,
        description: data.description,
        prize: data.prize,
        ticketPrice: data.ticketPrice,
        maxTickets: data.maxTickets,
        endDate: data.endDate,
        image: imagePreview || undefined
      }
      
      const response = await raffleService.createRaffle(raffleData, token)
      
      setSuccess('¡Rifa creada exitosamente!')
      reset()
      setImagePreview(null)
      
      // Notify parent component if callback is provided
      if (onRaffleCreated) {
        onRaffleCreated()
      }
      
      console.log('Rifa creada:', response)
    } catch (error) {
      console.error('Error al crear la rifa:', error)
      alert(`Error al crear la rifa: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {success && (
        <div className={styles.successMessage}>
          {success}
        </div>
      )}
      
      isAuthenticated: {JSON.stringify(isAuthenticated)}
      <div className={styles.section}>
        <h3>Información Básica</h3>
        
        <div className={styles.inputGroup}>
          <label htmlFor="title">Título de la Rifa *</label>
          <input
            id="title"
            type="text"
            {...register('title')}
            placeholder="Ej: Rifa iPhone 15 Pro"
            className={errors.title ? styles.error : ''}
          />
          {errors.title && (
            <span className={styles.errorMessage}>{errors.title.message}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="description">Descripción *</label>
          <textarea
            id="description"
            {...register('description')}
            placeholder="Describe los detalles de tu rifa..."
            rows={4}
            className={errors.description ? styles.error : ''}
          />
          {errors.description && (
            <span className={styles.errorMessage}>{errors.description.message}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="prize">Premio *</label>
          <input
            id="prize"
            type="text"
            {...register('prize')}
            placeholder="Ej: iPhone 15 Pro 256GB Azul"
            className={errors.prize ? styles.error : ''}
          />
          {errors.prize && (
            <span className={styles.errorMessage}>{errors.prize.message}</span>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Configuración</h3>
        
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label htmlFor="ticketPrice">Precio por Boleto *</label>
            <input
              id="ticketPrice"
              type="number"
              step="0.01"
              {...register('ticketPrice', { valueAsNumber: true })}
              placeholder="10.00"
              className={errors.ticketPrice ? styles.error : ''}
            />
            {errors.ticketPrice && (
              <span className={styles.errorMessage}>{errors.ticketPrice.message}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="maxTickets">Número Total de Boletos *</label>
            <input
              id="maxTickets"
              type="number"
              {...register('maxTickets', { valueAsNumber: true })}
              placeholder="100"
              className={errors.maxTickets ? styles.error : ''}
            />
            {errors.maxTickets && (
              <span className={styles.errorMessage}>{errors.maxTickets.message}</span>
            )}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="endDate">Fecha de Finalización *</label>
          <input
            id="endDate"
            type="datetime-local"
            {...register('endDate')}
            className={errors.endDate ? styles.error : ''}
          />
          {errors.endDate && (
            <span className={styles.errorMessage}>{errors.endDate.message}</span>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3>Imagen del Premio</h3>
        
        <div className={styles.imageUpload}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
            id="imageUpload"
          />
          <label htmlFor="imageUpload" className={styles.fileLabel}>
            {imagePreview ? (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Preview" />
                <span>Cambiar imagen</span>
              </div>
            ) : (
              <div className={styles.uploadPlaceholder}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                <span>Subir imagen del premio</span>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => {
            reset()
            setImagePreview(null)
          }}
          className={styles.secondaryButton}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.primaryButton}
        >
          {isSubmitting ? 'Creando...' : 'Crear Rifa'}
        </button>
      </div>
    </form>
  )
}