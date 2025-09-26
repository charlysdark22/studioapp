'use client';

import React, { useState } from 'react';
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
import { CalendarIcon, Briefcase, User, PieChart, BarChart, LogOut, FileText, Building, ShoppingCart, DollarSign, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { MultiSelect, Option } from 'react-multi-select-component';
import PerformanceChart from '@/components/performance-chart';
import RevenuePieChart from '@/components/revenue-pie-chart';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

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
    client: 'Toyota do Brasil',
    system: 'Fleet Control',
    os: 'Desenvolvimento e Implantação',
    nf: '373627',
    emission: '17/01/2007',
    total: 3963.77,
    liquid: 3720.00,
    commission: 243.77,
    status: 'NF Emitida',
  },
  {
    name: 'Aguebo Gonzalez',
    client: 'Toyota do Brasil',
    system: 'SOS',
    os: 'Upgrade de Performance',
    nf: '373628',
    emission: '17/01/2007',
    total: 2876.43,
    liquid: 1500.00,
    commission: 1376.43,
    status: 'NF Paga',
  },
  {
    name: 'Braulio Hurtado',
    client: 'Renault',
    system: 'SGV Compact',
    os: 'Desenvolvimento e Implantação',
    nf: '373610',
    emission: '17/01/2007',
    total: 3963.77,
    liquid: 3720.00,
    commission: 243.77,
    status: 'NF Emitida',
  },
];


const consultantOptions: Option[] = consultantsData.map((c) => ({
  label: c.no_usuario,
  value: c.co_usuario,
}));

export default function Home() {
  const [selectedConsultants, setSelectedConsultants] = useState<Option[]>([]);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2007, 0, 1),
    to: new Date(2007, 0, 31),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  const getFilteredData = () => {
    if (selectedConsultants.length === 0) return [];
    const selectedNames = selectedConsultants.map(c => c.label);
    return performanceData.filter(d => selectedNames.includes(d.name));
  }

  const filteredData = getFilteredData();

  const totals = filteredData.reduce((acc, curr) => {
    acc.total += curr.total;
    acc.liquid += curr.liquid;
    acc.commission += curr.commission;
    return acc;
  }, { total: 0, liquid: 0, commission: 0 });

  const groupedData = filteredData.reduce((acc, item) => {
    (acc[item.client] = acc[item.client] || []).push(item);
    return acc;
  }, {} as Record<string, typeof filteredData>);


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-2">
           <div className="flex justify-between items-center">
              <div>
                  <p className="text-sm text-gray-600">Boa tarde Carlos. Você está em Consulta Comissões CN</p>
                  <nav className="flex items-center gap-4 mt-2">
                      <a href="#" className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"><Building size={16} /> Agence</a>
                      <a href="#" className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"><FileText size={16} /> Projetos</a>
                      <a href="#" className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"><Briefcase size={16} /> Administrativo</a>
                      <a href="#" className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"><ShoppingCart size={16} /> Comercial</a>
                      <a href="#" className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"><DollarSign size={16} /> Financeiro</a>
                      <a href="#" className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"><User size={16} /> Usuário</a>
                      <a href="#" className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"><LogOut size={16} /> Sair</a>
                  </nav>
              </div>
              <div className="text-2xl font-bold text-gray-700">
                  Agence
              </div>
           </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
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
               <Button disabled={selectedConsultants.length === 0}>Consultar</Button>
            </div>
        </div>
        
        <div className="bg-white p-4 rounded-b-lg border-l border-r border-b">
           {selectedConsultants.length > 0 && filteredData.length > 0 ? (
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
                            <TableCell>{item.emission}</TableCell>
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
               {selectedConsultants.length > 0 ? "Nenhum dado encontrado para os consultores selecionados." : "Por favor, selecione um ou mais consultores para ver os resultados."}
             </div>
           )}
        </div>
         <div className="flex justify-end mt-4">
             <Button variant="outline">Atualizar</Button>
         </div>
      </main>
    </div>
  );
}
