/**
 * Global HTTP client with 401 error handling and API integration
 * Automatically redirects to login page when receiving 401 responses
 * Integrates with centralized API configuration
 */

import authService from '@/services/auth'
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '@/config/api'

export interface FetchOptions extends RequestInit {
  skipAuthRedirect?: boolean // Skip auto-redirect for specific calls (like login/register)
  useAuth?: boolean // Whether to include auth token (default: true)
}

/**
 * Enhanced fetch wrapper that handles 401 errors globally
 */
export async function fetchWithAuth(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuthRedirect = false, useAuth = true, ...fetchOptions } = options

  try {
    // Add auth headers if needed
    const headers = new Headers(fetchOptions.headers)

    if (useAuth) {
      const token = authService.getAccessToken()
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
    }

    // Ensure Content-Type is set
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

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

/**
 * HTTP Client for API requests
 * Automatically uses the centralized API configuration
 */
export const httpClient = {
  /**
   * GET request
   */
  async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = buildApiUrl(endpoint)
    return fetchJSON<T>(url, {
      ...options,
      method: 'GET',
    })
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
    const url = buildApiUrl(endpoint)
    return fetchJSON<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
    const url = buildApiUrl(endpoint)
    return fetchJSON<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
    const url = buildApiUrl(endpoint)
    return fetchJSON<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const url = buildApiUrl(endpoint)
    return fetchJSON<T>(url, {
      ...options,
      method: 'DELETE',
    })
  },
}

export default httpClient
