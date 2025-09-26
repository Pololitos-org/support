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
import { ApiError } from '@/lib/services/api';

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
      console.log('🚀 Starting admin login process...');
      
      // Usar el servicio de auth que maneja todo el flujo
      const { loginData, staffData } = await authService.loginAsAdmin({
        email,
        password
      });

      console.log('✅ Admin login successful:', {
        user: loginData.user,
        role: staffData.role,
        isStaff: staffData.isStaff
      });
      
      // Redirigir al dashboard
      router.push('/dashboard');
      
    } catch (err) {
      console.error('❌ Login error:', err);
      
      if (err instanceof ApiError) {
        // Errores específicos de la API
        switch (err.status) {
          case 401:
            setError('Credenciales incorrectas');
            break;
          case 403:
            setError('No tienes permisos de administrador');
            break;
          case 404:
            setError('Servicio no disponible. Verifica que el backend esté ejecutándose.');
            break;
          case 0:
            setError('Error de conexión. Verifica que el backend esté ejecutándose en http://127.0.0.1:3000');
            break;
          default:
            setError(err.message || 'Error al iniciar sesión');
        }
      } else {
        setError('Error desconocido al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <CardTitle className="text-2xl font-bold">Administración Pololitos</CardTitle>
          <CardDescription>
            Ingresa con tu cuenta de administrador de Pololitos
          </CardDescription>
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