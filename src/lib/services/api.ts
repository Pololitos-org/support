// lib/services/api.ts
import { 
  ApiError, 
  NetworkError, 
  AuthError,
  AuthErrorCode,
  logError 
} from '@/lib/types/errors';

// ✅ Configuración correcta basada en tu proyecto móvil
const API_CONFIG = {
  // Base URL del API Gateway
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000',
  
  // Determinar si estamos en desarrollo
  isDevelopment: process.env.NEXT_PUBLIC_NODE_ENV === 'development',
  
  // API Gateway Key (se usa SIEMPRE, en dev y prod)
  apiGatewayKey: process.env.NEXT_PUBLIC_API_GATEWAY_KEY || '',
};

/**
 * Helper para construir URL completa con prefijo correcto
 */
function buildApiUrl(endpoint: string): string {
  // Normalizar endpoint (asegurar que empiece con /)
  const normalizedEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
  
  // En desarrollo: agregar prefijo /dev
  // En producción: sin prefijo
  const fullPath = API_CONFIG.isDevelopment 
    ? `/dev${normalizedEndpoint}` 
    : normalizedEndpoint;
  
  return `${API_CONFIG.baseUrl}${fullPath}`;
}

/**
 * Helper para obtener token de autenticación
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Request principal a la API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data?: T; status: number }> {
  
  const url = buildApiUrl(endpoint);

  console.log('🔍 API Request:', {
    method: options.method || 'GET',
    url,
    endpoint,
    environment: API_CONFIG.isDevelopment ? 'development' : 'production',
  });

  // ✅ Headers con API Gateway Key (SIEMPRE se incluye)
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // ✅ SIEMPRE incluir API Gateway Key (en dev y prod)
  if (API_CONFIG.apiGatewayKey) {
    defaultHeaders['x-api-key'] = API_CONFIG.apiGatewayKey;
  } else {
    console.warn('⚠️ API Gateway Key not configured');
  }

  // ✅ Agregar JWT token si existe (para autenticación de usuario)
  const userToken = getAuthToken();
  if (userToken) {
    defaultHeaders['Authorization'] = `Bearer ${userToken}`;
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
    });

    const contentType = response.headers.get('content-type');
    let data: T | undefined;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const apiError = ApiError.fromResponse(response, data);
      logError(apiError, `API Request to ${endpoint}`);

      // Manejar token expirado
      if (response.status === 401) {
        console.log('🔑 Token expired, redirecting to login...');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      }

      throw apiError;
    }

    console.log('✅ API Success');
    return { data, status: response.status };
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const networkError = new NetworkError(
      error instanceof Error ? error.message : 'Unknown network error'
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