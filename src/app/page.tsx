'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { MultiSelect, Option } from 'react-multi-select-component';
import PerformanceChart from '@/components/performance-chart';
import RevenuePieChart from '@/components/revenue-pie-chart';

// Datos de ejemplo
const consultantsData = [
  { co_usuario: 'agonzalez', no_usuario: 'Aguebo Gonzalez' },
  { co_usuario: 'bhurtado', no_usuario: 'Braulio Hurtado' },
  { co_usuario: 'cfaria', no_usuario: 'Carlos Faria' },
  { co_usuario: 'dvicente', no_usuario: 'David Vicente' },
];

const performanceData = [
  {
    name: 'Aguebo Gonzalez',
    netRevenue: 4000,
    fixedCost: 2400,
    commission: 1600,
  },
  {
    name: 'Braulio Hurtado',
    netRevenue: 3000,
    fixedCost: 1398,
    commission: 1602,
  },
  {
    name: 'Carlos Faria',
    netRevenue: 2000,
    fixedCost: 9800,
    commission: 200,
  },
  {
    name: 'David Vicente',
    netRevenue: 2780,
    fixedCost: 3908,
    commission: -1128,
  },
];

const consultantOptions: Option[] = consultantsData.map((c) => ({
  label: c.no_usuario,
  value: c.co_usuario,
}));

export default function Home() {
  const [selectedConsultants, setSelectedConsultants] = useState<Option[]>([]);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  });
  const [showChart, setShowChart] = useState<
    'bar' | 'pie' | 'none'
  >('none');
  
  const handleReportClick = () => {
    setShowChart('bar');
  };

  const handlePizzaClick = () => {
    setShowChart('pie');
  };

  const getFilteredData = () => {
    const selectedNames = selectedConsultants.map(c => c.label);
    return performanceData.filter(d => selectedNames.includes(d.name));
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const totalNetRevenue = getFilteredData().reduce((acc, curr) => acc + curr.netRevenue, 0);


  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-900 text-white p-4 flex items-center gap-4">
        <User className="h-8 w-8" />
        <h1 className="text-2xl font-bold">Desempenho de Consultores</h1>
      </header>
      <main className="flex-1 p-6 bg-gray-50">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Consultores
              </label>
              <MultiSelect
                options={consultantOptions}
                value={selectedConsultants}
                onChange={setSelectedConsultants}
                labelledBy="Selecione os consultores"
                overrideStrings={{
                  selectSomeItems: 'Selecione os consultores...',
                  allItemsAreSelected: 'Todos os consultores selecionados',
                  selectAll: 'Selecionar todos',
                  search: 'Buscar',
                }}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Período
              </label>
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
                    locale={{
                      localize: {
                        month: (n) => ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][n],
                        day: (n) => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][n],
                      },
                      formatLong: {},
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleReportClick} disabled={selectedConsultants.length === 0}>Relatório</Button>
              <Button onClick={handlePizzaClick} disabled={selectedConsultants.length === 0}>Pizza</Button>
            </div>
          </CardContent>
        </Card>

        {showChart !== 'none' && getFilteredData().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                {showChart === 'bar' ? 'Desempenho dos Consultores' : 'Participação na Receita Líquida'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showChart === 'bar' ? (
                <PerformanceChart data={getFilteredData()} formatCurrency={formatCurrency} />
              ) : (
                <div className="flex flex-col items-center">
                  <RevenuePieChart data={getFilteredData()} />
                  <p className="mt-4 text-lg font-semibold">
                    Receita Líquida Total: {formatCurrency(totalNetRevenue)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {showChart !== 'none' && getFilteredData().length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
                Selecione pelo menos um consultor para visualizar os dados.
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
