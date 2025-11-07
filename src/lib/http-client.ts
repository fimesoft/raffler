/**
 * Global HTTP client with 401 error handling
 * Automatically redirects to login page when receiving 401 responses
 */

import authService from '@/services/auth'

export interface FetchOptions extends RequestInit {
  skipAuthRedirect?: boolean // Skip auto-redirect for specific calls (like login/register)
}

/**
 * Enhanced fetch wrapper that handles 401 errors globally
 */
export async function fetchWithAuth(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuthRedirect = false, ...fetchOptions } = options

  try {
    const response = await fetch(url, fetchOptions)

    // Handle 429 Too Many Requests
    if (response.status === 429) {
      throw new Error('Demasiadas solicitudes. Por favor espera unos minutos antes de intentar de nuevo.')
    }

    // Handle 401 Unauthorized
    if (response.status === 401 && !skipAuthRedirect) {
      console.warn('401 Unauthorized - Redirecting to login')

      // Clear tokens
      authService.clearTokens()

      // Redirect to root (login page)
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }

      throw new Error('Session expired. Please login again.')
    }

    return response
  } catch (error) {
    // Network errors or other exceptions
    if (error instanceof Error && error.name === 'TypeError') {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
    }
    throw error
  }
}

/**
 * JSON wrapper for fetch with automatic 401 handling
 */
export async function fetchJSON<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options)

  const data = await response.json()

  if (!response.ok) {
    throw {
      status: response.status,
      ...data,
    }
  }

  return data
}
