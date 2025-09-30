'use server';
import { z } from 'zod';

/**
 * NOTA PARA EL DESARROLLADOR:
 * Este archivo ha sido modificado para obtener datos desde una API externa
 * en lugar de conectarse directamente a una base de datos.
 *
 * Debes reemplazar las URLs de ejemplo ('/api/...') con los
 * endpoints reales de tu backend en Laravel cuando estén listos.
 *
 * La lógica actual está simulada para devolver datos de ejemplo y que la UI no se rompa.
 */

// URL base de tu API de Laravel.
const API_BASE_URL = process.env.API_URL || 'https://lukn95yiioc6p6bmxebn4lf9-production--apps.builduo.com';

// Función auxiliar para manejar las llamadas a la API
async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error en la API [${response.status}] en ${endpoint}: ${errorText}`);
      throw new Error(`Error al contactar la API: ${response.statusText}`);
    }
    // Si la respuesta no tiene cuerpo (ej. en un 204 No Content), devolvemos un objeto vacío.
    const text = await response.text();
    return text ? JSON.parse(text) : {};

  } catch (error) {
    console.error(`Error de red o de fetch para el endpoint ${endpoint}:`, error);
    // Devuelve un array vacío o un objeto por defecto para que la UI no se rompa.
    return []; 
  }
}


export async function getConsultants() {
  /**
   * TODO: Reemplaza este endpoint con el real de tu API para obtener consultores.
   * La API debería devolver un array de objetos como:
   * [{ co_usuario: 'user1', no_usuario: 'Nombre Usuario 1' }, ...]
   */
  // const data = await fetchFromApi('/api/consultants');
  // return data as { co_usuario: string; no_usuario: string }[];
  
  // Datos de ejemplo mientras no hay API
  return [
      { co_usuario: 'agonzalez', no_usuario: 'Anabela Gonzalez' },
      { co_usuario: 'b.araujo', no_usuario: 'Benito Araujo' },
      { co_usuario: 'c.arruda', no_usuario: 'Carlos Arruda' },
      { co_usuario: 'c.viana', no_usuario: 'Carlos Viana' },
      { co_usuario: 'a.Azevedo', no_usuario: 'Aline de Azevedo' },
    ];
}

export async function getClients() {
  /**
   * TODO: Reemplaza este endpoint con el real de tu API para obtener clientes.
   * La API debería devolver un array de objetos como:
   * [{ value: 'cliente1', label: 'Nombre Cliente 1' }, ...]
   */
  // const data = await fetchFromApi('/api/clients');
  // return data as { label: string; value: string }[];
  
   // Datos de ejemplo mientras no hay API
  return [
    { value: 'cliente_a', label: 'Cliente A' },
    { value: 'cliente_b', label: 'Cliente B' },
    { value: 'cliente_c', label: 'Cliente C' },
    { value: 'cliente_d', label: 'Cliente D' },
    { value: 'cliente_e', label: 'Cliente E' },
  ];
}

const PerformanceRequestSchema = z.object({
  consultants: z.array(z.string()),
  clients: z.array(z.string()),
  from: z.date(),
  to: z.date(),
  reportType: z.enum(['consultant', 'client']),
});

export async function getPerformanceData(request: z.infer<typeof PerformanceRequestSchema>) {
  const validation = PerformanceRequestSchema.safeParse(request);
  if (!validation.success) {
    console.error('Invalid performance data request:', validation.error);
    throw new Error("Invalid request parameters.");
  }
  
  const { consultants, clients, from, to, reportType } = validation.data;
  
  /**
   * TODO: Reemplaza este endpoint con el real de tu API para obtener los datos de rendimiento.
   * Deberías enviar los filtros en el cuerpo de la petición (POST).
   *
   * const body = JSON.stringify({ consultants, clients, from, to, reportType });
   * const result = await fetchFromApi('/api/performance', { method: 'POST', body });
   *
   * La API debería devolver un objeto como:
   * {
   *   tableData: [{ name: 'Consultor', netRevenue: 1000, ... }],
   *   chartData: [{ name: 'Consultor', netRevenue: 1000, ... }],
   *   averageFixedCost: 500
   * }
   */
   
  console.log("Simulando obtención de datos de rendimiento para:", { consultants, clients, from, to, reportType });

  // Devolvemos datos vacíos para que la aplicación no se rompa mientras no hay API.
  return {
    tableData: [],
    chartData: [],
    averageFixedCost: 0,
  };
}
