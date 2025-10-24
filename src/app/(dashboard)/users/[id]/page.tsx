'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  User, 
  DollarSign, 
  Activity,
  Shield,
  Banknote,
  AlertTriangle,
  Copy,
  Check,
  Star,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react';
import { adminUsersService, AdminUser } from '@/lib/services/adminUsers';
import { transactionsService, Transaction } from '@/lib/services/transactions';
import UserInfoTab from './_components/UserInfoTab';
import UserTransactionsTab from './_components/UserTransactionsTab';
import UserTasksTab from './_components/UserTasksTab';
import UserActivityTab from './_components/UserActivityTab';
import UserVerificationTab from './_components/UserVerificationTab';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = useState<AdminUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'transactions' && transactions.length === 0) {
      loadTransactions();
    }
  }, [activeTab]);

  const loadUserDetails = async () => {
    setIsLoading(true);
    try {
      const userDetails = await adminUsersService.getUserDetails(userId);
      setUser(userDetails);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
        const response = await transactionsService.getUserTransactions(userId);
        setTransactions(response.transactions); // ✅ Ahora TypeScript sabe que response tiene .transactions
        // Opcional: si quieres usar el balance, está disponible en response.balance
    } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
    } finally {
        setIsLoadingTransactions(false);
    }
    };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-purple-500 text-white';
      case 'GOLD': return 'bg-yellow-500 text-white';
      case 'SILVER': return 'bg-gray-400 text-white';
      case 'BRONZE': return 'bg-orange-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-green-100 text-green-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      case 'DISABLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-500">Cargando detalles del usuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuario no encontrado</h2>
          <p className="text-gray-500 mb-4">El usuario que buscas no existe o no tienes permisos para verlo</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header con navegación */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
        <Badge className={getStatusColor(user.state)}>
          {user.state === 'OK' ? 'Activo' : user.state === 'BLOCKED' ? 'Bloqueado' : 'Deshabilitado'}
        </Badge>
      </div>

      {/* Stats Cards - Overview rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Balance Disponible</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(user.balance?.availableBalance || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ganado</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(user.earningsTotal || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
                <p className="text-2xl font-bold text-purple-600">{user.totalTasks}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tier Actual</p>
                <Badge className={`${getTierColor(user.tier)} text-lg px-3 py-1`}>
                  {user.tier || 'BRONZE'}
                </Badge>
              </div>
              <Award className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con contenido detallado */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 lg:grid-cols-7">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <User className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="balance" className="text-xs sm:text-sm">
            <DollarSign className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Balance</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs sm:text-sm">
            <Activity className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Tareas</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Transacciones</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">
            <Activity className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Actividad</span>
          </TabsTrigger>
          <TabsTrigger value="verification" className="text-xs sm:text-sm">
            <Shield className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Verificación</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="text-xs sm:text-sm">
            <Banknote className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Banco</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Información General */}
        <TabsContent value="overview" className="space-y-6">
          <UserInfoTab user={user} formatDate={formatDate} />
        </TabsContent>

        {/* Tab: Balance y Ganancias */}
        <TabsContent value="balance" className="space-y-6">
          {user.balance && (
            <Card>
              <CardHeader>
                <CardTitle>Detalles de Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                    <p className="text-sm text-gray-600 mb-2">💰 Disponible para Retiro</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(user.balance.availableBalance)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Puede ser retirado inmediatamente</p>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
                    <p className="text-sm text-gray-600 mb-2">⏳ En Escrow (Pendiente)</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {formatCurrency(user.balance.pendingBalance)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Fondos retenidos por tareas en curso</p>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">📊 Total Histórico Ganado</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(user.balance.totalEarnings)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Suma de todas las ganancias desde el inicio</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">💸 Total Retirado</p>
                    <p className="text-3xl font-bold text-gray-700">
                      {formatCurrency(user.balance.totalWithdrawn)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Suma de todos los retiros realizados</p>
                  </div>
                </div>

                {user.balance.lastTransactionAt && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Última transacción: <span className="font-semibold">{formatDate(user.balance.lastTransactionAt)}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Progresión de Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tier Actual</p>
                  <Badge className={`${getTierColor(user.tier)} text-xl px-4 py-2`}>
                    {user.tier || 'BRONZE'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Ganancias últimos 30 días</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(user.earningsLast30Days || 0)}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  <p>💡 Los tiers se calculan basándose en las ganancias de los últimos 30 días</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Tareas */}
        <TabsContent value="tasks">
          <UserTasksTab userId={userId} />
        </TabsContent>

        {/* Tab: Transacciones */}
        <TabsContent value="transactions">
          <UserTransactionsTab 
            transactions={transactions}
            isLoading={isLoadingTransactions}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>

        {/* Tab: Actividad */}
        <TabsContent value="activity">
          <UserActivityTab userId={userId} />
        </TabsContent>

        {/* Tab: Verificación */}
        <TabsContent value="verification">
          <UserVerificationTab user={user} />
        </TabsContent>

        {/* Tab: Información Bancaria */}
        <TabsContent value="bank" className="space-y-6">
          {user.bankAccount ? (
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <Banknote className="h-5 w-5" />
                  Información Bancaria (Confidencial)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-6 border border-yellow-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Titular de la cuenta</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">{user.bankAccount.nombreCompleto}</p>
                        <button
                          onClick={() => copyToClipboard(user.bankAccount!.nombreCompleto, 'nombre')}
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
                      <p className="text-sm text-gray-600 mb-1">RUT</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">{user.bankAccount.rut}</p>
                        <button
                          onClick={() => copyToClipboard(user.bankAccount!.rut, 'rut')}
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
                      <p className="text-sm text-gray-600 mb-1">Banco</p>
                      <p className="font-medium text-lg">{user.bankAccount.banco}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tipo de cuenta</p>
                      <p className="font-medium text-lg capitalize">{user.bankAccount.tipoCuenta}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-100 p-4 rounded-lg border-2 border-yellow-300">
                    <p className="text-sm text-gray-600 mb-2">Número de cuenta</p>
                    <div className="flex items-center gap-3">
                      <p className="font-mono font-bold text-2xl text-gray-900">
                        {user.bankAccount.numeroCuentaCompleto || user.bankAccount.numeroCuenta}
                      </p>
                      <button
                        onClick={() => copyToClipboard(
                          user.bankAccount!.numeroCuentaCompleto || user.bankAccount!.numeroCuenta, 
                          'cuenta'
                        )}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {copiedField === 'cuenta' ? (
                          <Check className="h-6 w-6 text-green-600" />
                        ) : (
                          <Copy className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-yellow-800 mt-3 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Información sensible - Usar solo para transferencias autorizadas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-50 border-2 border-gray-200">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin Información Bancaria</h3>
                <p className="text-gray-600">
                  Este usuario no ha registrado información bancaria aún.
                  <br />
                  No se pueden procesar pagos hasta que complete este paso.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}