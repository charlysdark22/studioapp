'use server';
import mysql from 'mysql2/promise';
import { z } from 'zod';

// Configuración de la conexión a la base de datos
// Lee las credenciales desde las variables de entorno (archivo .env)
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

async function getConnection() {
  const connection = await mysql.createConnection(dbConfig);
  return connection;
}


export async function getConsultants() {
  const connection = await getConnection();
  try {
    // IMPORTANTE: Reemplaza esta consulta con tu consulta real para obtener los consultores.
    // Asegúrate de seleccionar las columnas 'co_usuario' y 'no_usuario'.
    const [rows] = await connection.execute(
      "SELECT co_usuario, no_usuario FROM cao_usuario WHERE co_tipo_usuario IN (0, 1, 2)"
    );
    return rows as { co_usuario: string; no_usuario: string }[];
  } catch (error) {
    console.error('Error fetching consultants:', error);
    return [];
  } finally {
    await connection.end();
  }
}

export async function getClients() {
    const connection = await getConnection();
    try {
        // IMPORTANTE: Reemplaza esta consulta con tu consulta real para obtener los clientes.
        // La consulta debe devolver una lista de nombres de clientes únicos.
        const [rows] = await connection.execute(
            "SELECT DISTINCT no_fantasia FROM cao_cliente"
        );
        
        // Asumimos que la columna se llama 'no_fantasia'. Ajusta si es diferente.
        const clients = (rows as { no_fantasia: string }[]).map(row => ({
            label: row.no_fantasia,
            value: row.no_fantasia,
        }));
        
        return clients;
    } catch (error) {
        console.error('Error fetching clients:', error);
        return [];
    } finally {
        await connection.end();
    }
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
        throw new Error("Invalid request parameters.");
    }
    
    const { consultants, clients, from, to, reportType } = validation.data;

    const fromDate = from.toISOString().split('T')[0];
    const toDate = to.toISOString().split('T')[0];
    
    const connection = await getConnection();
    try {
        // IMPORTANTE: Esta es una consulta de EJEMPLO.
        // Deberás construir una consulta compleja que una las tablas:
        // cao_fatura, cao_os, cao_salario y cao_usuario
        // para calcular los datos de rendimiento.
        
        let query = `
            SELECT 
                ${reportType === 'consultant' ? 'u.no_usuario as name' : 'c.no_fantasia as name'},
                SUM(f.valor - (f.valor * f.total_imp_inc / 100)) AS netRevenue,
                ${reportType === 'consultant' ? 's.brut_salario AS fixedCost' : '0 as fixedCost'},
                SUM((f.valor - (f.valor * f.total_imp_inc / 100)) * f.comissao_cn / 100) AS commission
            FROM cao_fatura f
            JOIN cao_os os ON f.co_os = os.co_os
            JOIN cao_usuario u ON os.co_usuario = u.co_usuario
            JOIN cao_cliente c ON f.co_cliente = c.co_cliente
            LEFT JOIN cao_salario s ON u.co_usuario = s.co_usuario
            WHERE f.data_emissao BETWEEN ? AND ?
        `;

        const params: (string | string[])[] = [fromDate, toDate];

        if (reportType === 'consultant' && consultants.length > 0) {
            query += ` AND u.no_usuario IN (?)`;
            params.push(consultants);
        }

        if (reportType === 'client' && clients.length > 0) {
            query += ` AND c.no_fantasia IN (?)`;
            params.push(clients);
        }

        query += ` GROUP BY name ${reportType === 'consultant' ? ', s.brut_salario' : ''}`;
        
        const [rows] = await connection.execute(query, params);

        const tableData = (rows as any[]).map(row => ({
            name: row.name,
            netRevenue: parseFloat(row.netRevenue) || 0,
            fixedCost: parseFloat(row.fixedCost) || 0,
            commission: parseFloat(row.commission) || 0,
        }));
        
        const chartData = tableData.map(item => ({
            name: item.name,
            netRevenue: item.netRevenue,
            fixedCost: item.fixedCost,
            commission: item.commission,
        }));

        // El cálculo del costo fijo promedio es complejo y depende de la lógica de negocio.
        // Por ahora, se deja en 0.
        const averageFixedCost = 0;

        return {
            tableData,
            chartData,
            averageFixedCost,
        };

    } catch (error) {
        console.error("Error fetching performance data:", error);
        throw new Error('Failed to fetch performance data from the database.');
    } finally {
        await connection.end();
    }
}
