// lib/services/api.ts - Adaptado de tu proyecto móvil
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.pololitos.cl';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// Clase para manejo de errores API
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Helper para obtener token de localStorage (solo cliente)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// Función principal API (adaptada de tu apiMiddleware)
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Headers por defecto
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Agregar auth token si existe
  const token = getAuthToken();
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Manejar respuestas no-JSON (como redirects)
    const contentType = response.headers.get('content-type');
    let data: T | undefined;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMessage = (data as any)?.error || `HTTP ${response.status}`;
      throw new ApiError(errorMessage, response.status);
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Error de red o parsing
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
};

// Shortcuts para métodos HTTP
export const api = {
  get: <T>(endpoint: string) => 
    apiRequest<T>(endpoint),
    
  post: <T>(endpoint: string, body?: any) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    
  put: <T>(endpoint: string, body?: any) => 
    apiRequest<T>(endpoint, {
      method: 'PUT', 
      body: JSON.stringify(body),
    }),
    
  patch: <T>(endpoint: string, body?: any) => 
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    
  delete: <T>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};