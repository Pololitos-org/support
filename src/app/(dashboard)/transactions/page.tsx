'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users } from 'lucide-react';
import TransactionsTab from './_components/TransactionsTab';
import PaymentAnalyticsTab from './_components/PaymentAnalyticsTab';

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState('transactions');

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transacciones y Pagos</h1>
          <p className="text-gray-600 mt-1">
            Gestión financiera y análisis de usuarios
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="transactions">
            <DollarSign className="h-4 w-4 mr-2" />
            Transacciones
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Users className="h-4 w-4 mr-2" />
            Analytics Pagos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <TransactionsTab />
        </TabsContent>

        <TabsContent value="analytics">
          <PaymentAnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}