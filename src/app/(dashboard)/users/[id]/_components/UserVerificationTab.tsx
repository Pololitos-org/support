// users/[id]/_components/UserVerificationTab.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminUser } from '@/lib/services/adminUsers';
import { adminVerificationService, AdminVerificationDocument } from '@/lib/services/adminVerification';
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
  const [documents, setDocuments] = useState<AdminVerificationDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [user.id]);

  const loadDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await adminVerificationService.getUserDocuments(user.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleToggleVisibility = async (docId: number, visible: boolean) => {
    try {
      await adminVerificationService.toggleDocumentVisibility(docId, visible);
      setDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, showOnProfile: visible } : doc));
    } catch (error) {
      console.error('Error toggling document visibility:', error);
      alert('Error al cambiar la visibilidad del documento');
    }
  };

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
      {/* Documentos del Usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Documentos y Certificados Subidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDocs ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : documents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Este usuario no ha subido ningún documento de verificación.</p>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {doc.documentType === 'IDENTITY' && 'Cédula de Identidad'}
                        {doc.documentType === 'CRIMINAL_RECORD' && 'Certificado de Antecedentes'}
                        {doc.documentType === 'ADDRESS' && 'Comprobante de Domicilio'}
                        {doc.documentType === 'OTHER' && 'Documento Adicional'}
                        {doc.documentType === 'CHILDCARE_INABILITY' && 'Certificado de Inhabilidad (Cuidado de Niños)'}
                      </span>
                      <Badge className={
                        doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }>
                        {doc.status === 'APPROVED' ? 'Aprobado' : doc.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Subido el: {new Date(doc.createdAt).toLocaleDateString('es-CL')}
                    </p>
                    {doc.rejectionReason && (
                      <p className="text-sm text-red-600 mt-1">Motivo de rechazo: {doc.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Ver Archivo
                    </a>
                    
                    {/* Switch/Toggle to show/hide on profile */}
                    {(doc.documentType === 'OTHER' || doc.documentType === 'CHILDCARE_INABILITY') && doc.status === 'APPROVED' && (
                      <div className="flex items-center gap-2 border-l pl-4">
                        <label className="text-xs text-gray-600 flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={!!doc.showOnProfile}
                            onChange={(e) => handleToggleVisibility(doc.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                          <span>Mostrar en perfil</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}