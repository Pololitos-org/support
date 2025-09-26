'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  User, 
  FileText,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { adminVerificationService } from '@/lib/services/adminVerification';

// Interfaces adaptadas a tu backend
interface AdminVerificationDocument {
  id: number;
  userId: number;
  userName: string;
  userEmail?: string;
  documentType: 'IDENTITY' | 'ADDRESS' | 'CRIMINAL_RECORD' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  profilePictureUrl?: string;
}

interface VerificationFilters {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
  type?: 'IDENTITY' | 'ADDRESS' | 'CRIMINAL_RECORD' | 'OTHER' | 'ALL';
  search?: string;
}

export default function VerificationPage() {
  // Estados
  const [documents, setDocuments] = useState<AdminVerificationDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<AdminVerificationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<AdminVerificationDocument | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState<VerificationFilters>({
    status: 'ALL',
    type: 'ALL',
    search: ''
  });

  // Mapeo de tipos de documento para mostrar
  const DocumentTypeDisplay = {
    'IDENTITY': 'Cédula/Identidad',
    'ADDRESS': 'Comp. Domicilio', 
    'CRIMINAL_RECORD': 'Antecedentes',
    'OTHER': 'Otro'
  };

  // Mapeo de estados
  const StatusDisplay = {
    'PENDING': 'Pendiente',
    'APPROVED': 'Aprobado',
    'REJECTED': 'Rechazado'
  };

  // Colores para badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'IDENTITY': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ADDRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CRIMINAL_RECORD': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'OTHER': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Cargar documentos desde el backend
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await adminVerificationService.getAllDocuments();
      console.log('📄 Documentos cargados:', docs);
      setDocuments(docs);
      setFilteredDocuments(docs);
    } catch (error) {
      console.error('❌ Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar documentos
  const applyFilters = () => {
    let filtered = [...documents];

    // Filtro por estado
    if (filters.status && filters.status !== 'ALL') {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    // Filtro por tipo
    if (filters.type && filters.type !== 'ALL') {
      filtered = filtered.filter(doc => doc.documentType === filters.type);
    }

    // Filtro por búsqueda (nombre de usuario)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.userName.toLowerCase().includes(searchLower) ||
        doc.userId.toString().includes(searchLower)
      );
    }

    setFilteredDocuments(filtered);
  };

  // Aprobar documento
  const handleApprove = async (id: number) => {
    try {
      await adminVerificationService.approveDocument(id);
      console.log('✅ Documento aprobado:', id);
      await loadDocuments(); // Recargar lista
    } catch (error) {
      console.error('❌ Error approving document:', error);
      alert('Error al aprobar el documento');
    }
  };

  // Rechazar documento
  const handleReject = async (id: number) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason || reason.trim() === '') {
      return;
    }

    try {
      await adminVerificationService.rejectDocument(id, reason);
      console.log('❌ Documento rechazado:', id, 'Razón:', reason);
      await loadDocuments(); // Recargar lista
    } catch (error) {
      console.error('❌ Error rejecting document:', error);
      alert('Error al rechazar el documento');
    }
  };

  // Ver documento en modal
  const viewDocument = (doc: AdminVerificationDocument) => {
    setSelectedDocument(doc);
    setShowPreviewModal(true);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Effects
  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, documents]);

  // Estadísticas rápidas
  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'PENDING').length,
    approved: documents.filter(d => d.status === 'APPROVED').length,
    rejected: documents.filter(d => d.status === 'REJECTED').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verificaciones</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las verificaciones de documentos de usuarios
          </p>
        </div>
        <Button onClick={loadDocuments} disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprobados</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rechazados</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuario..."
                className="pl-10"
                value={filters.search || ''}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>

            {/* Filtro por estado */}
            <Select
              value={filters.status || 'ALL'}
              onValueChange={(value) => setFilters({...filters, status: value as any})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="APPROVED">Aprobados</SelectItem>
                <SelectItem value="REJECTED">Rechazados</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por tipo */}
            <Select
              value={filters.type || 'ALL'}
              onValueChange={(value) => setFilters({...filters, type: value as any})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los tipos</SelectItem>
                <SelectItem value="IDENTITY">Identidad</SelectItem>
                <SelectItem value="ADDRESS">Domicilio</SelectItem>
                <SelectItem value="CRIMINAL_RECORD">Antecedentes</SelectItem>
                <SelectItem value="OTHER">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documentos ({filteredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando documentos...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron documentos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Info del documento */}
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {doc.userName}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ID: {doc.userId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getTypeColor(doc.documentType)}>
                            {DocumentTypeDisplay[doc.documentType]}
                          </Badge>
                          <Badge className={getStatusColor(doc.status)}>
                            {StatusDisplay[doc.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {formatDate(doc.createdAt)}
                        </div>
                        {doc.rejectionReason && (
                          <p className="text-sm text-red-600 mt-1">
                            Rechazado: {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDocument(doc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>

                      {doc.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(doc.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(doc.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de vista previa */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Documento de {selectedDocument?.userName}
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Usuario:</strong> {selectedDocument.userName}
                </div>
                <div>
                  <strong>ID Usuario:</strong> {selectedDocument.userId}
                </div>
                <div>
                  <strong>Tipo:</strong> {DocumentTypeDisplay[selectedDocument.documentType]}
                </div>
                <div>
                  <strong>Estado:</strong> {StatusDisplay[selectedDocument.status]}
                </div>
                <div>
                  <strong>Creado:</strong> {formatDate(selectedDocument.createdAt)}
                </div>
                <div>
                  <strong>Actualizado:</strong> {formatDate(selectedDocument.updatedAt)}
                </div>
              </div>

              {selectedDocument.rejectionReason && (
                <div className="bg-red-50 border border-red-200 p-3 rounded">
                  <strong className="text-red-800">Motivo de rechazo:</strong>
                  <p className="text-red-700 mt-1">{selectedDocument.rejectionReason}</p>
                </div>
              )}

              {/* Imagen del documento */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Documento:</h4>
                <img
                  src={selectedDocument.fileUrl}
                  alt="Documento"
                  className="max-w-full h-auto rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-document.png';
                  }}
                />
              </div>

              {/* Acciones en el modal */}
              {selectedDocument.status === 'PENDING' && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedDocument.id);
                      setShowPreviewModal(false);
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Aprobar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedDocument.id);
                      setShowPreviewModal(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}