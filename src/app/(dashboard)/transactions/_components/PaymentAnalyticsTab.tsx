'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { 
  adminPaymentsService, 
  PaymentAnalyticsFilters, 
  UserPaymentData, 
  PaymentAnalyticsStatistics 
} from '@/lib/services/adminPayments';
import PaymentStatsCards from './PaymentStatsCards';
import PaymentFilters from './PaymentFilters';
import PaymentAnalyticsTable from './PaymentAnalyticsTable';

export default function PaymentAnalyticsTab() {
  const [users, setUsers] = useState<UserPaymentData[]>([]);
  const [statistics, setStatistics] = useState<PaymentAnalyticsStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<PaymentAnalyticsFilters>({
    page: 1,
    limit: 20,
    sortBy: 'balance',
    sortOrder: 'DESC',
    state: 'OK',
  });

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await adminPaymentsService.getPaymentAnalytics(filters);
      
      setUsers(data.users);
      setStatistics(data.statistics);
      
      if (data.pagination) {
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      setError('Error al cargar analytics de pagos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  const handleFilterChange = (key: keyof PaymentAnalyticsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleExportCSV = async () => {
    try {
      await adminPaymentsService.exportPaymentAnalyticsCSV(filters);
    } catch (err) {
      console.error('Error exportando:', err);
      alert('Error al exportar datos');
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading && !users.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cargando analytics...
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Controles */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={loadAnalytics} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      {statistics && <PaymentStatsCards statistics={statistics} />}

      {/* Filtros */}
      <PaymentFilters
        filters={filters} 
        onFilterChange={handleFilterChange}
      />

      {/* Tabla */}
      <PaymentAnalyticsTable 
        users={users}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}