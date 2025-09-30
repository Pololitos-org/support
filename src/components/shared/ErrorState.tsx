// src/components/shared/ErrorState.tsx
'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorStateProps {
  /**
   * Título del error
   */
  title?: string;
  /**
   * Mensaje de error a mostrar
   */
  message?: string;
  /**
   * Función para reintentar
   */
  onRetry?: () => void;
  /**
   * Mostrar botón para ir al inicio
   */
  showHomeButton?: boolean;
  /**
   * Variante del error
   * - 'page': Ocupa toda la página
   * - 'card': Dentro de un card
   * - 'inline': Inline alert
   */
  variant?: 'page' | 'card' | 'inline';
  /**
   * Objeto de error (opcional, para logging)
   */
  error?: Error;
}

export function ErrorState({
  title = 'Algo salió mal',
  message = 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
  onRetry,
  showHomeButton = false,
  variant = 'card',
  error
}: ErrorStateProps) {
  // Log del error para debugging
  if (error) {
    console.error('ErrorState:', error);
  }

  // Variante inline (Alert simple)
  if (variant === 'inline') {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Variante card
  const content = (
    <>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          )}
          
          {showHomeButton && (
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
          )}
        </div>
      </div>
    </>
  );

  // Variante page (ocupa toda la pantalla)
  if (variant === 'page') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            {content}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Variante card (default)
  return (
    <Card>
      <CardContent className="pt-6">
        {content}
      </CardContent>
    </Card>
  );
}