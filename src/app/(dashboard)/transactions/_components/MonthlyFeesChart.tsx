import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Props {
  data: Array<{ month: string; fees: number }>;
}

export default function MonthlyFeesChart({ data }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comisiones por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('es-CL', { month: 'short' });
              }}
            />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Comisiones']}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('es-CL', { 
                  month: 'long', 
                  year: 'numeric' 
                });
              }}
            />
            <Bar dataKey="fees" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}