// users/[id]/_components/UserInfoTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminUser } from '@/lib/services/adminUsers';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  FileText,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Props {
  user: AdminUser;
  formatDate: (date: string) => string;
}

export default function UserInfoTab({ user, formatDate }: Props) {
  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  Nombre Completo
                </p>
                <p className="font-medium text-lg">{user.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </p>
                <p className="font-medium">{user.phone || 'No registrado'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </p>
                <p className="font-medium">{user.location || 'No especificada'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4" />
                  Fecha de Registro
                </p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4" />
                  ID de Usuario
                </p>
                <p className="font-mono font-medium">#{user.id}</p>
              </div>
            </div>
          </div>

          {user.bio && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-2">Biografía</p>
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas de Desempeño */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Estadísticas de Desempeño
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-2">Tareas Completadas</p>
              <p className="text-4xl font-bold text-purple-600">{user.totalTasks}</p>
            </div>

            <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600 mb-2">Calificación Promedio</p>
              <div className="flex items-center justify-center gap-2">
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                <p className="text-4xl font-bold text-yellow-600">
                  {user.averageRating.toFixed(1)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {user.totalRatings} {user.totalRatings === 1 ? 'calificación' : 'calificaciones'}
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Total Ganado</p>
              <p className="text-4xl font-bold text-green-600">
                {new Intl.NumberFormat('es-CL', {
                  style: 'currency',
                  currency: 'CLP',
                  minimumFractionDigits: 0
                }).format(user.earningsTotal)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Verificación Rápida */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Verificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${user.identityVerified ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex items-center gap-2 mb-2">
                {user.identityVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="font-medium">Identidad</span>
              </div>
              <p className="text-xs text-gray-600">
                {user.identityVerified ? 'Verificada' : 'No verificada'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${user.criminalRecordVerified ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex items-center gap-2 mb-2">
                {user.criminalRecordVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="font-medium">Antecedentes</span>
              </div>
              <p className="text-xs text-gray-600">
                {user.criminalRecordVerified ? 'Verificados' : 'No verificados'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-2 ${user.addressVerified ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex items-center gap-2 mb-2">
                {user.addressVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="font-medium">Dirección</span>
              </div>
              <p className="text-xs text-gray-600">
                {user.addressVerified ? 'Verificada' : 'No verificada'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}