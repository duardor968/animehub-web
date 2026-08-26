# AnimeHub Web

AnimeHub Web es un catálogo público y anónimo de anime con una API REST compartida por la web y el futuro AnimeHub Desktop. AnimeAV1 es la única fuente inicial; el servidor interpreta sus datos JSON de SvelteKit, los valida y mantiene una proyección durable en PostgreSQL.

El proyecto es una reconstrucción independiente. `Anime downloader` permanece únicamente como antecedente conceptual: no se comparte código, historial ni artefactos.

## Estado

La v1 incluye:

- Portada editorial con episodios recientes, destacados y obras recién añadidas.
- Catálogo paginado, búsqueda, sugerencias, filtros y horario semanal estimado.
- Fichas con metadatos, relaciones explícitas y episodios paginados.
- Resolución de enlaces por episodio con preferencia SUB y fallback DUB.
- Lotes y series completas mediante trabajos por bloques en PostgreSQL (pg-boss) con progreso continuo.
- Envío desde el navegador a Click'n'Load o MyJDownloader, además de copia de enlaces.
- OpenAPI público como contrato único para Web y Desktop.

La interfaz usa una identidad oscura azul petróleo con azul como acción principal y turquesa reservado a estados puntuales. La portada incorpora un carrusel manual, los episodios se presentan con fotogramas reales y las descargas individuales se resuelven y envían en una sola acción, con progreso y resultado mediante el sistema de avisos de HeroUI.

No hay cuentas, biblioteca, seguimiento, reproducción, PWA, notificaciones ni panel administrativo.

## Web y Desktop

- **AnimeHub Web** se ocupa del descubrimiento público y de iniciar operaciones de descarga en el navegador.
- **AnimeHub Desktop** será una aplicación Qt nativa con biblioteca local, reproducción externa y motores de descarga propios.
- Ambos consumen la API alojada. El scraper pertenece exclusivamente al servidor y no se duplicará en C++.

## Stack

- Node.js 24.13.0 y pnpm 11.20.0
- Next.js 16.3.0, React 19.2.8, App Router y TypeScript 5.9
- HeroUI 3.2.3 y Tailwind CSS 4.3.3
- NestJS 11.1.28 sobre Fastify 5
- Prisma 7.9.1, PostgreSQL y pg-boss
- Vitest, Jest, Testing Library, ESLint y Prettier

El workspace pnpm mantiene solamente `apps/web` y `apps/api`, sin Nx ni Turborepo.

## Requisitos

- Node.js 24
- Corepack con pnpm 11.20.0
- PostgreSQL local

```powershell
corepack enable
corepack prepare pnpm@11.20.0 --activate
pnpm install --frozen-lockfile
Copy-Item .env.example apps/api/.env
```

Configura `DATABASE_URL` en `apps/api/.env`. Los archivos `.env` están ignorados y nunca deben versionarse.

## Desarrollo local

Aplica la migración y genera Prisma antes de iniciar ambos procesos:

```powershell
pnpm --filter @animehub/api exec prisma migrate deploy
pnpm prisma:generate
pnpm dev
```

`pnpm dev` inicia primero la API y espera a que su comprobación de readiness responda antes de levantar la Web. Así Next.js no sirve una página dependiente de la API durante el compilado inicial de Nest.

- Web: `http://localhost:3000`
- API: `http://localhost:8000/api/v1`
- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

Para trabajar con un único proceso:

```powershell
pnpm dev:web
pnpm dev:api
```

## Verificación

```powershell
pnpm prisma:validate
pnpm prisma:generate
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @animehub/api test:e2e
pnpm openapi:check
pnpm audit --audit-level high
pnpm build
```

La revisión visual se realiza exclusivamente en el Chrome visible del usuario, incluyendo los viewports de escritorio, tablet y móvil acordados. Este proyecto no utiliza Playwright.

## Arquitectura

### Fuente y proyección

La API consume únicamente endpoints JSON internos de SvelteKit y decodifica sus estructuras con `devalue`. Cada respuesta se valida antes de normalizarla; no se guardan HTML, scripts ni payloads crudos.

