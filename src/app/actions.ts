'use server';

import { z } from 'zod';

// Datos de ejemplo
const consultantsData = [
  { co_usuario: 'agonzalez', no_usuario: 'Aguebo Gonzalez' },
  { co_usuario: 'alessandro.yamada', no_usuario: 'alessandro.yamada' },
  { co_usuario: 'bhurtado', no_usuario: 'Braulio Hurtado' },
  { co_usuario: 'carlos.arruda', no_usuario: 'carlos.arruda' },
  { co_usuario: 'carlos.faria', no_usuario: 'Carlos Faria' },
  { co_usuario: 'carlos.viana', no_usuario: 'carlos.viana' },
  { co_usuario: 'cristiane.florio', no_usuario: 'cristiane.florio' },
  { co_usuario: 'cyntia.nakamura', no_usuario: 'cyntia.nakamura' },
  { co_usuario: 'daniel.braga', no_usuario: 'daniel.braga' },
  { co_usuario: 'denis.santos', no_usuario: 'denis.santos' },
  { co_usuario: 'dvicente', no_usuario: 'David Vicente' },
  { co_usuario: 'eduardo.botelho', no_usuario: 'eduardo.botelho' },
  { co_usuario: 'edy.bruno', no_usuario: 'edy.bruno' },
  { co_usuario: 'fabio.stevanelli', no_usuario: 'fabio.stevanelli' },
  { co_usuario: 'frederico.zapelini', no_usuario: 'frederico.zapelini' },
  { co_usuario: 'gustavo.gomes', no_usuario: 'gustavo.gomes' },
  { co_usuario: 'jesliel.rocha', no_usuario: 'jesliel.rocha' },
  { co_usuario: 'marco.malaquias', no_usuario: 'marco.malaquias' },
  { co_usuario: 'mauricio.costa', no_usuario: 'mauricio.costa' },
  { co_usuario: 'nivaldo.junior', no_usuario: 'nivaldo.junior' },
  { co_usuario: 'nixon.santos', no_usuario: 'nixon.santos' },
  { co_usuario: 'ricardo.martins', no_usuario: 'ricardo.martins' },
  { co_usuario: 'ricardo.rubini', no_usuario: 'ricardo.rubini' },
  { co_usuario: 'rodrigo.moralles', no_usuario: 'rodrigo.moralles' },
  { co_usuario: 'rodrigo.oliveira', no_usuario: 'rodrigo.oliveira' },
  { co_usuario: 'rodrigo.sousa', no_usuario: 'rodrigo.sousa' },
  { co_usuario: 'rui.hayashi', no_usuario: 'rui.hayashi' }
];

const performanceData: any[] = [];


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
}).refine(data => {
    if (data.reportType === 'consultant') {
        return data.consultants.length > 0;
    }
    if (data.reportType === 'client') {
        return data.clients.length > 0;
    }
    return false;
}, {
    message: "Debe seleccionar al menos un consultor o un cliente.",
});


export async function getPerformanceData(request: z.infer<typeof PerformanceRequestSchema>) {
    const validation = PerformanceRequestSchema.safeParse(request);
    if (!validation.success) {
        // Devuelve un error más específico para la UI
        throw new Error("Por favor, seleccione al menos una opción para el reporte.");
    }

    // Como no hay datos de rendimiento, devolvemos una estructura vacía.
    // En un futuro, aquí se haría la consulta a la base de datos real.
    return {
        tableData: [],
        chartData: [],
        averageFixedCost: 0,
    };
}
