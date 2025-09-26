'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface PerformanceData {
  name: string;
  netRevenue: number;
  fixedCost: number;
  commission: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  formatCurrency: (value: number) => string;
}

const PerformanceChart = ({ data, formatCurrency }: PerformanceChartProps) => {
  const chartData = data.map(item => ({
    name: item.name,
    'Receita Líquida': item.netRevenue,
    'Custo Fixo': item.fixedCost,
    'Comissão': item.commission,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend />
        <Bar dataKey="Receita Líquida" fill="#82ca9d" />
        <Bar dataKey="Custo Fixo" fill="#8884d8" />
        <Bar dataKey="Comissão" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PerformanceChart;
