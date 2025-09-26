'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, PieChart, BarChart } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { MultiSelect, Option } from 'react-multi-select-component';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { getConsultants, getPerformanceData } from '../actions';
import MainHeader from '@/components/main-header';
import { useToast } from '@/hooks/use-toast';

const PerformanceChart = dynamic(() => import('@/components/performance-chart'), { ssr: false });
const RevenuePieChart = dynamic(() => import('@/components/revenue-pie-chart'), { ssr: false });

type TableDataType = {
  name: string;
  client: string;
  system: string;
  os: string;
  nf: string;
  emission: string;
  total: number;
  liquid: number;
  commission: number;
  status: string;
};

type ChartDataType = {
    name: string;
    netRevenue: number;
    commission: number;
    fixedCost: number;
}

export default function PerformancePage() {
  const [consultantOptions, setConsultantOptions] = useState<Option[]>([]);
  const [selectedConsultants, setSelectedConsultants] = useState<Option[]>([]);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2007, 0, 1),
    to: new Date(2007, 0, 31),
  });

  const [tableData, setTableData] = useState<TableDataType[]>([]);
  const [chartData, setChartData] = useState<ChartDataType[]>([]);
  const [averageFixedCost, setAverageFixedCost] = useState(0);

  const [activeChart, setActiveChart] = useState<'bar' | 'pie' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    async function loadConsultants() {
      const consultants = await getConsultants();
      setConsultantOptions(consultants.map(c => ({ label: c.no_usuario, value: c.no_usuario })));
    }
    loadConsultants();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  }

  const handleFetchData = async () => {
    if (selectedConsultants.length === 0 || !date?.from || !date?.to) {
      toast({
        title: "Selección requerida",
        description: "Por favor, selecione consultores e um período de datas.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setHasFetchedData(false);
    setTableData([]);
    setChartData([]);
    setActiveChart(null);
    try {
      const request = {
        consultants: selectedConsultants.map(c => c.label),
        from: date.from,
        to: date.to,
      };
      const result = await getPerformanceData(request);
      setTableData(result.tableData);
      setChartData(result.chartData);
      setAverageFixedCost(result.averageFixedCost);
      setHasFetchedData(true);
      if (result.tableData.length === 0) {
        toast({
          title: "Sin resultados",
          description: "Nenhum dado encontrado para os filtros selecionados.",
        });
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
      toast({
        title: "Error",
        description: "Ocorreu um erro ao buscar os dados.",
        variant: "destructive",
      });
      setHasFetchedData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => tableData.reduce((acc, curr) => {
    acc.liquid += curr.liquid;
    acc.commission += curr.commission;
    return acc;
  }, { liquid: 0, commission: 0 }), [tableData]);

  const groupedData = useMemo(() => tableData.reduce((acc, item) => {
    (acc[item.name] = acc[item.name] || []).push(item);
    return acc;
  }, {} as Record<string, typeof tableData>), [tableData]);


  const handleShowChart = (type: 'bar' | 'pie') => {
    if (!hasFetchedData) {
        toast({
            title: "Acción requerida",
            description: "Por favor, gere um relatório primeiro clicando no botão 'Relatório'.",
            variant: "destructive",
        });
        return;
    }
    setActiveChart(prev => prev === type ? null : type);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <MainHeader />
      
      <main className="flex-1 container mx-auto p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Performance Comercial</h2>
        <div className="bg-white p-4 rounded-t-lg border">
            <div className="flex flex-wrap items-end gap-4">
               <div className="flex-1 min-w-[250px]">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Período</label>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={'outline'}
                        className="w-full md:w-[300px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, 'dd/MM/yyyy')} -{' '}
                              {format(date.to, 'dd/MM/yyyy')}
                            </>
                          ) : (
                            format(date.from, 'dd/MM/yyyy')
                          )
                        ) : (
                          <span>Selecione um período</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
               </div>
               <div className="flex-1 min-w-[250px]">
                 <label className="text-sm font-medium text-gray-700 block mb-1">Consultores</label>
                 <MultiSelect
                    options={consultantOptions}
                    value={selectedConsultants}
                    onChange={setSelectedConsultants}
                    labelledBy="Selecione os consultores"
                     overrideStrings={{
                      selectSomeItems: 'Selecione...',
                      allItemsAreSelected: 'Todos selecionados',
                      selectAll: 'Selecionar todos',
                      search: 'Buscar',
                    }}
                    className="w-full"
                  />
               </div>
               <div className="flex gap-2 flex-wrap">
                 <Button onClick={handleFetchData} disabled={isLoading}>
                    {isLoading ? 'Buscando...' : 'Relatório'}
                 </Button>
                 <Button onClick={() => handleShowChart('bar')} variant={activeChart === 'bar' ? 'secondary' : 'outline'} disabled={!hasFetchedData || isLoading}>
                    <BarChart /> Gráfico
                 </Button>
                  <Button onClick={() => handleShowChart('pie')} variant={activeChart === 'pie' ? 'secondary' : 'outline'} disabled={!hasFetchedData || isLoading}>
                    <PieChart /> Pizza
                  </Button>
               </div>
            </div>
        </div>
        
        <div className="bg-white p-4 rounded-b-lg border-l border-r border-b">
           {isLoading ? (
             <div className="text-center py-10 text-gray-500">Carregando dados...</div>
           ) : hasFetchedData && tableData.length > 0 ? (
             <Table>
                <TableHeader>
                  <TableRow className="bg-gray-200 hover:bg-gray-200">
                    <TableHead className="font-bold text-gray-700">Período</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">Receita Líquida</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">Custo Fixo</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">Comissão</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">Lucro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedData).map(([name, items]) => {
                    const consultantChartData = chartData.find(c => c.name === name);
                    if (!consultantChartData) return null;

                    const totalLiquid = items.reduce((acc, i) => acc + i.liquid, 0);
                    const totalCommission = items.reduce((acc, i) => acc + i.commission, 0);
                    const profit = totalLiquid - (consultantChartData.fixedCost + totalCommission);
                    
                    return (
                      <React.Fragment key={name}>
                        <TableRow className="bg-gray-50 font-bold">
                          <TableCell colSpan={5} className="text-blue-700">{name}</TableCell>
                        </TableRow>
                          <TableRow>
                            <TableCell>{format(date!.from!, 'MMMM yyyy', {})} - {format(date!.to!, 'MMMM yyyy', {})}</TableCell>
                            <TableCell className="text-right">{formatCurrency(totalLiquid)}</TableCell>
                            <TableCell className="text-right text-red-500">{formatCurrency(consultantChartData.fixedCost)}</TableCell>
                            <TableCell className="text-right text-orange-500">{formatCurrency(totalCommission)}</TableCell>
                            <TableCell className={`text-right font-bold ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profit)}</TableCell>
                          </TableRow>
                      </React.Fragment>
                    )
                  })}
                  <TableRow className="bg-gray-200 font-bold">
                    <TableCell>SALDO</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.liquid)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.commission)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
           ) : (
             <div className="text-center py-10 text-gray-500">
               {!hasFetchedData && !isLoading 
                ? "Por favor, selecione um ou mais consultores e clique em 'Relatório' para ver os resultados."
                : "Nenhum dado encontrado para os filtros selecionados."
               }
             </div>
           )}
        </div>
        
        {activeChart && hasFetchedData && chartData.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeChart === 'bar' ? 'Desempenho dos Consultores' : 'Participação na Receita Líquida'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeChart === 'bar' && (
                  <PerformanceChart 
                    data={chartData} 
                    averageFixedCost={averageFixedCost}
                    formatCurrency={formatCurrency} 
                  />
                )}
                {activeChart === 'pie' && <RevenuePieChart data={chartData} formatCurrency={formatCurrency} />}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
