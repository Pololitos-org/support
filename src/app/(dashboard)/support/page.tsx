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
  MessageSquare,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Calendar,
  RefreshCw,
  UserCheck,
  Zap,
  Archive
} from 'lucide-react';
import { 
  adminSupportService, 
  SupportTicket, 
  TicketFilters,
  getStatusDisplayText,
  getPriorityDisplayText,
  getStatusColor,
  getPriorityColor
} from '@/lib/services/adminSupport';

export default function SupportPage() {
  // Estados principales
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  // Estados para actualización de tickets
  const [ticketUpdate, setTicketUpdate] = useState({
    status: '',
    priority: '',
    assignedTo: undefined as number | undefined
  });
  
  // Filtros
  const [filters, setFilters] = useState<TicketFilters>({
    status: 'ALL',
    category: 'ALL',
    priority: 'ALL',
    search: ''
  });

  // Cargar tickets
  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const ticketsData = await adminSupportService.getAllTickets(filters);
      console.log('🎫 Tickets loaded:', ticketsData);
      setTickets(ticketsData);
    } catch (error) {
      console.error('❌ Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    loadTickets();
  };

  // Ver detalles del ticket
  const viewTicketDetails = async (ticket: SupportTicket) => {
    try {
      const ticketDetails = await adminSupportService.getTicketDetails(ticket.id);
      setSelectedTicket(ticketDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      alert('Error al cargar detalles del ticket');
    }
  };

  // Cambiar estado del ticket
  const handleUpdateTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketUpdate({
      status: ticket.status,
      priority: ticket.priority,
      assignedTo: ticket.assignedTo
    });
    setShowUpdateModal(true);
  };

  // Confirmar actualización
  const confirmTicketUpdate = async () => {
    if (!selectedTicket) return;

    try {
      await adminSupportService.updateTicket(selectedTicket.id, {
        status: ticketUpdate.status as any,
        priority: ticketUpdate.priority as any,
        assignedTo: ticketUpdate.assignedTo
      });
      console.log('✅ Ticket updated successfully');
      setShowUpdateModal(false);
      setSelectedTicket(null);
      await loadTickets(); // Recargar lista
    } catch (error) {
      console.error('❌ Error updating ticket:', error);
      alert('Error al actualizar el ticket');
    }
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

  // Obtener tiempo transcurrido
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} días`;
  };

  // Effects
  useEffect(() => {
    loadTickets();
  }, []);

  // Estadísticas rápidas
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => ['NEW', 'OPEN', 'IN_PROGRESS'].includes(t.status)).length,
    pending: tickets.filter(t => t.status === 'PENDING_CUSTOMER').length,
    resolved: tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length,
    urgent: tickets.filter(t => t.priority === 'URGENT').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Soporte</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los tickets de soporte de usuarios
          </p>
        </div>
        <Button onClick={loadTickets} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
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
              <AlertCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Abiertos</p>
                <p className="text-2xl font-bold text-green-600">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resueltos</p>
                <p className="text-2xl font-bold text-purple-600">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tickets..."
                className="pl-10"
                value={filters.search || ''}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>

            {/* Estado */}
            <Select
              value={filters.status || 'ALL'}
              onValueChange={(value) => setFilters({...filters, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="NEW">Nuevo</SelectItem>
                <SelectItem value="OPEN">Abierto</SelectItem>
                <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                <SelectItem value="PENDING_CUSTOMER">Esperando Cliente</SelectItem>
                <SelectItem value="RESOLVED">Resuelto</SelectItem>
                <SelectItem value="CLOSED">Cerrado</SelectItem>
              </SelectContent>
            </Select>

            {/* Prioridad */}
            <Select
              value={filters.priority || 'ALL'}
              onValueChange={(value) => setFilters({...filters, priority: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="LOW">Baja</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
              </SelectContent>
            </Select>

            {/* Categoría */}
            <Select
              value={filters.category || 'ALL'}
              onValueChange={(value) => setFilters({...filters, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="TECHNICAL">Técnico</SelectItem>
                <SelectItem value="BILLING">Facturación</SelectItem>
                <SelectItem value="ACCOUNT">Cuenta</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
              </SelectContent>
            </Select>

            {/* Aplicar */}
            <Button onClick={applyFilters} className="w-full">
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tickets */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tickets ({tickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron tickets</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    {/* Info del ticket */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          #{ticket.id} - {ticket.subject}
                        </h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusDisplayText(ticket.status)}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {getPriorityDisplayText(ticket.priority)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {ticket.userName} ({ticket.userEmail})
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(ticket.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {getTimeAgo(ticket.createdAt)}
                        </div>
                        {ticket.assignedToName && (
                          <div className="flex items-center gap-1">
                            <UserCheck className="h-4 w-4" />
                            Asignado a: {ticket.assignedToName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewTicketDetails(ticket)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateTicket(ticket)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Actualizar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles del ticket */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Ticket #{selectedTicket?.id} - {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Info básica */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Usuario:</strong> {selectedTicket.userName}</div>
                <div><strong>Email:</strong> {selectedTicket.userEmail}</div>
                <div><strong>Estado:</strong> {getStatusDisplayText(selectedTicket.status)}</div>
                <div><strong>Prioridad:</strong> {getPriorityDisplayText(selectedTicket.priority)}</div>
                <div><strong>Categoría:</strong> {selectedTicket.category}</div>
                <div><strong>Creado:</strong> {formatDate(selectedTicket.createdAt)}</div>
                <div><strong>Actualizado:</strong> {formatDate(selectedTicket.updatedAt)}</div>
                {selectedTicket.assignedToName && (
                  <div><strong>Asignado a:</strong> {selectedTicket.assignedToName}</div>
                )}
              </div>

              {/* Descripción */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Descripción:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Métricas adicionales */}
              {(selectedTicket.responseCount || selectedTicket.lastResponseAt) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Actividad:</h4>
                  <div className="text-sm space-y-1">
                    {selectedTicket.responseCount && (
                      <p>Respuestas: {selectedTicket.responseCount}</p>
                    )}
                    {selectedTicket.lastResponseAt && (
                      <p>Última respuesta: {formatDate(selectedTicket.lastResponseAt)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de actualización de ticket */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Actualizar Ticket #{selectedTicket?.id}
            </DialogTitle>
            <DialogDescription>
              Modifica el estado, prioridad o asignación de este ticket
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Estado */}
            <div>
              <label className="text-sm font-medium">Estado:</label>
              <Select
                value={ticketUpdate.status}
                onValueChange={(value) => setTicketUpdate({...ticketUpdate, status: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Nuevo</SelectItem>
                  <SelectItem value="OPEN">Abierto</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="PENDING_CUSTOMER">Esperando Cliente</SelectItem>
                  <SelectItem value="RESOLVED">Resuelto</SelectItem>
                  <SelectItem value="CLOSED">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="text-sm font-medium">Prioridad:</label>
              <Select
                value={ticketUpdate.priority}
                onValueChange={(value) => setTicketUpdate({...ticketUpdate, priority: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mensaje de estado */}
            {ticketUpdate.status === 'RESOLVED' && (
              <div className="bg-green-50 border border-green-200 p-3 rounded">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <div className="text-sm text-green-700">
                    <strong>Resolver ticket:</strong> Se marcará como resuelto y se notificará al usuario.
                  </div>
                </div>
              </div>
            )}

            {ticketUpdate.status === 'CLOSED' && (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded">
                <div className="flex">
                  <Archive className="h-5 w-5 text-gray-400 mr-2" />
                  <div className="text-sm text-gray-700">
                    <strong>Cerrar ticket:</strong> Se archivará el ticket y no permitirá más respuestas.
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUpdateModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmTicketUpdate}
              disabled={!ticketUpdate.status || !ticketUpdate.priority}
            >
              Actualizar Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}