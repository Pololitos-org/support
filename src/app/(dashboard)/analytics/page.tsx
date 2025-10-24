// src/app/(dashboard)/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  ShoppingBag,
  DollarSign,
  Shield,
  TrendingUp,
  RefreshCw,
  Calendar,
  Activity
} from 'lucide-react';
import { analyticsService, AnalyticsData } from '@/lib/services/analytics';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const formatNumber = (value: number | null | undefined): string => {
    return (value ?? 0).toLocaleString('es-CL');
  };

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`📈 Loading analytics for ${selectedPeriod} days...`);
      const data = await analyticsService.getStats(selectedPeriod);
      console.log('✅ Analytics loaded:', data);
      setAnalytics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error loading analytics:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  // Colores para gráficos
  const colors = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    orange: '#F97316'
  };

  // Colores para el gráfico de dona
  const pieColors = [colors.primary, colors.success, colors.warning, colors.danger, colors.purple, colors.teal, colors.orange, '#6B7280', '#EC4899', '#06B6D4'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cargando analytics...
        </h3>
        <p className="text-sm text-gray-600">
          Procesando datos de la plataforma
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Activity className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error al cargar analytics
        </h3>
        <p className="text-sm text-gray-600 mb-6">{error}</p>
        <Button onClick={loadAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!analytics) return null;

  const { summary, charts } = analytics;
  const pieData = charts.tasksByCategory.map((item, index) => ({
    name: item.category,
    value: item.count,
    category: item.category,
    count: item.count
  }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado de métricas de la plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedPeriod.toString()}
            onValueChange={(value) => setSelectedPeriod(parseInt(value))}
          >
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totalUsers)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +{summary.newUsers} nuevos ({selectedPeriod} días)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Verificados</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.verifiedUsers)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {((summary.verifiedUsers / summary.totalUsers) * 100).toFixed(1)}% del total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Totales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totalTasks)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +{summary.newTasks} nuevas ({selectedPeriod} días)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsService.formatCurrency(summary.totalRevenue)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {analyticsService.formatCurrency(summary.periodRevenue)} ({selectedPeriod} días)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dinero en cuenta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-500" />
            Dinero en Cuenta (No Transferido)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-600">
                {analyticsService.formatCurrency(summary.heldMoney)}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Dinero pagado pero tareas aún no completadas
              </p>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Pendiente de completar
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios por mes */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={charts.monthlyUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => analyticsService.formatMonth(value)}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => analyticsService.formatMonth(value)}
                  formatter={(value: number) => [formatNumber(value), 'Usuarios']}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue por mes */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => analyticsService.formatMonth(value)}
                />
                <YAxis 
                  tickFormatter={(value) => analyticsService.formatCurrency(value)}
                />
                <Tooltip 
                  labelFormatter={(value) => analyticsService.formatMonth(value)}
                  formatter={(value: number) => [analyticsService.formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill={colors.success} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tareas completadas por mes */}
        <Card>
          <CardHeader>
            <CardTitle>Tareas Completadas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.monthlyTasks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value) => analyticsService.formatMonth(value)}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => analyticsService.formatMonth(value)}
                  formatter={(value: number) => [formatNumber(value), 'Tareas']}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke={colors.warning}
                  strokeWidth={3}
                  dot={{ fill: colors.warning, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tareas por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Tareas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const percent = ((entry.value / pieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0);
                    return `${entry.name} (${percent}%)`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [formatNumber(value), 'Tareas']} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Top Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {charts.tasksByCategory.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <span className="font-medium">{category.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{formatNumber(category.count)} tareas</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}