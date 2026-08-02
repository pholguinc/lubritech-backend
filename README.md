# Lubritech Backend API

Lubritech es un sistema integral de gestión para talleres de lubricantes, servicios automotrices y venta de repuestos. Este backend está desarrollado en **Node.js** con el framework **NestJS**, empleando **Prisma ORM** para la persistencia en PostgreSQL y **Redis** para optimización y caché.

## 📐 Arquitectura y Funcionamiento

El backend de Lubritech sigue los principios de una arquitectura modular y en capas (Clean Architecture simplificada) promovida por NestJS:
- **Controladores (`controllers`)**: Gestionan el enrutamiento HTTP y validaciones de entrada (`class-validator`).
- **Servicios (`services`)**: Alojan la lógica de negocio, validaciones transaccionales y operaciones críticas.
- **Repositorios (`repositories`)**: Abstraen la capa de datos (Prisma), aislando las consultas a la base de datos de la lógica de negocio.
- **Módulos (`modules`)**: Encapsulan la lógica por dominio (Ventas, Compras, Clientes, Auth, etc.).

Además de esto, el sistema se apoya en **Puppeteer** y **Handlebars** para la generación dinámica de reportes y tickets en PDF, y se integra de forma externa (Scraping/APIs) para autocompletar información de DNI/RUC vía SUNAT/RENIEC.

### Diagrama de Arquitectura y Tecnologías

```mermaid
flowchart TD
    %% Nodos principales
    Client(["💻 Frontend / Cliente (React/Next.js)"])
    
    subgraph Backend ["Backend System (Node.js + NestJS)"]
        API["🌐 REST API (Controllers)"]
        Services["⚙️ Business Logic (Services)"]
        ORM["🗄️ Prisma ORM"]
        Puppeteer["🖨️ Puppeteer (Generación PDF)"]
        
        API <--> Services
        Services <--> ORM
        Services --> Puppeteer
    end

    subgraph Data ["Bases de Datos y Almacenamiento"]
        Postgres[("🐘 PostgreSQL (BD Principal)")]
        Redis[("⚡ Redis (Caché y Sesiones)")]
        S3[("☁️ AWS S3 (Archivos/Imágenes)")]
    end

    subgraph External ["Servicios Externos"]
        SUNAT["🏢 SUNAT / RENIEC (APIs/Scraping)"]
    end

    %% Conexiones externas
    Client <-->|HTTP/REST| API
    
    ORM <--> Postgres
    Services <--> Redis
    Services --> S3
    Services <--> SUNAT
```

---

## 🎭 Diagrama de Casos de Uso y Actores

```mermaid
flowchart LR
    %% Actores
    Admin(["🧑‍💻 Administrador"])
    Vendedor(["👨‍💼 Cajero / Vendedor"])
    Mecanico(["🔧 Técnico / Mecánico"])

    %% Casos de Uso
    subgraph Ventas ["Módulo de Ventas e Inventario"]
        direction TB
        UC1([Registrar Venta Directa])
        UC2([Generar Ticket de Venta PDF])
        UC3([Gestionar Productos/Categorías])
        UC4([Registrar Compras a Proveedores])
        UC5([Ver Movimientos Kardex])
    end

    subgraph Servicios ["Módulo de Servicios Automotrices"]
        direction TB
        UC6([Crear Orden de Servicio])
        UC7([Asignar Técnico/Placa])
        UC8([Facturar Orden de Servicio])
    end

    subgraph Reportes ["Reportes y Administración"]
        direction TB
        UC9([Ver Dashboard y KPIs])
        UC10([Administrar Usuarios y Accesos])
        UC11([Consultar DNI/RUC Externa])
    end

    %% Relaciones Vendedor
    Vendedor -.-> UC1
    Vendedor -.-> UC2
    Vendedor -.-> UC11

    %% Relaciones Mecánico
    Mecanico -.-> UC6
    Mecanico -.-> UC7

    %% Relaciones Administrador (Acceso Total)
    Admin ==> UC1
    Admin ==> UC3
    Admin ==> UC4
    Admin ==> UC5
    Admin ==> UC8
    Admin ==> UC9
    Admin ==> UC10
    Admin ==> UC11
```

