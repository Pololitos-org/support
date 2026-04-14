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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  FileQuestion,
  Banknote,
  Copy,
  Check
} from 'lucide-react';
import {
  adminUsersService,
  AdminUser,
  UserFilters,
  UserStatusUpdate,
  PendingPayoutUser,
  UserTask
} from '@/lib/services/adminUsers';
import UserTasksTab from './[id]/_components/UserTasksTab';

export default function UsersPage() {
  // Estados principales
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayoutUser[]>([]);
  // 🆕 Tasks state
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tab activo
  const [activeTab, setActiveTab] = useState<'all' | 'payouts' | 'approvals'>('all');

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);

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

  // Filtro para pagos pendientes
  const [minBalance, setMinBalance] = useState<number>(1000);

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

  // Función para copiar al portapapeles
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
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

  // 🆕 Load user tasks
  const loadUserTasks = async (userId: number) => {
    setIsLoadingTasks(true);
    try {
      const response = await adminUsersService.getUserTasks(userId, { limit: 100, role: 'worker', status: 'completed' });
      // Filter only tasks that need payout (Payment Held)
      const tasksToPay = response.data.asWorker.filter(t => t.paymentStatus === 'PAYMENT_HELD');
      setUserTasks(tasksToPay);
    } catch (error) {
      console.error('Error loading user tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // 🆕 Handle Payout
  const handlePayout = async (task: UserTask) => {
    if (!confirm(`¿Estás seguro de liberar el pago de ${formatMoney(task.earnedAmount || 0)} para la tarea "${task.title}"?`)) {
      return;
    }

    try {
      // Necesitamos offerId y serviceFee. Si no vienen en el objeto task, habría que pedirlos o asegurarnos que vengan.
      // Asumiremos que UserTask tiene offerId y netAmount es lo que se paga.
      if (!task.offerId || !task.earnedAmount) {
        alert('Error: Faltan datos de la oferta para procesar el pago');
        return;
      }

      await adminUsersService.releasePayment(
        task.id,
        task.offerId,
        task.earnedAmount,
        task.platformFee || 0 // Si no hay fee, enviamos 0
      );

      alert('✅ Pago liberado exitosamente');
      // Recargar datos
      if (selectedUser) {
        await viewUserDetails(selectedUser.id);
        await loadPendingPayouts();
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('❌ Error al procesar el pago. Revisa la consola o intenta de nuevo.');
    }
  };

  // Cargar pagos pendientes
  const loadPendingPayouts = async () => {
    setIsLoadingPayouts(true);
    try {
      const response = await adminUsersService.getPendingPayouts(minBalance);
      console.log('💰 Pending payouts loaded:', response);
      setPendingPayouts(response.data);
    } catch (error) {
      console.error('❌ Error loading pending payouts:', error);
    } finally {
      setIsLoadingPayouts(false);
    }
  };

  // Cargar aprobaciones pendientes
  const loadPendingApprovals = async () => {
    setIsLoadingApprovals(true);
    try {
      const response = await adminUsersService.getPendingWorkerApprovals();
      setPendingApprovals(response.users || []);
    } catch (error) {
      console.error('❌ Error loading pending approvals:', error);
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  // Aprobar proveedor
  const handleApproveWorker = async (userId: number) => {
    if (!confirm('¿Estás seguro de aprobar a este usuario como proveedor?')) return;
    try {
      await adminUsersService.approveWorker(userId);
      alert('✅ Usuario aprobado como proveedor');
      loadPendingApprovals();
    } catch (error) {
      console.error('❌ Error approving worker:', error);
      alert('Error al aprobar proveedor');
    }
  };

  // Rechazar proveedor
  const handleRejectWorker = async (userId: number) => {
    if (!confirm('¿Estás seguro de rechazar la solicitud de este proveedor?')) return;
    try {
      await adminUsersService.rejectWorker(userId);
      alert('❌ Solicitud rechazada');
      loadPendingApprovals();
    } catch (error) {
      console.error('❌ Error rejecting worker:', error);
      alert('Error al rechazar proveedor');
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
  const viewUserDetails = async (userId: number) => {
    try {
      const userDetails = await adminUsersService.getUserDetails(userId);
      setSelectedUser(userDetails);

      // 🆕 Load tasks if we are in payouts tab or just load them anyway
      await loadUserTasks(userId);

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
      if (activeTab === 'payouts') {
        await loadPendingPayouts();
      }
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
    if (activeTab === 'all') {
      loadUsers();
    }
  }, [filters, activeTab]);

  useEffect(() => {
    if (activeTab === 'payouts') {
      loadPendingPayouts();
    }
  }, [activeTab, minBalance]);

  useEffect(() => {
    if (activeTab === 'approvals') {
      loadPendingApprovals();
    }
  }, [activeTab]);

  // Estadísticas rápidas
  const stats = {
    total: pagination.totalUsers,
    active: users.filter(u => u.state === 'OK').length,
    blocked: users.filter(u => u.state === 'BLOCKED').length,
    verified: users.filter(u => u.identityVerified).length,
  };

  const payoutStats = {
    total: pendingPayouts.length,
    withBank: pendingPayouts.filter(u => u.hasBankAccount).length,
    withoutBank: pendingPayouts.filter(u => !u.hasBankAccount).length,
    totalAmount: pendingPayouts.reduce((sum, u) => sum + u.availableBalance, 0)
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
        <Button
          onClick={() => {
            if (activeTab === 'all') loadUsers();
            else if (activeTab === 'payouts') loadPendingPayouts();
            else if (activeTab === 'approvals') loadPendingApprovals();
          }}
          disabled={isLoading || isLoadingPayouts || isLoadingApprovals}
        >
          {(isLoading || isLoadingPayouts || isLoadingApprovals) ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="all">
            <Users className="h-4 w-4 mr-2" />
            Todos los Usuarios
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <Banknote className="h-4 w-4 mr-2" />
            Pagos Pendientes
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <Shield className="h-4 w-4 mr-2" />
            Aprobaciones (Proveedores)
          </TabsTrigger>
        </TabsList>

        {/* TAB: Todos los usuarios */}
        <TabsContent value="all" className="space-y-6">
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
                {/* Búsqueda */}
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
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
                    onValueChange={(value) => setFilters({ ...filters, status: value as any })}
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
                      setFilters({ ...filters, verified });
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
                        onClick={() => setFilters({ ...filters, search: '' })}
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
                        onClick={() => setFilters({ ...filters, status: 'ALL' })}
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
                        onClick={() => setFilters({ ...filters, verified: undefined })}
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
                    <div
                      key={user.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => viewUserDetails(user.id)}
                    >
                      <div className="flex items-center justify-between">
                        {/* Info - ahora es clickeable */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate group-hover:text-blue-600 transition-colors">
                            {user.name}
                          </p>
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

                        {/* Acciones - prevenir propagación del click */}
                        <div
                          className="flex gap-2 ml-4 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()} // ✅ Importante: evita que se abra el modal
                        >
                          {user.state !== 'OK' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(user, 'OK');
                              }}
                            >
                              Activar
                            </Button>
                          )}
                          {user.state !== 'BLOCKED' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(user, 'BLOCKED');
                              }}
                            >
                              Bloquear
                            </Button>
                          )}
                        </div>
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
        </TabsContent>

        {/* TAB: Pagos Pendientes */}
        <TabsContent value="payouts" className="space-y-6">
          {/* Stats Cards para pagos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total usuarios</p>
                    <p className="text-2xl font-bold text-gray-900">{payoutStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Con cuenta bancaria</p>
                    <p className="text-2xl font-bold text-green-600">{payoutStats.withBank}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sin cuenta bancaria</p>
                    <p className="text-2xl font-bold text-yellow-600">{payoutStats.withoutBank}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total disponible</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatMoney(payoutStats.totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtro de balance mínimo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Balance mínimo (CLP)
                  </label>
                  <Input
                    type="number"
                    placeholder="Ej: 1000"
                    value={minBalance}
                    onChange={(e) => setMinBalance(Number(e.target.value))}
                    className="h-11"
                  />
                </div>
                <Button
                  onClick={() => loadPendingPayouts()}
                  className="h-11"
                  disabled={isLoadingPayouts}
                >
                  {isLoadingPayouts ? 'Cargando...' : 'Aplicar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de pagos pendientes */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios con pagos pendientes ({payoutStats.total})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPayouts ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Cargando pagos pendientes...</p>
                </div>
              ) : pendingPayouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Banknote className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    No hay pagos pendientes
                  </p>
                  <p className="text-sm text-gray-500">
                    No se encontraron usuarios con balance mayor a {formatMoney(minBalance)}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPayouts.map((user) => (
                    <div
                      key={user.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${!user.hasBankAccount
                        ? 'bg-yellow-50 border-yellow-200 hover:shadow-md'
                        : 'hover:bg-gray-50 hover:shadow-md'
                        }`}
                      onClick={() => viewUserDetails(user.id)}
                    >
                      <div className="flex items-start justify-between">
                        {/* Info del usuario */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                              {user.name}
                            </p>
                            {!user.hasBankAccount && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Sin cuenta bancaria
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                          {user.phone && (
                            <p className="text-sm text-gray-600 mb-3">{user.phone}</p>
                          )}

                          {/* Stats del usuario */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-gray-500">Balance disponible</p>
                              <p className="font-bold text-green-600">
                                {formatMoney(user.availableBalance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Pendiente</p>
                              <p className="font-semibold text-yellow-600">
                                {formatMoney(user.pendingBalance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Total ganado</p>
                              <p className="font-semibold text-gray-700">
                                {formatMoney(user.totalEarnings)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Tier</p>
                              <Badge variant="outline">{user.tier}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Aprobaciones de Proveedores */}
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Proveedor Pendientes ({pendingApprovals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingApprovals ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-500">Cargando solicitudes...</p>
                </div>
              ) : pendingApprovals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Shield className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    No hay solicitudes pendientes
                  </p>
                  <p className="text-sm text-gray-500">
                    Todos los proveedores están al día.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((user) => (
                    <div
                      key={user.id}
                      className="border rounded-lg p-4 bg-white hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{user.name}</h3>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                              PENDIENTE
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                          <p className="text-sm text-gray-600 mb-3">
                            Solicitud enviada el: {user.workerApprovalRequestedAt ? formatDate(user.workerApprovalRequestedAt) : 'N/A'}
                          </p>

                          <div className="flex gap-3">
                            <Badge className={user.identityVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {user.identityVerified ? <CheckCircle className="w-3 h-3 mr-1 inline" /> : <XCircle className="w-3 h-3 mr-1 inline" />}
                              Identidad
                            </Badge>
                            <Badge className={user.criminalRecordVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {user.criminalRecordVerified ? <CheckCircle className="w-3 h-3 mr-1 inline" /> : <XCircle className="w-3 h-3 mr-1 inline" />}
                              Antecedentes
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewUserDetails(user.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Ver Perfil
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectWorker(user.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Rechazar
                          </Button>
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                            onClick={() => handleApproveWorker(user.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Aprobar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles completo */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalles de usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="bank">Datos Bancarios</TabsTrigger>
                <TabsTrigger value="payments">Pagos ({userTasks.length})</TabsTrigger>
                <TabsTrigger value="tasks">Tareas</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6 py-4 min-h-[500px]">
                {/* Información básica */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
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
                    <div>
                      <p className="text-sm text-gray-600">Ubicación</p>
                      <p className="font-medium">{selectedUser.location || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedUser.bio && (
                    <div>
                      <p className="text-sm text-gray-600">Biografía</p>
                      <p className="font-medium text-sm mt-1">{selectedUser.bio}</p>
                    </div>
                  )}
                </div>

                {/* Estadísticas */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Estadísticas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tareas completadas</p>
                      <p className="font-medium text-xl">{selectedUser.totalTasks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Calificación</p>
                      <p className="font-medium text-xl flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        {selectedUser.averageRating.toFixed(1)} ({selectedUser.totalRatings})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ganancias totales</p>
                      <p className="font-medium text-xl">{formatMoney(selectedUser.earningsTotal)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Últimos 30 días</p>
                      <p className="font-medium text-xl">
                        {formatMoney(selectedUser.earningsLast30Days || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tier</p>
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {selectedUser.tier || 'BRONZE'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Balance */}
                {selectedUser.balance && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Balance
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-gray-600 mb-1">Disponible para retiro</p>
                        <p className="font-bold text-2xl text-green-600">
                          {formatMoney(selectedUser.balance.availableBalance)}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-sm text-gray-600 mb-1">Pendiente (en escrow)</p>
                        <p className="font-bold text-2xl text-yellow-600">
                          {formatMoney(selectedUser.balance.pendingBalance)}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Total ganado</p>
                        <p className="font-bold text-xl text-blue-600">
                          {formatMoney(selectedUser.balance.totalEarnings)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total retirado</p>
                        <p className="font-bold text-xl text-gray-700">
                          {formatMoney(selectedUser.balance.totalWithdrawn)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verificación */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Verificación
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      {selectedUser.identityVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-sm">Identidad verificada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedUser.criminalRecordVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-sm">Antecedentes verificados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedUser.addressVerified ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                      <span className="text-sm">Dirección verificada</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nivel de verificación</p>
                      <Badge className={getVerificationColor(getVerificationLevel(selectedUser))}>
                        {VerificationDisplay[getVerificationLevel(selectedUser)]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 🆕 TAB: Datos Bancarios */}
              <TabsContent value="bank" className="space-y-6 py-4 min-h-[500px]">
                {selectedUser.bankAccount ? (
                  <div className="space-y-3 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-300">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-yellow-900">
                      <Banknote className="h-5 w-5" />
                      Información Bancaria (Confidencial)
                    </h3>

                    <div className="bg-white rounded-lg p-4 border border-yellow-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Titular de la cuenta</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-medium">{selectedUser.bankAccount.nombreCompleto}</p>
                            <button
                              onClick={() => copyToClipboard(selectedUser.bankAccount!.nombreCompleto, 'nombre')}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {copiedField === 'nombre' ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">RUT</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="font-medium">{selectedUser.bankAccount.rut}</p>
                            <button
                              onClick={() => copyToClipboard(selectedUser.bankAccount!.rut, 'rut')}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {copiedField === 'rut' ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Banco</p>
                          <p className="font-medium mt-1">{selectedUser.bankAccount.banco}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tipo de cuenta</p>
                          <p className="font-medium mt-1 capitalize">{selectedUser.bankAccount.tipoCuenta}</p>
                        </div>
                        <div className="col-span-2 bg-yellow-100 p-3 rounded border border-yellow-300">
                          <p className="text-sm text-gray-600 mb-1">Número de cuenta</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono font-bold text-xl text-gray-900">
                              {selectedUser.bankAccount.numeroCuentaCompleto}
                            </p>
                            <button
                              onClick={() => copyToClipboard(selectedUser.bankAccount!.numeroCuentaCompleto!, 'cuenta')}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {copiedField === 'cuenta' ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : (
                                <Copy className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-yellow-800 mt-2 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Información sensible - Usar solo para transferencias
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-600">
                      <AlertTriangle className="h-5 w-5" />
                      Sin Información Bancaria
                    </h3>
                    <p className="text-sm text-gray-600">
                      Este usuario no ha registrado información bancaria aún.
                      No se pueden procesar pagos hasta que complete este paso.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* 🆕 TAB: Pagos (Tareas por Pagar) */}
              <TabsContent value="payments" className="space-y-4 py-4 min-h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Tareas con Pago Retenido</h3>
                  <Badge variant="outline">{userTasks.length} pendientes</Badge>
                </div>

                {isLoadingTasks ? (
                  <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                ) : userTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay tareas pendientes de pago para este usuario.</p>
                ) : (
                  <div className="space-y-3">
                    {userTasks.map(task => (
                      <div key={task.id} className="border p-3 rounded-lg flex justify-between items-center bg-yellow-50 border-yellow-200">
                        <div>
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-sm text-gray-600">Completada el: {formatDate(task.completed || '')}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">ID: {task.id}</Badge>
                            <Badge className="bg-yellow-100 text-yellow-800">Retenido</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-700">{formatMoney(task.earnedAmount || 0)}</p>
                          <Button
                            size="sm"
                            className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handlePayout(task)}
                          >
                            <DollarSign className="w-4 h-4 mr-1" /> Pagar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* 🆕 TAB: Tareas (Moderación y Listado Completo) */}
              <TabsContent value="tasks" className="space-y-4 py-4 min-h-[500px]">
                <UserTasksTab userId={selectedUser.id} />
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Cerrar
            </Button>
            {selectedUser && selectedUser.state !== 'BLOCKED' && (
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleStatusChange(selectedUser, 'BLOCKED');
                }}
              >
                <Ban className="h-4 w-4 mr-2" />
                Bloquear usuario
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de cambio de estado */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar estado de usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de cambiar el estado de <strong>{selectedUser?.name}</strong> a{' '}
              <strong>
                {statusUpdate.status === 'OK' ? 'Activo' : statusUpdate.status === 'BLOCKED' ? 'Bloqueado' : 'Deshabilitado'}
              </strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Motivo {statusUpdate.status !== 'OK' && '(recomendado)'}
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
            <Button
              onClick={confirmStatusChange}
              variant={statusUpdate.status === 'BLOCKED' ? 'destructive' : 'default'}
            >
              Confirmar cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}