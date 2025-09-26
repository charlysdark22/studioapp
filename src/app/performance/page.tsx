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
import { ptBR, es, enUS } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { MultiSelect, Option } from 'react-multi-select-component';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { getConsultants, getPerformanceData } from '../actions';
import MainHeader from '@/components/main-header';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';

const PerformanceChart = dynamic(() => import('@/components/performance-chart'), { ssr: false });
const RevenuePieChart = dynamic(() => import('@/components/revenue-pie-chart'), { ssr: false });

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
}

export default function PerformancePage() {
  const { language, translations } = useLanguage();
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
    const localeMap = { pt: 'pt-BR', es: 'es-AR', en: 'en-US' };
    const currencyMap = { pt: 'BRL', es: 'ARS', en: 'USD' }; // Note: ARS for R$ symbol hack

    const locale = localeMap[language];
    const currency = currencyMap[language];
    
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);

    if (language === 'es') {
        return formatted.replace('$', 'R$');
    }
    if (language === 'en') {
        // Even for english, we want to show BRL symbol
        return formatted.replace('$', 'R$');
    }
    return formatted;
  };

  const handleFetchData = async () => {
    if (selectedConsultants.length === 0 || !date?.from || !date?.to) {
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
  
  const dateLocaleMap = { pt: ptBR, es: es, en: enUS };
  const dateLocale = dateLocaleMap[language];
  const multiSelectStrings = {
      selectSomeItems: translations.performancePage.multiSelect.selectSomeItems,
      allItemsAreSelected: translations.performancePage.multiSelect.allItemsAreSelected,
      selectAll: translations.performancePage.multiSelect.selectAll,
      search: translations.performancePage.multiSelect.search,
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <MainHeader />
      
      <main className="flex-1 container mx-auto p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{translations.performancePage.title}</h2>
        <div className="bg-white p-4 rounded-t-lg border">
            <div className="flex flex-wrap items-end gap-4">
               <div className="flex-1 min-w-[250px]">
                  <label className="text-sm font-medium text-gray-700 block mb-1">{translations.performancePage.periodLabel}</label>
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
                              {format(date.from, 'PPP', { locale: dateLocale })} -{' '}
                              {format(date.to, 'PPP', { locale: dateLocale })}
                            </>
                          ) : (
                            format(date.from, 'PPP', { locale: dateLocale })
                          )
                        ) : (
                          <span>{translations.performancePage.datePlaceholder}</span>
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
                        locale={dateLocale}
                      />
                    </PopoverContent>
                  </Popover>
               </div>
               <div className="flex-1 min-w-[250px]">
                 <label className="text-sm font-medium text-gray-700 block mb-1">{translations.performancePage.consultantsLabel}</label>
                 <MultiSelect
                    options={consultantOptions}
                    value={selectedConsultants}
                    onChange={setSelectedConsultants}
                    labelledBy={translations.performancePage.consultantsLabel}
                     overrideStrings={multiSelectStrings}
                    className="w-full"
                  />
               </div>
               <div className="flex gap-2 flex-wrap">
                 <Button onClick={handleFetchData} disabled={isLoading}>
                    {isLoading ? translations.performancePage.loadingButton : translations.performancePage.reportButton}
                 </Button>
                 <Button onClick={() => handleShowChart('bar')} variant={activeChart === 'bar' ? 'secondary' : 'outline'} disabled={!hasFetchedData || isLoading || tableData.length === 0}>
                    <BarChart /> {translations.performancePage.chartButton}
                 </Button>
                  <Button onClick={() => handleShowChart('pie')} variant={activeChart === 'pie' ? 'secondary' : 'outline'} disabled={!hasFetchedData || isLoading || tableData.length === 0}>
                    <PieChart /> {translations.performancePage.pieButton}
                  </Button>
               </div>
            </div>
        </div>
        
        <div className="bg-white p-4 rounded-b-lg border-l border-r border-b">
           {isLoading ? (
             <div className="text-center py-10 text-gray-500">{translations.performancePage.loadingData}</div>
           ) : hasFetchedData && tableData.length > 0 ? (
             <Table>
                <TableHeader>
                  <TableRow className="bg-gray-200 hover:bg-gray-200">
                    <TableHead className="font-bold text-gray-700">{translations.performancePage.table.consultant}</TableHead>
                    <TableHead className="font-bold text-gray-700">{translations.performancePage.table.period}</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">{translations.performancePage.table.netRevenue}</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">{translations.performancePage.table.fixedCost}</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">{translations.performancePage.table.commission}</TableHead>
                    <TableHead className="text-right font-bold text-gray-700">{translations.performancePage.table.profit}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((item) => {
                    const profit = item.netRevenue - (item.fixedCost + item.commission);
                    return (
                        <TableRow key={item.name}>
                            <TableCell className="font-medium text-blue-700">{item.name}</TableCell>
                            <TableCell>{format(date!.from!, 'MMMM yyyy', { locale: dateLocale })} - {format(date!.to!, 'MMMM yyyy', { locale: dateLocale })}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.netRevenue)}</TableCell>
                            <TableCell className="text-right text-red-500">{formatCurrency(item.fixedCost)}</TableCell>
                            <TableCell className="text-right text-orange-500">{formatCurrency(item.commission)}</TableCell>
                            <TableCell className={`text-right font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(profit)}</TableCell>
                        </TableRow>
                    )
                  })}
                  <TableRow className="bg-gray-200 font-bold">
                    <TableCell colSpan={2}>SALDO</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.netRevenue)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.commission)}</TableCell>
                    <TableCell className={`text-right ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totals.profit)}</TableCell>
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
                  {activeChart === 'bar' ? translations.performancePage.barChartTitle : translations.performancePage.pieChartTitle}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeChart === 'bar' && (
                  <PerformanceChart 
                    data={chartData} 
                    averageFixedCost={averageFixedCost}
                    formatCurrency={formatCurrency} 
                    translations={translations.performancePage.chartTranslations}
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
