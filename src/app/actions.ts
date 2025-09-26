'use server';

import { z } from 'zod';

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
        emission: '2007-01-17',
        total: 3963.77,
        liquid: 3720.00,
        commissionPercentage: 10,
        fixedCost: 1500,
        status: 'NF Emitida',
    },
    {
        name: 'Aguebo Gonzalez',
        client: 'Toyota do Brasil',
        system: 'SOS',
        os: 'Upgrade de Performance',
        nf: '373628',
        emission: '2007-01-20',
        total: 2876.43,
        liquid: 2500.00,
        commissionPercentage: 10,
        fixedCost: 1500,
        status: 'NF Paga',
    },
    {
        name: 'Braulio Hurtado',
        client: 'Renault',
        system: 'SGV Compact',
        os: 'Desenvolvimento e Implantação',
        nf: '373610',
        emission: '2007-01-15',
        total: 3963.77,
        liquid: 3720.00,
        commissionPercentage: 8,
        fixedCost: 2000,
        status: 'NF Emitida',
    },
     {
        name: 'Carlos Faria',
        client: 'Nissan',
        system: 'CRM Integrado',
        os: 'Manutenção',
        nf: '373699',
        emission: '2007-01-25',
        total: 5500.00,
        liquid: 5100.00,
        commissionPercentage: 12,
        fixedCost: 1800,
        status: 'NF Paga',
    },
];


export async function getConsultants() {
  // Simula: SELECT u.co_usuario, u.no_usuario FROM cao_usuario u JOIN ...
  return consultantsData;
}

const PerformanceRequestSchema = z.object({
  consultants: z.array(z.string()),
  from: z.date(),
  to: z.date(),
});

export async function getPerformanceData(request: z.infer<typeof PerformanceRequestSchema>) {
    const validation = PerformanceRequestSchema.safeParse(request);
    if (!validation.success) {
        // En un caso real, loggearíamos validation.error para depuración
        console.error("Invalid request to getPerformanceData:", validation.error.flatten());
        throw new Error("Solicitud inválida. Faltan parámetros o son incorrectos.");
    }

    const { consultants, from, to } = validation.data;
    
    // 1. Filtrar datos por consultores y rango de fechas
    const filteredRawData = performanceData.filter(d => {
        const emissionDate = new Date(d.emission);
        const isConsultantSelected = consultants.includes(d.name);
        const isDateInRange = emissionDate >= from && emissionDate <= to;
        return isConsultantSelected && isDateInRange;
    });

    // 2. Procesar datos para la tabla
    const tableData = filteredRawData.map(item => ({
        ...item,
        // (VALOR – (VALOR*TOTAL_IMP_INC))*COMISSAO_CN 
        // Asumiendo que 'liquid' es (VALOR - IMPUESTOS) y 'commissionPercentage' es COMISSAO_CN
        commission: item.liquid * (item.commissionPercentage / 100)
    }));
    
    // 3. Procesar datos para los gráficos y la tabla de resumen
    const chartData = consultants.map(name => {
        const consultantData = tableData.filter(d => d.name === name);
        
        const netRevenue = consultantData.reduce((sum, item) => sum + item.liquid, 0);
        const commission = consultantData.reduce((sum, item) => sum + item.commission, 0);
        const fixedCost = consultantData.length > 0 ? consultantData[0].fixedCost : 0; // Usar el costo fijo del consultor
        
        return { name, netRevenue, commission, fixedCost };
    });

    // 4. Calcular costo fijo medio de los consultores seleccionados
    const totalFixedCost = chartData.reduce((sum, item) => sum + item.fixedCost, 0);
    const averageFixedCost = consultants.length > 0 ? totalFixedCost / consultants.length : 0;

    return {
        tableData: chartData, // Devolver los datos ya agregados
        chartData,
        averageFixedCost,
    };
}