'use client';
import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PerformanceData {
  name: string;
  netRevenue: number;
  fixedCost: number;
  commission: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  averageFixedCost: number;
  formatCurrency: (value: number) => string;
  translations: {
    netRevenue: string;
    fixedCost: string;
    commission: string;
    averageFixedCost: string;
  }
}

const PerformanceChart = ({ data, averageFixedCost, formatCurrency, translations }: PerformanceChartProps) => {
  const chartData = data.map(item => ({
    name: item.name,
    [translations.netRevenue]: item.netRevenue,
    [translations.fixedCost]: item.fixedCost,
    [translations.commission]: item.commission,
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
        <Bar dataKey={translations.netRevenue} fill="#82ca9d" />
        <Bar dataKey={translations.fixedCost} fill="#8884d8" />
        <Bar dataKey={translations.commission} fill="#ffc658" />
        <ReferenceLine 
          y={averageFixedCost} 
          label={{ value: `${translations.averageFixedCost}: ${formatCurrency(averageFixedCost)}`, position: 'insideTopLeft', fill: 'red' }} 
          stroke="red" 
          strokeDasharray="3 3" 
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default memo(PerformanceChart);