La proyección en PostgreSQL es perezosa y durable:

- Solo persiste contenido descubierto por solicitudes reales.
- Sirve la última copia mientras revalida datos vencidos.
- Un `404` explícito repetido marca una obra como no disponible sin borrar su historial.
- La frescura varía entre 15 minutos y 180 días según el recurso y su estabilidad.

### Descargas

La API devuelve enlaces estructurados por episodio, audio y proveedor. Los lotes se resuelven con pg-boss, hasta dos trabajos simultáneos y bloques internos de 50. Cada trabajo entrega un token de capacidad aleatorio; PostgreSQL conserva únicamente su hash.

Click'n'Load se comunica directamente con `127.0.0.1:9666`. MyJDownloader se ejecuta completamente en el navegador mediante un adaptador mínimo: la contraseña se descarta al derivar la sesión y ningún secreto llega a la API. Si Click'n'Load está bloqueado, la interfaz ofrece MyJDownloader o copiar enlaces.

La preferencia `confirmSingleEpisode` permite omitir el resumen únicamente para episodios individuales. Con independencia de esa preferencia, no existe un segundo paso entre resolver y enviar. Los rangos y las series completas mantienen un resumen previo, progreso continuo y resultados parciales.

### Contrato

Todas las respuestas de éxito usan `data` y `meta` cuando corresponde; los errores usan Problem Details. Las rutas públicas viven bajo `/api/v1`:

- `GET /health/live` y `GET /health/ready`
- `GET /home`
- `GET /catalog` y `GET /catalog/suggestions`
- `GET /anime/:slug` y `GET /anime/:slug/episodes`
- `GET /schedule`
- `POST /anime/:slug/downloads/resolve`
- `POST /anime/:slug/download-jobs`
- `GET /download-jobs/:id`
- `POST /download-jobs/:id/retry`
- `POST /download-jobs/:id/cancel`

`apps/api/openapi.json` es el contrato versionado. `apps/web/src/lib/api/generated.ts` se genera desde ese documento y CI rechaza cualquier drift.

## Variables

| Variable                                            | Uso                                                                                                  |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `PORT`                                              | Puerto HTTP de la API                                                                                |
| `DATABASE_URL`                                      | Conexión PostgreSQL y almacenamiento de trabajos                                                     |
| `CORS_ORIGINS`                                      | Orígenes permitidos, separados por comas                                                             |
| `NEXT_PUBLIC_API_URL`                               | URL pública de `/api/v1` accesible por el navegador                                                  |
| `API_INTERNAL_URL`                                  | URL de la API usada por el renderizado del servidor Next.js                                          |
| `NEXT_PUBLIC_SITE_URL`                              | Origen canónico público de la web                                                                    |
| `ANIMEAV1_BASE_URL`                                 | Origen de la única fuente permitida                                                                  |
| `SOURCE_USER_AGENT`                                 | Identificación de las solicitudes a la fuente                                                        |
| `JOBS_ENABLED`                                      | Activa pg-boss y los refrescos proactivos; usar una sola réplica con jobs al escalar horizontalmente |
| `LOG_LEVEL`                                         | Nivel de logs estructurados de Fastify                                                               |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Credenciales exigidas únicamente por Compose                                                         |

## Producción

La web y la API se empaquetan como imágenes Docker (`apps/web/Dockerfile`, `apps/api/Dockerfile`) orquestadas por `compose.yaml`. El desarrollo local no necesita contenedores: se ejecuta directamente con pnpm. La integración continua valida el Compose y construye ambas imágenes.

## Dirección futura

AnimeHub Desktop consumirá este OpenAPI con caché offline. Su biblioteca será local y reconstruible en SQLite; los estados personales serán colecciones, no carpetas físicas. La reproducción se delegará a una aplicación externa. MEGA y Pixeldrain serán proveedores nativos, aria2 administrará HTTP y JDownloader seguirá como integración opcional local o remota.

## Licencia

AnimeHub Web se distribuye bajo [GNU AGPL v3 o posterior](LICENSE).
