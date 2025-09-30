// lib/types/errors.ts

/**
 * Clase base para todos los errores de la aplicación
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details
    };
  }
}

/**
 * Errores de API
 */
export class ApiError extends AppError {
  constructor(
    message: string,
    status: number = 500,
    code: string = 'API_ERROR',
    details?: Record<string, any>
  ) {
    super(message, code, status, details);
  }

  static fromResponse(response: Response, data?: any): ApiError {
    const message = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
    return new ApiError(message, response.status, data?.code, data);
  }
}

/**
 * Errores de autenticación
 */
export class AuthError extends AppError {
  constructor(
    message: string,
    code: AuthErrorCode,
    status?: number,
    details?: Record<string, any>
  ) {
    super(message, code, status, details);
  }
}

/**
 * Errores de red
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Error de conexión', details?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 0, details);
  }
}

/**
 * Errores de validación
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string[]>,
    details?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', 400, { ...details, fields });
  }
}

/**
 * Códigos de error de autenticación
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  NOT_STAFF = 'NOT_STAFF',
  NOT_ADMIN = 'NOT_ADMIN',
}

/**
 * Mensajes de error en español
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  [AuthErrorCode.INVALID_CREDENTIALS]: 'Email o contraseña incorrectos',
  [AuthErrorCode.UNAUTHORIZED]: 'No autorizado. Por favor, inicia sesión',
  [AuthErrorCode.FORBIDDEN]: 'No tienes permisos para realizar esta acción',
  [AuthErrorCode.TOKEN_EXPIRED]: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
  [AuthErrorCode.INVALID_TOKEN]: 'Token de sesión inválido',
  [AuthErrorCode.SESSION_EXPIRED]: 'Tu sesión ha expirado',
  [AuthErrorCode.NOT_STAFF]: 'No tienes permisos de administrador',
  [AuthErrorCode.NOT_ADMIN]: 'Solo los administradores pueden acceder',
  
  // Network errors
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet',
  TIMEOUT_ERROR: 'La solicitud ha tardado demasiado',
  
  // API errors
  API_ERROR: 'Error del servidor. Intenta nuevamente',
  SERVICE_UNAVAILABLE: 'Servicio no disponible. Verifica que el backend esté ejecutándose',
  
  // Validation errors
  VALIDATION_ERROR: 'Por favor, verifica los datos ingresados',
  INVALID_EMAIL: 'El formato del email no es válido',
  INVALID_PASSWORD: 'La contraseña debe tener al menos 6 caracteres',
  
  // Generic
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado',
};

/**
 * Helper para obtener mensaje de error legible
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return ERROR_MESSAGES[error.code] || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Helper para determinar si un error es recuperable
 */
export function isRecoverableError(error: unknown): boolean {
  if (!(error instanceof AppError)) return false;
  
  // Errores de red y timeouts son recuperables
  if (error instanceof NetworkError) return true;
  
  // 5xx errors del servidor son recuperables (se puede reintentar)
  if (error.status && error.status >= 500) return true;
  
  return false;
}

/**
 * Helper para logging de errores
 */
export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    context,
    timestamp: new Date().toISOString(),
    error: error instanceof AppError ? error.toJSON() : error,
  };
  
  console.error('❌ Error:', errorInfo);
  
  // Aquí podrías integrar un servicio de logging como Sentry
  // Sentry.captureException(error, { extra: errorInfo });
}