# AnimeHub Web

AnimeHub Web será la superficie pública para descubrir anime y episodios, acompañada por una API central consumida también por AnimeHub Desktop. Este repositorio nace como una reconstrucción desde cero: el proyecto anterior sirve únicamente como antecedente conceptual y no comparte código ni historial.

> **Estado:** scaffold ejecutable. Solo existen una portada técnica, health checks y documentación OpenAPI; todavía no hay catálogo, scraping, cuentas, biblioteca ni descargas.

## Dos productos, un contrato

- **AnimeHub Web** ofrece catálogo público sin cuentas y operaciones de descarga iniciadas deliberadamente en el navegador.
- **AnimeHub Desktop** será una aplicación nativa Qt para biblioteca local, reproducción externa y administración de descargas.
- Ambos consumen la misma API REST alojada. El scraper pertenece exclusivamente al servidor: no se duplicará en C++.

## Stack

- Node.js 24.13.0 y pnpm 11.20.0
- Next.js 16.3.0, React 19.2.8, TypeScript 5.9 y App Router
- HeroUI 3.2.3 y Tailwind CSS 4.3.3
- NestJS 11.1.28 sobre Fastify
- Prisma 7.9.1 y PostgreSQL 18
- Redis declarado para caché futura, pero opcional en este estado
- Vitest, Jest, ESLint y Prettier

## Estructura

```text
apps/
  web/   Aplicación Next.js
  api/   API NestJS, contrato OpenAPI y Prisma
compose.yaml
```

Es un workspace pnpm deliberadamente simple, sin Nx ni Turborepo.

## Requisitos

- Node.js 24
- Corepack y pnpm 11.20.0
- PostgreSQL local, o Docker con Compose

```powershell
corepack enable
corepack prepare pnpm@11.20.0 --activate
pnpm install --frozen-lockfile
Copy-Item .env.example apps/api/.env
```

Edita `apps/api/.env` con una URL de PostgreSQL válida. Los archivos `.env` están ignorados y nunca deben versionarse.

## Desarrollo

```powershell
pnpm prisma:validate
pnpm prisma:generate
pnpm dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:8000/api/v1`
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/docs-json`

Comprobaciones disponibles:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @animehub/api test:e2e
pnpm build
```

## Contenedores y Coolify

```powershell
docker compose config
docker compose up --build
```

Compose publica PostgreSQL en `55432` y Redis en `56379` para no competir con instalaciones locales en `5432` y `6379`. Redis solo se inicia con `docker compose --profile cache up`. Los Dockerfiles de `apps/web` y `apps/api` pueden configurarse como recursos separados en Coolify; no se realiza ningún despliegue desde este repositorio.

## Variables públicas

| Variable              | Uso                                          |
| --------------------- | -------------------------------------------- |
| `PORT`                | Puerto HTTP del API                          |
| `DATABASE_URL`        | Conexión PostgreSQL del API                  |
| `REDIS_URL`           | Caché futura; no se conecta todavía          |
| `CORS_ORIGINS`        | Orígenes web permitidos, separados por comas |
| `NEXT_PUBLIC_API_URL` | Base pública del API utilizada por Next.js   |

## Arquitectura objetivo

AnimeAV1 será la única fuente inicial. El servidor hará el scraping, normalizará los datos y publicará REST/OpenAPI bajo `/api/v1`. La web no tendrá cuentas. Click'n'Load y MyJDownloader se ejecutarán desde el navegador; cualquier secreto de MyJDownloader existirá únicamente durante la sesión y nunca llegará al servidor.

El escritorio usará la API alojada con caché offline y conservará su biblioteca personal en SQLite local. Sus estados personales serán colecciones reconstruibles, no carpetas físicas. MEGA y Pixeldrain serán los proveedores nativos iniciales, aria2 manejará HTTP y JDownloader seguirá como integración opcional local o remota.

## Roadmap

1. Diseñar el contrato de catálogo y el modelo de datos del servidor.
2. Implementar el scraper de AnimeAV1 y una caché Redis tolerante a fallos.
3. Construir la experiencia pública de descubrimiento sin autenticación.
4. Añadir Click'n'Load y MyJDownloader exclusivamente en el cliente web.
5. Integrar el mismo contrato en AnimeHub Desktop.

Las notificaciones de episodios estarán activadas por defecto en Desktop; la descarga automática será configurable por anime. La reproducción se delegará a una aplicación externa.

## Licencia

AnimeHub Web se distribuye bajo [GNU AGPL v3 o posterior](LICENSE).
