// src/app/(dashboard)/dashboard/error.tsx
'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/shared/ErrorState';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="p-6">
      <ErrorState
        title="Error al cargar el dashboard"
        message={error.message || 'No se pudieron cargar las estadísticas. Por favor, verifica tu conexión e intenta nuevamente.'}
        onRetry={reset}
        variant="page"
        error={error}
      />
    </div>
  );
}