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
    {
        name: 'Braulio Hurtado',
        client: 'Toyota do Brasil',
        system: 'Fleet Control',
        os: 'Manutenção',
        nf: '373698',
        emission: '2007-01-28',
        total: 1200.00,
        liquid: 1100.00,
        commissionPercentage: 8,
        fixedCost: 2000,
        status: 'NF Paga',
    }
];


export async function getConsultants() {
  // Simula: SELECT u.co_usuario, u.no_usuario FROM cao_usuario u JOIN ...
  return consultantsData;
}

export async function getClients() {
  const clientNames = performanceData.map(d => d.client);
  const uniqueClientNames = [...new Set(clientNames)];
  return uniqueClientNames.map(name => ({ label: name, value: name }));
}


const PerformanceRequestSchema = z.object({
  consultants: z.array(z.string()),
  clients: z.array(z.string()),
  from: z.date(),
  to: z.date(),
  reportType: z.enum(['consultant', 'client']),
}).refine(data => data.consultants.length > 0 || data.clients.length > 0, {
    message: "Debe seleccionar al menos un consultor o un cliente.",
});


export async function getPerformanceData(request: z.infer<typeof PerformanceRequestSchema>) {
    const validation = PerformanceRequestSchema.safeParse(request);
    if (!validation.success) {
        console.error("Invalid request to getPerformanceData:", validation.error.flatten());
        throw new Error("Solicitud inválida. Faltan parámetros o son incorrectos.");
    }

    const { consultants, clients, from, to, reportType } = validation.data;
    
    const filteredRawData = performanceData.filter(d => {
        const emissionDate = new Date(d.emission);
        const isDateInRange = emissionDate >= from && emissionDate <= to;
        
        const isConsultantSelected = consultants.length === 0 || consultants.includes(d.name);
        const isClientSelected = clients.length === 0 || clients.includes(d.client);
        
        return isDateInRange && isConsultantSelected && isClientSelected;
    });

    const processedData = new Map<string, { netRevenue: number; fixedCost: number; commission: number; name: string }>();

    filteredRawData.forEach(item => {
        const key = reportType === 'consultant' ? item.name : item.client;
        const commissionValue = item.liquid * (item.commissionPercentage / 100);

        if (!processedData.has(key)) {
            processedData.set(key, {
                name: key,
                netRevenue: 0,
                // El costo fijo es por consultor, así que solo lo asignamos si el reporte es por consultor
                fixedCost: reportType === 'consultant' ? item.fixedCost : 0, 
                commission: 0,
            });
        }

        const entry = processedData.get(key)!;
        entry.netRevenue += item.liquid;
        entry.commission += commissionValue;
        
        // Si el reporte es por cliente, acumulamos los costos fijos de los consultores involucrados
        if (reportType === 'client') {
             // Esto es una simplificación. Si varios consultores trabajan para un cliente,
             // podríamos querer sumar sus costos fijos. O no. Por ahora, lo dejamos en 0.
             // Para un cálculo más preciso, la lógica de negocio debe ser definida.
             // Por simplicidad, el costo fijo solo tiene sentido real en la vista por consultor.
        }
    });
    
    const tableData = Array.from(processedData.values());
    
    let relevantNames: string[];
    if (reportType === 'consultant') {
        relevantNames = consultants.length > 0 ? consultants : tableData.map(d => d.name);
    } else { // client
        relevantNames = clients.length > 0 ? clients : tableData.map(d => d.name);
    }


    const chartData = relevantNames.map(name => {
        const data = processedData.get(name);
        if (data) {
            return data;
        }
        // Si una entidad seleccionada (consultor/cliente) no tiene datos, devolver ceros.
        if (reportType === 'consultant') {
            const fixedCost = performanceData.find(p => p.name === name)?.fixedCost || 0;
            return { name, netRevenue: 0, commission: 0, fixedCost };
        } else {
            return { name, netRevenue: 0, commission: 0, fixedCost: 0 };
        }
    }).filter(Boolean) as { name: string; netRevenue: number; fixedCost: number; commission: number; }[];


    const totalFixedCost = chartData.reduce((sum, item) => sum + item.fixedCost, 0);
    const averageFixedCost = reportType === 'consultant' && chartData.length > 0 
        ? totalFixedCost / chartData.length 
        : 0;

    return {
        tableData: tableData,
        chartData,
        averageFixedCost,
    };
}
