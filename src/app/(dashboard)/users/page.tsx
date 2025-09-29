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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  Eye, 
  Ban, 
  CheckCircle,
  XCircle,
  User, 
  Users,
  Calendar,
  Star,
  DollarSign,
  Shield,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertTriangle,
  FileQuestion
} from 'lucide-react';
import { adminUsersService, AdminUser, UserFilters, UserStatusUpdate } from '@/lib/services/adminUsers';

export default function UsersPage() {
  // Estados principales
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Filtros
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20,
    search: '',
    status: 'ALL',
    verified: undefined
  });

  // Estados para cambio de status
  const [statusUpdate, setStatusUpdate] = useState<UserStatusUpdate>({
    status: 'OK',
    reason: ''
  });

  // Mapeo de estados para mostrar
  const StatusDisplay = {
    'OK': 'Activo',
    'BLOCKED': 'Bloqueado',
    'DISABLED': 'Deshabilitado'
  };

  // Mapeo de niveles de verificación
  const VerificationDisplay: Record<string, string> = {
    'BASIC': 'Básico',
    'VERIFIED': 'Verificado',
    'PREMIUM': 'Premium',
    'UNVERIFIED': 'Sin verificar'
  };

  // Colores para badges
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'OK': return 'bg-green-100 text-green-800 border-green-200';
      case 'BLOCKED': return 'bg-red-100 text-red-800 border-red-200';
      case 'DISABLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVerificationColor = (level: string): string => {
    switch (level) {
      case 'PREMIUM': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'VERIFIED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BASIC': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función helper para obtener el nivel de verificación seguro
  const getVerificationLevel = (user: AdminUser): string => {
    return user.verificationLevel || 'UNVERIFIED';
  };

  // Cargar usuarios
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminUsersService.getAllUsers(filters);
      console.log('👥 Users loaded:', response);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('❌ Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  // Aplicar filtros
  const applyFilters = () => {
    setFilters({ ...filters, page: 1 });
  };

  // Ver detalles del usuario
  const viewUserDetails = async (user: AdminUser) => {
    try {
      const userDetails = await adminUsersService.getUserDetails(user.id);
      setSelectedUser(userDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Error al cargar detalles del usuario');
    }
  };

  // Cambiar estado del usuario
  const handleStatusChange = (user: AdminUser, newStatus: 'OK' | 'BLOCKED' | 'DISABLED') => {
    setSelectedUser(user);
    setStatusUpdate({
      status: newStatus,
      reason: ''
    });
    setShowStatusModal(true);
  };

  // Confirmar cambio de estado
  const confirmStatusChange = async () => {
    if (!selectedUser) return;

    try {
      await adminUsersService.updateUserStatus(selectedUser.id, statusUpdate);
      console.log('✅ User status updated successfully');
      setShowStatusModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      console.error('❌ Error updating user status:', error);
      alert('Error al actualizar estado del usuario');
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear dinero
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  // Effects
  useEffect(() => {
    loadUsers();
  }, [filters]);

  // Estadísticas rápidas
  const stats = {
    total: pagination.totalUsers,
    active: users.filter(u => u.state === 'OK').length,
    blocked: users.filter(u => u.state === 'BLOCKED').length,
    verified: users.filter(u => u.identityVerified).length,
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los usuarios de la plataforma
          </p>
        </div>
        <Button onClick={loadUsers} disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
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
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bloqueados</p>
                <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verificados</p>
                <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
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
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda - ocupa más espacio */}
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  className="pl-10 h-11"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>
            </div>

            {/* Estado */}
            <div className="w-full lg:w-48">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Estado
              </label>
              <Select
                value={filters.status || 'ALL'}
                onValueChange={(value) => setFilters({...filters, status: value as any})}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="OK">Activos</SelectItem>
                  <SelectItem value="BLOCKED">Bloqueados</SelectItem>
                  <SelectItem value="DISABLED">Deshabilitados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verificación */}
            <div className="w-full lg:w-48">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Verificación
              </label>
              <Select
                value={filters.verified === undefined ? 'ALL' : filters.verified.toString()}
                onValueChange={(value) => {
                  const verified = value === 'ALL' ? undefined : value === 'true';
                  setFilters({...filters, verified});
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Verificación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="true">Verificados</SelectItem>
                  <SelectItem value="false">No verificados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón Aplicar */}
            <div className="w-full lg:w-48">
              <label className="text-sm font-medium text-transparent mb-2 block">
                Acción
              </label>
              <Button 
                onClick={applyFilters} 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Aplicar Filtros
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Indicador de filtros activos */}
          {(filters.search || filters.status !== 'ALL' || filters.verified !== undefined) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">Filtros activos:</span>
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Búsqueda: {filters.search}
                  <button
                    onClick={() => setFilters({...filters, search: ''})}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status !== 'ALL' && (
                <Badge variant="secondary" className="gap-1">
                  Estado: {StatusDisplay[filters.status as keyof typeof StatusDisplay]}
                  <button
                    onClick={() => setFilters({...filters, status: 'ALL'})}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.verified !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  {filters.verified ? 'Verificados' : 'No verificados'}
                  <button
                    onClick={() => setFilters({...filters, verified: undefined})}
                    className="ml-1 hover:bg-gray-300 rounded-full"
                  >
                    <XCircle className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters({
                    page: 1,
                    limit: 20,
                    search: '',
                    status: 'ALL',
                    verified: undefined
                  });
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Limpiar todos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios ({pagination.totalUsers})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileQuestion className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron usuarios
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Intenta ajustar los filtros de búsqueda
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilters({
                    page: 1,
                    limit: 20,
                    search: '',
                    status: 'ALL',
                    verified: undefined
                  });
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge className={getStatusColor(user.state)}>
                        {StatusDisplay[user.state]}
                      </Badge>
                      {getVerificationLevel(user) !== 'UNVERIFIED' && (
                        <Badge className={getVerificationColor(getVerificationLevel(user))}>
                          {VerificationDisplay[getVerificationLevel(user)]}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => viewUserDetails(user)}>
                      <Eye className="h-4 w-4 mr-1" /> Ver
                    </Button>
                    {user.state !== 'OK' && (
                      <Button size="sm" onClick={() => handleStatusChange(user, 'OK')}>
                        Activar
                      </Button>
                    )}
                    {user.state !== 'BLOCKED' && (
                      <Button size="sm" variant="destructive" onClick={() => handleStatusChange(user, 'BLOCKED')}>
                        Bloquear
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevPage}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Siguiente <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Modal de detalles */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium">{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <Badge className={getStatusColor(selectedUser.state)}>
                  {StatusDisplay[selectedUser.state]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registrado</p>
                <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de cambio de estado */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar estado de usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de cambiar el estado de <strong>{selectedUser?.name}</strong> a{' '}
              <strong>{statusUpdate.status === 'OK' ? 'Activo' : statusUpdate.status === 'BLOCKED' ? 'Bloqueado' : 'Deshabilitado'}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Motivo (opcional)
              </label>
              <Textarea
                placeholder="Explica el motivo del cambio de estado..."
                value={statusUpdate.reason}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, reason: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmStatusChange}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}