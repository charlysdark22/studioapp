'use client';

import React, { useState, useEffect } from 'react';
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
import PerformanceChart from '@/components/performance-chart';
import RevenuePieChart from '@/components/revenue-pie-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { getConsultants, getPerformanceData } from '../actions';
import MainHeader from '@/components/main-header';

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
  fixedCost: number;
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


  useEffect(() => {
    async function loadConsultants() {
      const consultants = await getConsultants();
      setConsultantOptions(consultants.map(c => ({ label: c.no_usuario, value: c.co_usuario })));
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
      alert("Por favor, selecione consultores e um período de datas.");
      return;
    }
    setIsLoading(true);
    setHasFetchedData(false);
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
    } catch (error) {
      console.error("Error fetching performance data:", error);
      alert("Ocorreu um erro ao buscar os dados.");
      setHasFetchedData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const totals = tableData.reduce((acc, curr) => {
    acc.total += curr.total;
    acc.liquid += curr.liquid;
    acc.commission += curr.commission;
    return acc;
  }, { total: 0, liquid: 0, commission: 0 });

  const groupedData = tableData.reduce((acc, item) => {
    (acc[item.client] = acc[item.client] || []).push(item);
    return acc;
  }, {} as Record<string, typeof tableData>);


  const handleShowChart = (type: 'bar' | 'pie') => {
    if (!hasFetchedData) {
        alert("Por favor, gere um relatório primeiro clicando no botão 'Relatório'.");
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
            <div className="flex items-end gap-4">
               <div className="flex-1">
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
               <div className="flex-1">
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
               <Button onClick={handleFetchData} disabled={isLoading}>
                  {isLoading ? 'Buscando...' : 'Relatório'}
               </Button>
               <Button onClick={() => handleShowChart('bar')} variant={activeChart === 'bar' ? 'default' : 'outline'} disabled={!hasFetchedData || isLoading}>
                  <BarChart /> Gráfico
               </Button>
                <Button onClick={() => handleShowChart('pie')} variant={activeChart === 'pie' ? 'default' : 'outline'} disabled={!hasFetchedData || isLoading}>
                  <PieChart /> Pizza
               </Button>
            </div>
        </div>
        
        <div className="bg-white p-4 rounded-b-lg border-l border-r border-b">
           {isLoading ? (
             <div className="text-center py-10 text-gray-500">Carregando dados...</div>
           ) : hasFetchedData && tableData.length > 0 ? (
             <Table>
                <TableHeader>
                  <TableRow className="bg-gray-200 hover:bg-gray-200">
                    <TableHead className="font-bold text-gray-700">Sistema Web</TableHead>
                    <TableHead className="font-bold text-gray-700">OS</TableHead>
                    <TableHead className="font-bold text-gray-700">NF</TableHead>
                    <TableHead className="font-bold text-gray-700">Emissão</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">Total</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">Líquido</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">Comissão</TableHead>
                    <TableHead className="font-bold text-gray-700">Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedData).map(([client, items]) => {
                    const clientTotal = items.reduce((acc, i) => acc + i.total, 0);
                    const clientLiquid = items.reduce((acc, i) => acc + i.liquid, 0);
                    const clientCommission = items.reduce((acc, i) => acc + i.commission, 0);
                    return (
                      <React.Fragment key={client}>
                        <TableRow className="bg-gray-50">
                          <TableCell colSpan={8} className="font-bold text-blue-700">{client}</TableCell>
                        </TableRow>
                        {items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.system}</TableCell>
                            <TableCell className="text-orange-500">{item.os}</TableCell>
                            <TableCell>{item.nf}</TableCell>
                            <TableCell>{formatDate(item.emission)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.liquid)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.commission)}</TableCell>
                            <TableCell className={item.status === 'NF Paga' ? 'text-blue-600 font-bold' : ''}>{item.status}</TableCell>
                          </TableRow>
                        ))}
                         <TableRow className="bg-gray-50 font-bold">
                            <TableCell colSpan={4}>TOTAL</TableCell>
                            <TableCell className="text-right">{formatCurrency(clientTotal)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(clientLiquid)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(clientCommission)}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                      </React.Fragment>
                    )
                  })}
                  <TableRow className="bg-gray-200 font-bold">
                    <TableCell colSpan={4} >TOTAL FINAL</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.total)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.liquid)}</TableCell>
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
