// users/[id]/_components/UserVerificationTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminUser } from '@/lib/services/adminUsers';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileCheck,
  Home,
  UserCheck
} from 'lucide-react';

interface Props {
  user: AdminUser;
}

export default function UserVerificationTab({ user }: Props) {
  const getVerificationLevelColor = (level: string) => {
    switch (level) {
      case 'PREMIUM': return 'bg-purple-500 text-white';
      case 'VERIFIED': return 'bg-blue-500 text-white';
      case 'BASIC': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getVerificationLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      'PREMIUM': 'Premium',
      'VERIFIED': 'Verificado',
      'BASIC': 'Básico',
      'UNVERIFIED': 'Sin verificar'
    };
    return labels[level] || level;
  };

  const verificationProgress = [
    user.identityVerified,
    user.criminalRecordVerified,
    user.addressVerified
  ].filter(Boolean).length;

  const verificationPercentage = (verificationProgress / 3) * 100;

  return (
    <div className="space-y-6">
      {/* Nivel de verificación actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Nivel de Verificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Nivel actual</p>
              <Badge className={`${getVerificationLevelColor(user.verificationLevel)} text-2xl px-6 py-2`}>
                {getVerificationLevelLabel(user.verificationLevel)}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Progreso de verificación</p>
              <p className="text-4xl font-bold text-blue-600">
                {verificationPercentage.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {verificationProgress} de 3 verificaciones completadas
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${verificationPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detalles de cada verificación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verificación de Identidad */}
        <Card className={user.identityVerified ? 'border-2 border-green-300 bg-green-50' : 'border-2 border-gray-300'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className={`h-5 w-5 ${user.identityVerified ? 'text-green-600' : 'text-gray-400'}`} />
              Identidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-6">
                {user.identityVerified ? (
                  <CheckCircle className="h-16 w-16 text-green-600" />
                ) : (
                  <XCircle className="h-16 w-16 text-gray-400" />
                )}
              </div>
              
              <div className="text-center">
                <Badge className={user.identityVerified ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}>
                  {user.identityVerified ? 'Verificada' : 'No Verificada'}
                </Badge>
              </div>

              <div className="pt-4 border-t text-sm text-gray-600">
                <p className="font-medium mb-2">Requisitos:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Cédula de identidad válida</li>
                  <li>✓ Selfie con documento</li>
                  <li>✓ Validación biométrica</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verificación de Antecedentes */}
        <Card className={user.criminalRecordVerified ? 'border-2 border-green-300 bg-green-50' : 'border-2 border-gray-300'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck className={`h-5 w-5 ${user.criminalRecordVerified ? 'text-green-600' : 'text-gray-400'}`} />
              Antecedentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-6">
                {user.criminalRecordVerified ? (
                  <CheckCircle className="h-16 w-16 text-green-600" />
                ) : (
                  <XCircle className="h-16 w-16 text-gray-400" />
                )}
              </div>
              
              <div className="text-center">
                <Badge className={user.criminalRecordVerified ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}>
                  {user.criminalRecordVerified ? 'Verificados' : 'No Verificados'}
                </Badge>
              </div>

              <div className="pt-4 border-t text-sm text-gray-600">
                <p className="font-medium mb-2">Requisitos:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Certificado de antecedentes</li>
                  <li>✓ Registro civil actualizado</li>
                  <li>✓ Verificación judicial</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verificación de Dirección */}
        <Card className={user.addressVerified ? 'border-2 border-green-300 bg-green-50' : 'border-2 border-gray-300'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home className={`h-5 w-5 ${user.addressVerified ? 'text-green-600' : 'text-gray-400'}`} />
              Dirección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-6">
                {user.addressVerified ? (
                  <CheckCircle className="h-16 w-16 text-green-600" />
                ) : (
                  <XCircle className="h-16 w-16 text-gray-400" />
                )}
              </div>
              
              <div className="text-center">
                <Badge className={user.addressVerified ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}>
                  {user.addressVerified ? 'Verificada' : 'No Verificada'}
                </Badge>
              </div>

              <div className="pt-4 border-t text-sm text-gray-600">
                <p className="font-medium mb-2">Requisitos:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Comprobante de domicilio</li>
                  <li>✓ Cuenta de servicios reciente</li>
                  <li>✓ Validación de dirección</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Sobre el sistema de verificación
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <strong>Básico:</strong> Usuario registrado sin verificaciones adicionales.
                </p>
                <p>
                  <strong>Verificado:</strong> Usuario con al menos una verificación completada (identidad, antecedentes o dirección).
                </p>
                <p>
                  <strong>Premium:</strong> Usuario con todas las verificaciones completadas. Acceso a tareas premium y mayor confianza.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nota de seguridad */}
      {!user.identityVerified || !user.criminalRecordVerified || !user.addressVerified ? (
        <Card className="bg-yellow-50 border-yellow-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Verificaciones Pendientes
                </h3>
                <p className="text-sm text-yellow-800">
                  Este usuario tiene verificaciones pendientes. Se recomienda completar todas las verificaciones 
                  para acceder a todas las funcionalidades de la plataforma y aumentar la confianza con los clientes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50 border-green-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">
                  ✅ Usuario Completamente Verificado
                </h3>
                <p className="text-sm text-green-800">
                  Este usuario ha completado todas las verificaciones requeridas. 
                  Tiene acceso completo a la plataforma y genera mayor confianza con los clientes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}