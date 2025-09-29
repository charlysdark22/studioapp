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
import { PieChart, BarChart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getConsultants, getClients, getPerformanceData } from '../actions';
import MainHeader from '@/components/main-header';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

const PerformanceChart = dynamic(() => import('@/components/performance-chart'), { ssr: false });
const RevenuePieChart = dynamic(() => import('@/components/revenue-pie-chart'), { ssr: false });

type Option = { co_usuario: string; no_usuario: string };
type ClientOption = { label: string; value: string };

type TableDataType = {
  name: string;
  netRevenue: number;
  fixedCost: number;
  commission: number;
};

type ChartDataType = {
  name: string;
  netRevenue: number;
  commission: number;
  fixedCost: number;
};

type ReportType = 'consultant' | 'client';

const months = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const years = Array.from({ length: 8 }, (_, i) => 2000 + i);

export default function PerformancePage() {
  const { language, translations } = useLanguage();
  const [consultantOptions, setConsultantOptions] = useState<Option[]>([]);
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const [startMonth, setStartMonth] = useState('1');
  const [startYear, setStartYear] = useState('2007');
  const [endMonth, setEndMonth] = useState('1');
  const [endYear, setEndYear] = useState('2007');
  
  const [tableData, setTableData] = useState<TableDataType[]>([]);
  const [chartData, setChartData] = useState<ChartDataType[]>([]);
  const [averageFixedCost, setAverageFixedCost] = useState(0);

  const [activeChart, setActiveChart] = useState<'bar' | 'pie' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('consultant');
  const { toast } = useToast();

  useEffect(() => {
    async function loadInitialData() {
      const [consultants, clients] = await Promise.all([getConsultants(), getClients()]);
      setConsultantOptions(consultants);
      setClientOptions(clients);
    }
    loadInitialData();
  }, []);

  const formatCurrency = (value: number) => {
    const localeMap = { pt: 'pt-BR', es: 'es-AR', en: 'en-US' };
    const currencyMap = { pt: 'BRL', es: 'ARS', en: 'USD' };
    const locale = localeMap[language];
    const currency = currencyMap[language];
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };
  
  const handleFetchData = async () => {
    if ((reportType === 'consultant' && selectedConsultants.length === 0) || (reportType === 'client' && selectedClients.length === 0)) {
      toast({
        title: translations.performancePage.toastSelectionRequiredTitle,
        description: translations.performancePage.toastSelectionRequiredDescription,
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
      const fromDate = new Date(parseInt(startYear), parseInt(startMonth) - 1, 1);
      const toDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, 1);
      
      const request = {
        consultants: selectedConsultants,
        clients: selectedClients,
        from: fromDate,
        to: toDate,
        reportType: reportType,
      };

      const result = await getPerformanceData(request);
      setTableData(result.tableData);
      setChartData(result.chartData);
      setAverageFixedCost(result.averageFixedCost);
      setHasFetchedData(true);
      if (result.tableData.length === 0) {
        toast({
          title: translations.performancePage.toastNoResultsTitle,
          description: translations.performancePage.toastNoResultsDescription,
        });
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : translations.performancePage.toastFetchError,
        variant: "destructive",
      });
      setHasFetchedData(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConsultantSelection = (co_usuario: string) => {
    setSelectedConsultants(prev => 
      prev.includes(co_usuario) ? prev.filter(c => c !== co_usuario) : [...prev, co_usuario]
    );
  };

  const handleClientSelection = (value: string) => {
    setSelectedClients(prev => 
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
    );
  };

  const totals = useMemo(() => tableData.reduce((acc, curr) => {
    acc.netRevenue += curr.netRevenue;
    acc.commission += curr.commission;
    const profit = curr.netRevenue - (curr.fixedCost + curr.commission);
    acc.profit += profit;
    return acc;
  }, { netRevenue: 0, commission: 0, profit: 0 }), [tableData]);

  const handleShowChart = (type: 'bar' | 'pie') => {
    if (!hasFetchedData || tableData.length === 0) {
        toast({
            title: translations.performancePage.toastActionRequiredTitle,
            description: translations.performancePage.toastActionRequiredDescription,
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
        <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{translations.performancePage.filtersTitle || 'Filtros'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
                <div className="col-span-1 md:col-span-4">
                    <label className="text-sm font-medium text-gray-700 block mb-1">{translations.performancePage.periodLabel}</label>
                    <div className="flex items-center gap-2">
                        <Select value={startMonth} onValueChange={setStartMonth}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={startYear} onValueChange={setStartYear}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <span className="text-gray-500">a</span>
                        <Select value={endMonth} onValueChange={setEndMonth}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={endYear} onValueChange={setEndYear}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="flex gap-2 justify-self-end">
                     <Button onClick={() => handleShowChart('bar')} variant="outline" size="icon" disabled={!hasFetchedData || isLoading || tableData.length === 0}>
                        <BarChart className="h-5 w-5" />
                     </Button>
                      <Button onClick={() => handleShowChart('pie')} variant="outline" size="icon" disabled={!hasFetchedData || isLoading || tableData.length === 0}>
                        <PieChart className="h-5 w-5" />
                      </Button>
                      <Button onClick={handleFetchData} disabled={isLoading}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                      </Button>
                 </div>
            </div>

            <Tabs value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="consultant">{translations.performancePage.byConsultant}</TabsTrigger>
                    <TabsTrigger value="client">{translations.performancePage.byClient}</TabsTrigger>
                </TabsList>
                <TabsContent value="consultant">
                    <div className="flex justify-between items-center mb-2 mt-4">
                        <h3 className="font-semibold">{translations.performancePage.consultantsLabel}</h3>
                        <div>
                            <Button variant="link" onClick={() => setSelectedConsultants(consultantOptions.map(c => c.co_usuario))}>{translations.performancePage.selectAll}</Button>
                            <Button variant="link" onClick={() => setSelectedConsultants([])}>{translations.performancePage.clearSelection}</Button>
                        </div>
                    </div>
                    <ScrollArea className="h-64 w-full rounded-md border p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {consultantOptions.map(consultant => (
                                <div key={consultant.co_usuario} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={consultant.co_usuario} 
                                        checked={selectedConsultants.includes(consultant.co_usuario)}
                                        onCheckedChange={() => handleConsultantSelection(consultant.co_usuario)}
                                    />
                                    <label htmlFor={consultant.co_usuario} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {consultant.no_usuario}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="client">
                    <div className="flex justify-between items-center mb-2 mt-4">
                        <h3 className="font-semibold">{translations.performancePage.clientsLabel}</h3>
                        <div>
                            <Button variant="link" onClick={() => setSelectedClients(clientOptions.map(c => c.value))}>{translations.performancePage.selectAll}</Button>
                            <Button variant="link" onClick={() => setSelectedClients([])}>{translations.performancePage.clearSelection}</Button>
                        </div>
                    </div>
                    <ScrollArea className="h-64 w-full rounded-md border p-4">
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {clientOptions.map(client => (
                                <div key={client.value} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={client.value}
                                        checked={selectedClients.includes(client.value)}
                                        onCheckedChange={() => handleClientSelection(client.value)}
                                    />
                                    <label htmlFor={client.value} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {client.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
        
        <div className="bg-white p-4 rounded-b-lg border-l border-r border-b mt-4">
           {isLoading ? (
             <div className="text-center py-10 text-gray-500">{translations.performancePage.loadingData}</div>
           ) : hasFetchedData && tableData.length > 0 ? (
             <Table>
                <TableHeader>
                  <TableRow className="bg-gray-200 hover:bg-gray-200">
                    <TableHead className="font-bold text-gray-700">{reportType === 'consultant' ? translations.performancePage.table.consultant : translations.performancePage.table.client}</TableHead>
                    <TableHead className="font-bold text-gray-700">{translations.performancePage.table.period}</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">{translations.performancePage.table.netRevenue}</TableHead>
                    {reportType === 'consultant' && <TableHead className="text-right font-bold text-gray-700">{translations.performancePage.table.fixedCost}</TableHead>}
                    <TableHead className="text-right font-bold text-gray-700">{translations.performancePage.table.commission}</TableHead>
                    {reportType === 'consultant' && <TableHead className="text-right font-bold text-gray-700">{translations.performancePage.table.profit}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item) => {
                    const profit = item.netRevenue - (item.fixedCost + item.commission);
                    const period = `${months[parseInt(startMonth)-1].label.substring(0,3)}/${startYear} a ${months[parseInt(endMonth)-1].label.substring(0,3)}/${endYear}`;
                    return (
                        <TableRow key={item.name}>
                            <TableCell className="font-medium text-blue-700">{item.name}</TableCell>
                            <TableCell>{period}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.netRevenue)}</TableCell>
                            {reportType === 'consultant' && <TableCell className="text-right text-red-500">{formatCurrency(item.fixedCost)}</TableCell>}
                            <TableCell className="text-right text-orange-500">{formatCurrency(item.commission)}</TableCell>
                            {reportType === 'consultant' && <TableCell className={`text-right font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profit)}</TableCell>}
                        </TableRow>
                    )
                  })}
                  <TableRow className="bg-gray-200 font-bold">
                    <TableCell colSpan={2}>SALDO</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.netRevenue)}</TableCell>
                    {reportType === 'consultant' && <TableCell></TableCell>}
                    <TableCell className="text-right">{formatCurrency(totals.commission)}</TableCell>
                    {reportType === 'consultant' && <TableCell className={`text-right ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totals.profit)}</TableCell>}
                  </TableRow>
                </TableBody>
              </Table>
           ) : (
             <div className="text-center py-10 text-gray-500">
               {!hasFetchedData && !isLoading 
                ? translations.performancePage.welcomeMessage
                : translations.performancePage.noDataMessage
               }
             </div>
           )}
        </div>
        
        {activeChart && hasFetchedData && chartData.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeChart === 'bar' 
                    ? (reportType === 'consultant' ? translations.performancePage.barChartTitleConsultant : translations.performancePage.barChartTitleClient)
                    : translations.performancePage.pieChartTitle
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeChart === 'bar' && (
                  <PerformanceChart 
                    data={chartData} 
                    averageFixedCost={averageFixedCost}
                    formatCurrency={formatCurrency} 
                    translations={translations.performancePage.chartTranslations}
                    showFixedCost={reportType === 'consultant'}
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
