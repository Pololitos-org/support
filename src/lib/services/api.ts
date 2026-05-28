// lib/services/api.ts
import { 
  ApiError, 
  NetworkError, 
  AuthError,
  AuthErrorCode,
  logError 
} from '@/lib/types/errors';

// ✅ Configuración correcta
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000',
  isDevelopment: process.env.NEXT_PUBLIC_NODE_ENV === 'development',
  apiGatewayKey: process.env.NEXT_PUBLIC_API_GATEWAY_KEY || '',
};

/**
 * Helper para construir URL completa con prefijo correcto
 */
function buildApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;

  const fullPath = API_CONFIG.isDevelopment 
    ? `/dev${normalizedEndpoint}` 
    : normalizedEndpoint;

  const url = `${API_CONFIG.baseUrl}${fullPath}`;

  return url;
}

/**
 * Helper para obtener token de autenticación
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('accessToken');
  return token;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Request principal a la API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; status: number }> {
  const url = buildApiUrl(endpoint);

  // ✅ Headers con API Gateway Key (SIEMPRE se incluye)
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // ✅ SIEMPRE incluir API Gateway Key (en dev y prod)
  if (API_CONFIG.apiGatewayKey) {
    defaultHeaders['x-api-key'] = API_CONFIG.apiGatewayKey;
  } else {
    console.error('❌ API Gateway Key NOT configured!');
    console.warn('⚠️ Request will likely fail without API Gateway Key');
  }

  // ✅ Agregar JWT token si existe (para autenticación de usuario)
  const userToken = getAuthToken();
  if (userToken) {
    defaultHeaders['Authorization'] = `Bearer ${userToken}`;
  } else {}

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

    const contentType = response.headers.get('content-type');
    let data: T | undefined;

    if (contentType?.includes('application/json')) {
      const textData = await response.text();

      try {
        data = JSON.parse(textData);
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
      }
    } else {}

    if (!response.ok) {
      console.error('❌ Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      const apiError = ApiError.fromResponse(response, data);
      logError(apiError, `API Request to ${endpoint}`);

      // Manejar token expirado
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      }

      throw apiError;
    }

    return { data, status: response.status };
  } catch (error) {
    console.error('💥 API Request threw error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network/CORS error detected:', error.message);
    }

    const networkError = new NetworkError(
      error instanceof Error ? error.message : 'Unknown network error',
      { originalError: error }
    );
    logError(networkError, `Network error on ${endpoint}`);
    throw networkError;
  }
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  
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