'use server';
import { Pool } from 'pg';
import { z } from 'zod';

const connectionString = process.env.DATABASE_URL;

let pool: Pool | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
  });
} else {
  console.error(
    'DATABASE_URL environment variable is not set. Please create a .env file with your PostgreSQL connection string.'
  );
}

async function getClient() {
  if (!pool) {
    throw new Error('Database connection pool is not available. Please check your DATABASE_URL environment variable.');
  }
  const client = await pool.connect();
  return client;
}

export async function getConsultants() {
  if (!pool) return [];
  try {
    const client = await getClient();
    try {
      const res = await client.query(
        "SELECT co_usuario, no_usuario FROM cao_usuario WHERE co_tipo_usuario IN (0, 1, 2) ORDER BY no_usuario"
      );
      return res.rows as { co_usuario: string; no_usuario: string }[];
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching consultants:', error);
    return [];
  }
}

export async function getClients() {
  if (!pool) return [];
  try {
    const client = await getClient();
    try {
      const res = await client.query(
        "SELECT no_fantasia, co_cliente FROM cao_cliente ORDER BY no_fantasia"
      );
      const clients = res.rows.map(row => ({
        label: row.no_fantasia,
        value: row.co_cliente,
      }));
      return clients;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}

const PerformanceRequestSchema = z.object({
  consultants: z.array(z.string()),
  clients: z.array(z.string()),
  from: z.date(),
  to: z.date(),
});

export async function getPerformanceData(request: z.infer<typeof PerformanceRequestSchema>) {
  if (!pool) {
    return {
      tableData: [],
      chartData: [],
      averageFixedCost: 0,
    };
  }

  const validation = PerformanceRequestSchema.safeParse(request);
  if (!validation.success) {
    console.error('Invalid performance data request:', validation.error);
    throw new Error("Invalid request parameters.");
  }

  const { consultants, clients, from, to } = validation.data;

  const fromDate = from.toISOString().split('T')[0];
  const toDate = to.toISOString().split('T')[0];

  try {
    const dbClient = await getClient();
    try {
      const query = `
        SELECT
          u.no_usuario as name,
          SUM(f.valor - (f.valor * f.total_imp_inc / 100)) as "netRevenue",
          s.brut_salario as "fixedCost",
          SUM((f.valor - (f.valor * f.total_imp_inc / 100)) * f.comissao_cn / 100) as commission
        FROM cao_fatura f
        JOIN cao_os os ON f.co_os = os.co_os
        JOIN cao_usuario u ON os.co_usuario = u.co_usuario
        LEFT JOIN cao_salario s ON u.co_usuario = s.co_usuario
        WHERE f.data_emissao BETWEEN $1 AND $2
          AND u.co_usuario = ANY($3::text[])
          AND f.co_cliente = ANY($4::text[])
        GROUP BY u.no_usuario, s.brut_salario
        ORDER BY u.no_usuario;
      `;

      const params = [fromDate, toDate, consultants, clients];
      const res = await dbClient.query(query, params);

      const tableData = res.rows.map(row => ({
        name: row.name,
        netRevenue: parseFloat(row.netRevenue) || 0,
        fixedCost: parseFloat(row.fixedCost) || 0,
        commission: parseFloat(row.commission) || 0,
      }));

      const chartData = tableData.map(item => ({
        name: item.name,
        netRevenue: item.netRevenue,
        commission: item.commission,
        fixedCost: item.fixedCost,
      }));

      const totalFixedCost = tableData.reduce((acc, curr) => acc + (curr.fixedCost || 0), 0);
      const averageFixedCost = tableData.length > 0 ? totalFixedCost / tableData.length : 0;
      
      return {
        tableData,
        chartData,
        averageFixedCost,
      };
    } finally {
      dbClient.release();
    }
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return {
      tableData: [],
      chartData: [],
      averageFixedCost: 0,
    };
  }
}