---

## 🛠️ Requisitos de Instalación e Infraestructura

Para ejecutar el entorno en desarrollo o producción, es necesario contar con:

1. **Entorno de ejecución**: [Node.js](https://nodejs.org/en/) (v18 o superior) o [Bun](https://bun.sh/).
2. **Bases de datos**: 
   - **PostgreSQL**: Base de datos principal.
   - **Redis**: Caché de consultas, manejo de TTL para consultas externas.
3. **Almacenamiento**: Compatible con AWS S3 (AWS, MinIO, Cloudflare R2, etc.) para guardar evidencias e imágenes.
4. **Dependencias del Sistema**: Debido al uso de Puppeteer (impresión PDF), si se usa Linux/Docker, se requieren librerías gráficas (libxss1, libasound2, libatk-bridge2.0-0, etc.).

---

## 🚀 Instalación y Despliegue Local

1. Instalar dependencias (usando Bun o NPM):
   ```bash
   bun install
   ```

2. Configurar base de datos y generar Prisma Client:
   ```bash
   bunx prisma generate
   bunx prisma db push
   # Opcional: Ejecutar seeders
   bunx prisma db seed
   ```

3. Levantar la aplicación en modo desarrollo:
   ```bash
   bun run dev
   ```
   > El proyecto estará disponible por defecto en `http://localhost:3009/api/v1`

---

## 🔐 Variables de Entorno (.env)

Debes crear un archivo `.env` en la raíz del backend (puedes basarte en `.env.template`). A continuación se detallan las variables y su propósito:

| Variable | Descripción | Ejemplo / Notas |
|----------|-------------|-----------------|
| `FRONTEND_URL` | Origen de CORS permitido | `http://localhost:3000` |
| `NODE_ENV` | Entorno de despliegue | `development` / `production` |
| `PORT` | Puerto de escucha | `3009` |
| `SWAGGER_*` | Configuración de documentación OpenAPI | `/api/docs`, `Lubritech API` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (Prisma) | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_*` | Credenciales de conexión a Redis | Host, Port, Password, etc. |
| `RENIEC_*` | BD secundaria para validación Reniec interna| (Opcional, de legado) |
| `JWT_SECRET` | Llave firma para tokens de sesión | Clave larga y segura |
| `JWT_EXPIRES_IN` | Tiempo de expiración de sesión | `1d`, `12h` |
| `AWS_*` | Credenciales para Buckets S3 | Key, Secret, Endpoint, Bucket Name |
| `URL_SCRAPPING_SUNAT` | URL API de scraping para consultas RUC | (Servicio externo/propio) |
| `API_KEY_SCRAPPING_SUNAT` | Key para servicio scraping | - |
| `RENIEC_API_URL` | URL de API para consultas DNI | - |

---

## 📚 Estructura de Directorios

```text
src/
 ├── core/              # Filtros de excepción globales, guards, decoradores, DTOs de paginación
 ├── database/          # Configuración del cliente de Prisma y conexiones
 ├── assets/            # Archivos estáticos, plantillas HTML/Handlebars (ej: ticket.hbs)
 ├── modules/           # Lógica de la aplicación por dominio
 │    ├── auth/         # Autenticación, JWT, Login
 │    ├── sales/        # Módulo de Ventas, Ticket PDF, Detalles
 │    ├── purchases/    # Módulo de compras a proveedores
 │    ├── products/     # Inventario, control de stock, kardex
 │    ├── kpi-reports/  # Métricas, Dashboard, Ingresos
 │    ├── printer/      # Servicio de impresión PDF (Puppeteer)
 │    └── ...           # (Categorías, Clientes, Movimientos, External-Query, etc.)
 ├── app.module.ts      # Módulo raíz de NestJS
 └── main.ts            # Archivo de entrada de arranque (bootstrap)
```
