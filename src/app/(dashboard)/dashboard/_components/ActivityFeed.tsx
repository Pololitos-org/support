// src/app/(dashboard)/dashboard/_components/ActivityFeed.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingBag, Shield, MessageSquare } from 'lucide-react';
import { ActivityItem } from '@/lib/types/dashboard';

interface ActivityFeedProps {
  activity: ActivityItem[];
}

const ActivityItemComponent = ({ item }: { item: ActivityItem }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': 
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'task_created': 
        return <ShoppingBag className="h-4 w-4 text-green-500" />;
      case 'verification_pending': 
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'ticket_created': 
        return <MessageSquare className="h-4 w-4 text-red-500" />;
      default: 
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    // Si es menos de 1 hora, mostrar minutos
    if (diffInMinutes < 60) {
      return diffInMinutes === 0 
        ? 'Hace un momento' 
        : `Hace ${diffInMinutes} min`;
    }
    
    // Si es menos de 24 horas, mostrar horas
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    }
    
    // Si es más de 24 horas, mostrar fecha
    return date.toLocaleDateString('es-CL', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="mt-0.5">
        {getActivityIcon(item.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{item.description}</p>
        <p className="text-xs text-muted-foreground">
          {formatTime(item.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>
          Últimas acciones en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay actividad reciente
          </p>
        ) : (
          activity.map((item) => (
            <ActivityItemComponent key={item.id} item={item} />
          ))
        )}
      </CardContent>
    </Card>
  );
}