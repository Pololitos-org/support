// src/app/(dashboard)/dashboard/_components/QuickActions.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, MessageSquare, Users, Settings } from 'lucide-react';

interface QuickActionsProps {
  pendingVerifications: number;
  openTickets: number;
}

export default function QuickActions({ 
  pendingVerifications, 
  openTickets 
}: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => window.location.href = '/users'}
        >
          <Users className="h-4 w-4 mr-2" />
          Gestionar Usuarios
        </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => window.location.href = '/verification'}
        >
          <Shield className="h-4 w-4 mr-2" />
          Verificaciones ({pendingVerifications})
        </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => window.location.href = '/support'}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Tickets ({openTickets})
        </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => window.location.href = '/settings'}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </Button>
      </CardContent>
    </Card>
  );
}