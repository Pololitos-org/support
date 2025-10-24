'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { transactionsService, TransactionStats, Transaction } from '@/lib/services/transactions';
import TransactionStatsCards from './TransactionStatsCards';
import MonthlyFeesChart from './MonthlyFeesChart';
import TransactionTypeBreakdown from './TransactionTypeBreakdown';
import TransactionsTable from './TransactionsTable';

export default function TransactionsTab() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`💰 Loading transactions for ${selectedPeriod} days...`);
      
      const [statsData, transactionsData] = await Promise.all([
        transactionsService.getStats(selectedPeriod),
        transactionsService.getRecentTransactions(50, 0)
      ]);
      
      console.log('✅ Data loaded:', { statsData, transactionsData });
      setStats(statsData);
      setTransactions(transactionsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error loading transactions:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  if (isLoading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cargando transacciones...
        </h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <Button onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex gap-2 justify-end">
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
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <TransactionStatsCards 
          stats={stats} 
          selectedPeriod={selectedPeriod}
        />
      )}

      {/* Gráficos */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyFeesChart data={stats.monthlyFees} />
          <TransactionTypeBreakdown data={stats.byType} />
        </div>
      )}

      {/* Tabla */}
      <TransactionsTable transactions={transactions} />
    </div>
  );
}