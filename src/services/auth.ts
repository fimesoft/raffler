import { fetchJSON, FetchOptions } from '@/lib/http-client'
import { API_CONFIG } from '@/config/api'

export interface RegisterRequest {
  name: string
  email: string
  password: string
  documentType?: string
  documentNumber?: string
  phone?: string
  dateOfBirth?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  user: {
    id: string
    email: string
    name: string
    createdAt: string
  }
  accessToken: string
  refreshToken: string
}

export interface ApiError {
  error: string
  errors?: Array<{
    msg: string
    param: string
    location: string
  }>
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: FetchOptions = {},
    skipAuthRedirect: boolean = false
  ): Promise<T> {
    const url = `${API_CONFIG.baseURL}/api${endpoint}`

    const config: FetchOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      skipAuthRedirect, // Don't redirect to login on auth endpoints
    }

    return fetchJSON<T>(url, config)
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      true // Skip auth redirect for register
    )
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      true // Skip auth redirect for login
    )
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    return this.makeRequest<{ accessToken: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
      true // Skip auth redirect for token refresh
    )
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      true // Skip auth redirect for password reset
    )
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(
      '/auth/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      },
      true // Skip auth redirect for password reset
    )
  }

  // Token management
  saveTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
    }
  }

  saveUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken')
    }
    return null
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken')
    }
    return null
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }
}

export const authService = new AuthService()
export default authService