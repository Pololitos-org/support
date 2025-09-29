// lib/services/api.ts - Adaptado de tu proyecto móvil
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

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
  // 🔥 CAMBIO: Usar variable de entorno específica para API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const isDev = process.env.NEXT_PUBLIC_API_ENV === 'development';
  
  // Asegurar que el endpoint tenga el prefijo correcto para development
  const prefixedEndpoint = isDev && !endpoint.startsWith('/dev') ? `/dev${endpoint}` : endpoint;
  const url = `${API_BASE_URL}${prefixedEndpoint}`;
  
  console.log('🔍 API Request:', {
    method: options.method || 'GET',
    url,
    endpoint: prefixedEndpoint,
    isDev,
    apiEnv: process.env.NEXT_PUBLIC_API_ENV
  });
  
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

    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    // Manejar respuestas no-JSON (como redirects)
    const contentType = response.headers.get('content-type');
    let data: T | undefined;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMessage = (data as any)?.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ API Error:', errorMessage);
      throw new ApiError(errorMessage, response.status);
    }

    console.log('✅ API Success:', data);
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      // Manejar token expirado específicamente
      if (error.status === 401) {
        console.log('🔑 Token expired, redirecting to login...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      }
      throw error;
    }
    
    // Error de red o parsing
    const networkError = new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
    console.error('🌐 Network Error:', networkError);
    throw networkError;
  }
};

// Shortcuts para métodos HTTP
export const api = {
  get: <T>(endpoint: string) => 
    apiRequest<T>(endpoint),
    
  post: <T>(endpoint: string, body?: any) => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  put: <T>(endpoint: string, body?: any) => 
    apiRequest<T>(endpoint, {
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  patch: <T>(endpoint: string, body?: any) => 
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
    
  delete: <T>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};