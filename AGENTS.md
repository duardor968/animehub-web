# Agent Instructions

## Producto

AnimeHub Web es un catálogo público sin cuentas y una API REST compartida con AnimeHub Desktop. La documentación se escribe en español. Código, nombres de archivo, identificadores y commits se escriben en inglés.

No presentes trabajo futuro como funcionalidad existente ni añadas textos pedagógicos a la interfaz. Cada elemento visual debe resolver jerarquía, comprensión, navegación, estado o acción.

## Límites

- Mantén el workspace pnpm simple con `apps/web` y `apps/api`; no introduzcas Nx, Turborepo ni microservicios.
- AnimeAV1 es la única fuente inicial. Todo acceso a ella ocurre en Nest; nunca en Next.js cliente ni en Desktop.
- Consume únicamente datos JSON de SvelteKit. No ejecutes scripts ni persistas HTML o payloads crudos.
- La web no tiene cuentas, biblioteca, seguimiento, reproducción, PWA, notificaciones ni administración.
- No añadas Redis en v1.
- No modifiques `animehub-desktop` ni `Anime downloader`; este último es solo un antecedente conceptual.
- No ejecutes contenedores localmente. Los Dockerfiles y Compose existen para CI y Coolify.
- Nunca uses Playwright en este proyecto. Realiza toda revisión visual en el Chrome visible del usuario y comprueba 1440×900, 1920×1080, 768×1024 y 390×844.

## API y datos

- Conserva NestJS sobre Fastify y el prefijo `/api/v1`.
- Mantén controladores finos, lógica en servicios, módulos por responsabilidad y Prisma como única frontera de persistencia.
- OpenAPI es el contrato único para Web y Desktop. Después de cambiar interfaces ejecuta `pnpm openapi:generate` y versiona ambos artefactos generados.
- Usa fechas UTC ISO 8601, envolturas `data/meta` y Problem Details para errores.
- Valida entradas HTTP y payloads de la fuente antes de normalizarlos.
- Conserva la proyección perezosa y durable, stale-while-revalidate, snapshots ordenados y las políticas de frescura documentadas.
- No elimines registros por antigüedad. Solo un `404` explícito repetido puede marcar una obra no disponible.
- pg-boss comparte PostgreSQL, admite dos trabajos masivos activos y procesa bloques de hasta 50 episodios.
- Los tokens de capacidad duran 24 horas y solo se persisten como hash. El reintento afecta únicamente ítems fallidos.
- Aplica límites por operación, timeouts y backoff ante `429/503`.

## Descargas y secretos

- La API solo resuelve enlaces estructurados; no conoce Click'n'Load, dispositivos ni credenciales MyJDownloader.
- Click'n'Load se comunica desde el navegador con `127.0.0.1:9666`; nunca añadas un proxy del servidor.
- MyJDownloader permanece detrás de un adaptador mínimo auditado. Deriva la sesión con Web Crypto, descarta la contraseña y no persistas credenciales.
- No registres URLs de descarga, tokens de capacidad, cabeceras de autorización, contraseñas ni datos MyJDownloader.
- Mantén CSP, Helmet, CORS por allowlist, request IDs, logs estructurados y redacción de secretos.
- Nunca versiones `.env`, credenciales, cookies, dumps ni fixtures con URLs firmadas reales.

## Web y UX

- Usa App Router y componentes de servidor por defecto; añade `use client` solo por interacción o APIs del navegador.
- Antes de alterar comportamiento específico de Next.js 16, consulta la documentación instalada en `node_modules/next/dist/docs/`.
- Mantén la dirección oscura y cinematográfica con base azul petróleo: fondos `#030711`/`#060B16`, superficies `#0A1220`/`#111A2A`, texto `#F3F8FC`, secundario `#93A4B8`, azul principal `#2F81F7` y turquesa `#30C8B0` reservado a estados puntuales de éxito.
- Bricolage Grotesque corresponde a títulos y Manrope a interfaz. Las imágenes estructuran la composición; el azul señala acciones, foco y progreso. El turquesa no es una acción principal.
- La portada usa un carrusel manual sin autoplay. Los episodios recientes y el navegador de episodios conservan fotogramas, número, contexto temporal y una acción de descarga independiente.
- El panel de descargas y preferencias se abre desde la derecha. Una descarga individual se resuelve y envía con una sola acción; los lotes conservan el resumen previo y muestran progreso continuo.
- Evita tarjetas vacías, ornamentos, autoplay, movimiento gratuito y dependencias para abstracciones triviales.
- Usa HeroUI y bibliotecas maduras cuando resuelvan una interacción real. No añadas DnD si no existe una necesidad de producto.
- Toda interacción táctil necesita equivalente de teclado y foco visible. Respeta `prefers-reduced-motion`.
- Conserva filtros, páginas y consultas en la URL. Las búsquedas y trabajos deben ser `noindex`.
- `confirmSingleEpisode` solo aplica a un episodio. Lotes y series completas siempre muestran un resumen previo.

## Calidad

Añade pruebas unitarias para lógica, integración/e2e para contratos HTTP y Testing Library para interacciones críticas. Simula AnimeAV1 con fixtures saneados; la fuente real solo puede aparecer en smoke tests manuales no bloqueantes.

Antes de entregar cambios transversales ejecuta:

```bash
pnpm install --frozen-lockfile
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

No descargues navegadores ni ejecutes Docker para la verificación local.

## Git y documentación

- Trabaja en `dev` con Conventional Commits en inglés. Avanza `main` solamente mediante fast-forward después de CI verde.
- No confirmes `node_modules`, `.next`, `dist`, `coverage`, clientes Prisma generados, `.env` ni artefactos de navegador o Docker.
- Mantén `README.md`, `.env.example`, migraciones, OpenAPI y tipos generados sincronizados.
- No reescribas cambios ajenos ni uses operaciones Git destructivas.
