'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X,
  FileText,
  Shield,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface VerificationDocument {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  documentType: 'IDENTITY_CARD_FRONT' | 'IDENTITY_CARD_BACK' | 'CRIMINAL_RECORD' | 'ADDRESS_PROOF';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  profilePictureUrl?: string;
}

const DocumentTypeDisplay = {
  'IDENTITY_CARD_FRONT': 'Cédula (Frente)',
  'IDENTITY_CARD_BACK': 'Cédula (Reverso)',
  'CRIMINAL_RECORD': 'Antecedentes',
  'ADDRESS_PROOF': 'Comp. Domicilio'
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'PENDING': { variant: 'default' as const, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    'APPROVED': { variant: 'default' as const, color: 'bg-green-100 text-green-800 hover:bg-green-100' },
    'REJECTED': { variant: 'destructive' as const, color: '' }
  };

  const config = variants[status as keyof typeof variants] || variants.PENDING;

  return (
    <Badge variant={config.variant} className={config.color}>
      {status === 'PENDING' ? 'Pendiente' : status === 'APPROVED' ? 'Aprobado' : 'Rechazado'}
    </Badge>
  );
};

const DocumentCard = ({ 
  document, 
  onView, 
  onApprove, 
  onReject 
}: { 
  document: VerificationDocument;
  onView: (doc: VerificationDocument) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={document.profilePictureUrl} />
            <AvatarFallback className="bg-pololitos-purple text-white">
              {document.userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{document.userName}</h3>
            <p className="text-xs text-muted-foreground">{document.userEmail}</p>
          </div>
        </div>
        <StatusBadge status={document.status} />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {DocumentTypeDisplay[document.documentType]}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>Subido: {new Date(document.createdAt).toLocaleDateString('es-CL')}</span>
        <span>ID: {document.id}</span>
      </div>

      {document.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">Motivo de rechazo:</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{document.rejectionReason}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onView(document)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
        
        {document.status === 'PENDING' && (
          <>
            <Button 
              variant="default" 
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onApprove(document.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onReject(document.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function VerificationPage() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<VerificationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Mock data - después conectas con tu API real
  const mockDocuments: VerificationDocument[] = [
    {
      id: 1,
      userId: 123,
      userName: 'María González',
      userEmail: 'maria@email.com',
      documentType: 'IDENTITY_CARD_FRONT',
      status: 'PENDING',
      fileUrl: '/placeholder-doc.jpg',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      profilePictureUrl: undefined
    },
    {
      id: 2,
      userId: 124,
      userName: 'Carlos Ruiz',
      userEmail: 'carlos@email.com',
      documentType: 'CRIMINAL_RECORD',
      status: 'PENDING',
      fileUrl: '/placeholder-doc.jpg',
      createdAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-14T15:45:00Z',
      profilePictureUrl: undefined
    },
    {
      id: 3,
      userId: 125,
      userName: 'Ana López',
      userEmail: 'ana@email.com',
      documentType: 'IDENTITY_CARD_BACK',
      status: 'APPROVED',
      fileUrl: '/placeholder-doc.jpg',
      createdAt: '2024-01-13T09:20:00Z',
      updatedAt: '2024-01-13T14:30:00Z',
      profilePictureUrl: undefined
    },
    {
      id: 4,
      userId: 126,
      userName: 'Diego Silva',
      userEmail: 'diego@email.com',
      documentType: 'ADDRESS_PROOF',
      status: 'REJECTED',
      fileUrl: '/placeholder-doc.jpg',
      createdAt: '2024-01-12T11:15:00Z',
      updatedAt: '2024-01-12T16:45:00Z',
      rejectionReason: 'Documento ilegible. Por favor, sube una imagen más clara.',
      profilePictureUrl: undefined
    }
  ];

  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDocuments(mockDocuments);
      setIsLoading(false);
    };

    loadDocuments();
  }, []);

  useEffect(() => {
    let filtered = documents;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // Filtrar por tipo
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(doc => doc.documentType === typeFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, statusFilter, typeFilter]);

  const handleView = (document: VerificationDocument) => {
    // Abrir modal o navegar a página de detalle
    window.open(document.fileUrl, '_blank');
  };

  const handleApprove = async (id: number) => {
    try {
      // Aquí conectarías con tu API
      // await adminVerificationService.approveDocument(id);
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === id 
            ? { ...doc, status: 'APPROVED' as const, updatedAt: new Date().toISOString() }
            : doc
        )
      );
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      // Aquí conectarías con tu API
      // await adminVerificationService.rejectDocument(id, reason);
      
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === id 
            ? { 
                ...doc, 
                status: 'REJECTED' as const, 
                rejectionReason: reason,
                updatedAt: new Date().toISOString() 
              }
            : doc
        )
      );
    } catch (error) {
      console.error('Error rejecting document:', error);
    }
  };

  const pendingCount = documents.filter(doc => doc.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Verificaciones</h2>
          <p className="text-muted-foreground">
            Gestiona las verificaciones de documentos de usuarios
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="destructive">
              {pendingCount} pendientes
            </Badge>
          )}
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aprobados</p>
                <p className="text-2xl font-bold text-green-600">
                  {documents.filter(doc => doc.status === 'APPROVED').length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rechazados</p>
                <p className="text-2xl font-bold text-red-600">
                  {documents.filter(doc => doc.status === 'REJECTED').length}
                </p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="APPROVED">Aprobados</SelectItem>
                <SelectItem value="REJECTED">Rechazados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                <SelectItem value="IDENTITY_CARD_FRONT">Cédula (Frente)</SelectItem>
                <SelectItem value="IDENTITY_CARD_BACK">Cédula (Reverso)</SelectItem>
                <SelectItem value="CRIMINAL_RECORD">Antecedentes</SelectItem>
                <SelectItem value="ADDRESS_PROOF">Comp. Domicilio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-3 w-[120px]" />
                  </div>
                </div>
                <Skeleton className="h-4 w-[80px] mb-2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onView={handleView}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'No se encontraron documentos que coincidan con los filtros'
                : 'No hay documentos de verificación pendientes'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}