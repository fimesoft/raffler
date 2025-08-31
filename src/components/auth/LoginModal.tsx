'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import Modal from '../ui/Modal'
import styles from './LoginModal.module.scss'
import authService, { ApiError } from '@/services/auth'
import { useAuth } from '@/contexts/AuthContext'

type ModalStep = 'login' | 'register'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  documentType: string
  documentNumber: string
  phone: string
  dateOfBirth: string
}

interface LoginModalProps {
  onClose?: () => void
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('login')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    documentType: 'DNI',
    documentNumber: '',
    phone: '',
    dateOfBirth: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [serverError, setServerError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const { refreshAuth } = useAuth()

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor ingresa un email válido'
    }

    if (currentStep === 'login') {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida'
      }
    }

    if (currentStep === 'register') {
      if (!formData.name.trim()) {
        newErrors.name = 'El nombre es requerido'
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'El nombre debe tener al menos 2 caracteres'
      }

      if (!formData.documentNumber.trim()) {
        newErrors.documentNumber = 'El número de documento es requerido'
      } else if (formData.documentNumber.trim().length < 6) {
        newErrors.documentNumber = 'El número de documento debe tener al menos 6 caracteres'
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'El teléfono es requerido'
      } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Ingresa un número de teléfono válido'
      }

      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'La fecha de nacimiento es requerida'
      } else {
        const birthDate = new Date(formData.dateOfBirth)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        if (age < 18) {
          newErrors.dateOfBirth = 'Debes ser mayor de edad para participar'
        }
      }

      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida'
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSelectChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user changes selection
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    setServerError('')
    setIsLoading(true)
    
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      })

      // Save tokens and user data
      authService.saveTokens(response.accessToken, response.refreshToken)
      authService.saveUser(response.user)
      
      // Refresh auth context
      await refreshAuth()
      
      // Close modal and redirect to dashboard
      if (onClose) onClose()
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      
      const apiError = error as ApiError
      if (apiError.errors && apiError.errors.length > 0) {
        // Handle validation errors
        const newErrors: Partial<FormData> = {}
        apiError.errors.forEach(err => {
          if (err.param in formData) {
            newErrors[err.param as keyof FormData] = err.msg
          }
        })
        setErrors(newErrors)
      } else {
        setServerError(apiError.error || 'Error al iniciar sesión. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    setServerError('')
    setIsLoading(true)
    
    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth
      })

      // Save tokens and user data
      authService.saveTokens(response.accessToken, response.refreshToken)
      authService.saveUser(response.user)
      
      // Refresh auth context
      await refreshAuth()
      
      // Show success message
      setServerError('')
      
      // Close modal and redirect to dashboard after short delay
      setTimeout(() => {
        if (onClose) onClose()
        router.push('/dashboard')
      }, 1000)
      
    } catch (error: any) {
      console.error('Register error:', error)
      
      const apiError = error as ApiError
      if (apiError.errors && apiError.errors.length > 0) {
        // Handle validation errors
        const newErrors: Partial<FormData> = {}
        apiError.errors.forEach(err => {
          if (err.param in formData) {
            newErrors[err.param as keyof FormData] = err.msg
          }
        })
        setErrors(newErrors)
      } else {
        setServerError(apiError.error || 'Error al crear la cuenta. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const switchToRegister = () => {
    setCurrentStep('register')
    setErrors({})
    setServerError('')
  }

  const switchToLogin = () => {
    setCurrentStep('login')
    setErrors({})
    setServerError('')
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: '/',
        redirect: false 
      })
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      router.push('/')
    }
  }

  if (status === 'loading') {
    return (
      <Modal isOpen={true} onClose={handleClose}>
        <div className={styles.loginContainer}>
          <div className={styles.loading}>
            <svg className={styles.spinner} viewBox="0 0 24 24">
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              />
            </svg>
            Cargando...
          </div>
        </div>
      </Modal>
    )
  }

  const renderLoginStep = () => (
    <div className={styles.stepContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        <p className={styles.subtitle}>
          Ingresa tus credenciales para continuar
        </p>
      </div>

      {serverError && (
        <div className={styles.serverError}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          {serverError}
        </div>
      )}

      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="tu@email.com"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.email && (
            <span className={styles.errorMessage}>{errors.email}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            Contraseña *
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Tu contraseña"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.password && (
            <span className={styles.errorMessage}>{errors.password}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.email.trim() || !formData.password}
          className={styles.primaryButton}
        >
          {isLoading ? (
            <span className={styles.loading}>
              <svg className={styles.spinner} viewBox="0 0 24 24">
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none"
                  strokeDasharray="31.416"
                  strokeDashoffset="31.416"
                />
              </svg>
              Iniciando sesión...
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      <div className={styles.switchOption}>
        <p>¿No tienes cuenta?</p>
        <button
          type="button"
          onClick={switchToRegister}
          className={styles.linkButton}
          disabled={isLoading}
        >
          Registrarme ahora
        </button>
      </div>

      <div className={styles.divider}>
        <span>o continúa con</span>
      </div>

      <button 
        className={styles.googleButton}
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
      >
        {isGoogleLoading ? (
          <span className={styles.loading}>
            <svg className={styles.spinner} viewBox="0 0 24 24">
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              />
            </svg>
            Conectando...
          </span>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </>
        )}
      </button>
    </div>
  )

  const renderRegisterStep = () => (
    <div className={styles.stepContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Crear Cuenta</h2>
        <p className={styles.subtitle}>
          Completa la información para registrarte
        </p>
      </div>

      {serverError && (
        <div className={styles.serverError}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          {serverError}
        </div>
      )}

      <form onSubmit={handleRegister} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>
            Nombre completo *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="Tu nombre completo"
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.name && (
            <span className={styles.errorMessage}>{errors.name}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="register-email" className={styles.label}>
            Email *
          </label>
          <input
            id="register-email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="tu@email.com"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.email && (
            <span className={styles.errorMessage}>{errors.email}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="register-password" className={styles.label}>
            Contraseña *
          </label>
          <input
            id="register-password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Mínimo 6 caracteres"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.password && (
            <span className={styles.errorMessage}>{errors.password}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirm-password" className={styles.label}>
            Confirmar contraseña *
          </label>
          <input
            id="confirm-password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Confirma tu contraseña"
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <span className={styles.errorMessage}>{errors.confirmPassword}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="document-type" className={styles.label}>
            Tipo de documento *
          </label>
          <select
            id="document-type"
            value={formData.documentType}
            onChange={handleSelectChange('documentType')}
            className={`${styles.input} ${errors.documentType ? styles.inputError : ''}`}
            disabled={isLoading}
          >
            <option value="DNI">DNI - Documento Nacional de Identidad</option>
            <option value="CC">CC - Cédula de Ciudadanía</option>
            <option value="CE">CE - Cédula de Extranjería</option>
            <option value="PASSPORT">Pasaporte</option>
          </select>
          {errors.documentType && (
            <span className={styles.errorMessage}>{errors.documentType}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="document-number" className={styles.label}>
            Número de documento *
          </label>
          <input
            id="document-number"
            type="text"
            value={formData.documentNumber}
            onChange={handleInputChange('documentNumber')}
            placeholder="Número de tu documento"
            className={`${styles.input} ${errors.documentNumber ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.documentNumber && (
            <span className={styles.errorMessage}>{errors.documentNumber}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="phone" className={styles.label}>
            Teléfono *
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange('phone')}
            placeholder="+57 300 123 4567"
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.phone && (
            <span className={styles.errorMessage}>{errors.phone}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="date-of-birth" className={styles.label}>
            Fecha de nacimiento *
          </label>
          <input
            id="date-of-birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange('dateOfBirth')}
            className={`${styles.input} ${errors.dateOfBirth ? styles.inputError : ''}`}
            disabled={isLoading}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
          />
          {errors.dateOfBirth && (
            <span className={styles.errorMessage}>{errors.dateOfBirth}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.documentNumber || !formData.phone || !formData.dateOfBirth}
          className={styles.primaryButton}
        >
          {isLoading ? (
            <span className={styles.loading}>
              <svg className={styles.spinner} viewBox="0 0 24 24">
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none"
                  strokeDasharray="31.416"
                  strokeDashoffset="31.416"
                />
              </svg>
              Creando cuenta...
            </span>
          ) : (
            'Crear Cuenta'
          )}
        </button>
      </form>

      <div className={styles.switchOption}>
        <p>¿Ya tienes cuenta?</p>
        <button
          type="button"
          onClick={switchToLogin}
          className={styles.linkButton}
          disabled={isLoading}
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  )

  return (
    <Modal isOpen={true} onClose={handleClose}>
      <div className={styles.loginContainer}>
        {/* Step indicator */}
        <div className={styles.stepIndicator}>
          <div className={`${styles.step} ${currentStep === 'login' ? styles.active : ''}`}>
            1
          </div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.step} ${currentStep === 'register' ? styles.active : ''}`}>
            2
          </div>
        </div>

        {currentStep === 'login' ? renderLoginStep() : renderRegisterStep()}
      </div>
    </Modal>
  )
}