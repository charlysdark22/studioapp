# Guía para Crear el Backend en NestJS para el Panel de Desempeño

Este documento proporciona una guía paso a paso para construir un backend robusto con [NestJS](https://nestjs.com/). Este backend se encargará de conectarse a una base de datos PostgreSQL, cargar tus datos desde un archivo `.sql` y exponer una API para que la aplicación frontend (Next.js) pueda consumir la información.

---

## 1. Prerrequisitos

Antes de comenzar, asegúrate de tener instalado el siguiente software en tu computadora:

- **[Node.js](https://nodejs.org/en/)**: (Versión 18 o superior)
- **[Docker](https://www.docker.com/products/docker-desktop/)**: Para levantar una base de datos PostgreSQL de forma sencilla y aislada.
- **Un cliente de SQL (Recomendado)**: Como [DBeaver](https://dbeaver.io/) o [pgAdmin](https://www.pgadmin.org/download/) para gestionar la base de datos e importar tu archivo `.sql`.
- **[NestJS CLI](https://docs.nestjs.com/cli/overview)**: Lo instalaremos en los siguientes pasos.

---

## 2. Levantar la Base de Datos con Docker

Usar Docker es la forma más fácil de tener una base de datos PostgreSQL corriendo localmente sin necesidad de instalarla directamente en tu sistema operativo.

1.  **Crea un archivo `docker-compose.yml`** en una carpeta de tu elección con el siguiente contenido:

    ```yaml
    version: '3.8'
    services:
      postgres:
        image: postgres:15
        container_name: performance_db
        restart: always
        ports:
          - "5432:5432"
        environment:
          - POSTGRES_USER=myuser
          - POSTGRES_PASSWORD=mypassword
          - POSTGRES_DB=performancedb
        volumes:
          - postgres_data:/var/lib/postgresql/data

    volumes:
      postgres_data:
    ```

2.  **Inicia el contenedor:** Abre una terminal en la misma carpeta donde creaste el archivo y ejecuta:

    ```bash
    docker-compose up -d
    ```

    Esto descargará la imagen de PostgreSQL y la iniciará. ¡Ya tienes una base de datos corriendo en tu máquina!

---

## 3. Cargar tu Archivo `.sql`

Ahora que la base de datos está activa, necesitas cargar tus tablas y datos.

1.  **Conéctate a la base de datos** usando tu cliente de SQL (DBeaver, pgAdmin, etc.) con los siguientes datos:
    - **Host**: `localhost`
    - **Puerto**: `5432`
    - **Base de datos**: `performancedb`
    - **Usuario**: `myuser`
    - **Contraseña**: `mypassword`

2.  **Ejecuta tu script SQL:** Abre tu archivo `.sql` en el cliente, selecciónalo por completo y ejecútalo. Esto creará todas las tablas (`cao_usuario`, `cao_fatura`, etc.) y las llenará con los datos.

---

## 4. Crear el Proyecto de Backend en NestJS

1.  **Instala la CLI de NestJS** de forma global:

    ```bash
    npm install -g @nestjs/cli
    ```

2.  **Crea un nuevo proyecto NestJS:**

    ```bash
    nest new performance-backend
    ```
    Cuando te pregunte qué gestor de paquetes prefieres, elige `npm`.

3.  **Navega al directorio del proyecto:**

    ```bash
    cd performance-backend
    ```

4.  **Instala las dependencias necesarias** para la base de datos:

    ```bash
    npm install @nestjs/typeorm typeorm pg
    ```

---

## 5. Configurar la Conexión a la Base de Datos

1.  **Abre el archivo `src/app.module.ts`** y configúralo para que se conecte a la base de datos. Reemplaza su contenido con esto:

    ```typescript
    import { Module } from '@nestjs/common';
    import { TypeOrmModule } from '@nestjs/typeorm';
    import { AppController } from './app.controller';
    import { AppService } from './app.service';

    @Module({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'myuser',
          password: 'mypassword',
          database: 'performancedb',
          autoLoadEntities: true, // Carga automáticamente las entidades
          synchronize: false, // IMPORTANTE: false para no sobrescribir tus tablas
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    })
    export class AppModule {}
    ```

---

## 6. Crear los Endpoints de la API

Ahora, vamos a crear el código que leerá de la base de datos y lo expondrá en la API.

1.  **Reemplaza el contenido de `src/app.controller.ts`** con lo siguiente. Este código inyecta el servicio de TypeORM y define las rutas (`/consultants`, `/clients`, etc.).

    ```typescript
    import { Controller, Get, Post, Body } from '@nestjs/common';
    import { AppService } from './app.service';

    // DTO para validar el cuerpo de la petición de rendimiento
    class PerformanceRequestDto {
      consultants: string[];
      clients: string[];
      from: Date;
      to: Date;
      reportType: 'consultant' | 'client';
    }

    @Controller('api') // Prefijo para todas las rutas: /api/...
    export class AppController {
      constructor(private readonly appService: AppService) {}

      @Get('consultants')
      getConsultants() {
        return this.appService.getConsultants();
      }

      @Get('clients')
      getClients() {
        return this.appService.getClients();
      }
      
      @Post('performance')
      getPerformanceData(@Body() performanceRequest: PerformanceRequestDto) {
        return this.appService.getPerformanceData(performanceRequest);
      }
    }
    ```

2.  **Reemplaza el contenido de `src/app.service.ts`** con el siguiente código. Aquí es donde se escriben las consultas SQL.

    ```typescript
    import { Injectable } from '@nestjs/common';
    import { InjectDataSource } from '@nestjs/typeorm';
    import { DataSource } from 'typeorm';

    // DTO (Data Transfer Object) para tipar el cuerpo de la petición
    class PerformanceRequestDto {
      consultants: string[];
      clients: string[];
      from: Date;
      to: Date;
      reportType: 'consultant' | 'client';
    }

    @Injectable()
    export class AppService {
      constructor(@InjectDataSource() private dataSource: DataSource) {}

      async getConsultants(): Promise<any[]> {
        // Ejecuta una consulta SQL nativa para obtener los consultores
        return this.dataSource.query(`
          SELECT u.co_usuario, u.no_usuario
          FROM cao_usuario u
          INNER JOIN permissao_sistema p ON u.co_usuario = p.co_usuario
          WHERE p.co_sistema = 1 AND p.in_ativo = 'S' AND p.co_tipo_usuario IN (0, 1, 2);
        `);
      }

      async getClients(): Promise<any[]> {
         // Ejecuta una consulta SQL nativa para obtener los clientes
        return this.dataSource.query(`
          SELECT co_cliente as value, no_razao as label
          FROM cao_cliente
          ORDER BY no_razao ASC;
        `);
      }
      
      async getPerformanceData(request: PerformanceRequestDto): Promise<any> {
        const { consultants, from, to } = request;
        
        // Formatear fechas a YYYY-MM
        const fromMonth = new Date(from).getMonth() + 1;
        const fromYear = new Date(from).getFullYear();
        const toMonth = new Date(to).getMonth() + 1;
        const toYear = new Date(to).getFullYear();

        // Consulta principal
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
          WHERE
            os.co_usuario IN ($1) AND
            EXTRACT(YEAR FROM f.data_emissao) * 12 + EXTRACT(MONTH FROM f.data_emissao)
            BETWEEN ${fromYear * 12 + fromMonth} AND ${toYear * 12 + toMonth}
          GROUP BY u.no_usuario, s.brut_salario;
        `;
        
        const results = await this.dataSource.query(query, [consultants]);

        return {
          tableData: results,
          chartData: results,
          averageFixedCost: 0, // Puedes calcular esto si lo necesitas
        };
      }
    }
    ```

3. **Habilitar CORS** para que tu frontend pueda llamar a tu backend. Abre `src/main.ts` y añade `app.enableCors()`:

    ```typescript
    import { NestFactory } from '@nestjs/core';
    import { AppModule } from './app.module';

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);
      
      // Habilitar CORS
      app.enableCors();

      await app.listen(3001); // El backend correrá en el puerto 3001
    }
    bootstrap();
    ```

---

## 7. Ejecutar el Backend

¡Todo está listo! Para iniciar tu nuevo backend, ejecuta el siguiente comando en la terminal:

```bash
npm run start:dev
```

Tu backend estará corriendo en `http://localhost:3001`.

---

## 8. Conectar el Frontend al Nuevo Backend

Finalmente, ve a tu proyecto de frontend (el de Next.js) y modifica el archivo `src/app/actions.ts`. Cambia la variable `API_BASE_URL` para que apunte a tu nuevo backend local:

```typescript
// En src/app/actions.ts de tu proyecto frontend
const API_BASE_URL = 'http://localhost:3001/api'; 
```

¡Y eso es todo! Ahora tu aplicación Next.js obtendrá los datos directamente de tu backend NestJS, el cual a su vez los lee de tu base de datos PostgreSQL local.
