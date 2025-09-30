// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/lib/services/auth';
import Image from 'next/image';
import { 
  ApiError, 
  AuthError, 
  NetworkError,
  getErrorMessage,
  AuthErrorCode 
} from '@/lib/types/errors';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Starting admin login...');

      const { loginData, staffData } = await authService.loginAsAdmin({
        email,
        password,
      });

      console.log('✅ Admin login successful:', {
        user: loginData.user,
        role: staffData.role,
      });

      router.push('/dashboard');
    } catch (err) {
      console.error('❌ Login error:', err);

      // Manejar diferentes tipos de errores
      if (err instanceof NetworkError) {
        setError('Error de conexión. Verifica que el backend esté ejecutándose en http://127.0.0.1:3000');
      } else if (err instanceof AuthError) {
        // Usar el mensaje específico del error
        setError(getErrorMessage(err));
      } else if (err instanceof ApiError) {
        // Manejar errores de API por status
        switch (err.status) {
          case 404:
            setError('Servicio no disponible. Verifica que el backend esté ejecutándose');
            break;
          case 500:
          case 502:
          case 503:
            setError('Error del servidor. Intenta nuevamente en unos momentos');
            break;
          default:
            setError(getErrorMessage(err));
        }
      } else {
        // Error desconocido
        setError('Ha ocurrido un error inesperado. Intenta nuevamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logo con texto incluido */}
          <div className="mx-auto mb-6 flex justify-center">
            <Image
              src="/logotexto.svg"
              alt="Pololitos Logo"
              width={200}
              height={80}
              priority
              className="object-contain"
            />
          </div>
          <CardDescription>Ingresa con tu cuenta de administrador</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pololitos.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Solo para administradores autorizados</p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-orange-600 mt-2">
                Dev: Backend debe estar en http://127.0.0.1:3000
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}