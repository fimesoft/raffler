/**
 * API Configuration
 * Centraliza la configuración de la API del backend
 */

export const API_CONFIG = {
  // Base URL de la API del backend
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',

  // Timeout para las peticiones (en ms)
  timeout: 30000,

  // Headers por defecto
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * Helper para construir URLs completas
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseURL = API_CONFIG.baseURL.replace(/\/$/, ''); // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseURL}${path}`;
};

/**
 * Helper para obtener headers con autenticación
 */
export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    ...API_CONFIG.defaultHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};
