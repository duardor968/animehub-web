# Agent Instructions

## Propósito y estado

AnimeHub Web es un monorepo pnpm con una interfaz pública Next.js y un API NestJS/Fastify. En esta etapa solo es un scaffold. No presentes health checks, la portada o la configuración de Prisma como funcionalidad de producto.

La documentación se escribe en español. Código, nombres de archivos, identificadores y commits se escriben en inglés.

## Límites de arquitectura

- Mantén `apps/web` y `apps/api` como workspace pnpm simple; no introduzcas Nx, Turborepo ni microservicios sin una decisión explícita.
- La API pública vive bajo `/api/v1` y documenta sus cambios mediante OpenAPI.
- AnimeAV1 es la única fuente inicial. Todo scraping ocurre en el servidor y nunca en Next.js, el navegador o AnimeHub Desktop.
- Web y Desktop consumen el mismo API alojado. Desktop podrá añadir caché offline, pero no un scraper C++ alternativo.
- La web no tiene cuentas ni biblioteca personal.
- Click'n'Load y MyJDownloader son operaciones del navegador. Los secretos de MyJDownloader deben permanecer en memoria durante la sesión y no pueden enviarse, registrarse o persistirse en el servidor.
- Redis es una mejora de caché opcional: un Redis caído no debe impedir arrancar el scaffold ni responder health live.
- No añadas modelos Prisma o migraciones vacías antes de definir un dominio real.

## Producto compartido

- La biblioteca personal pertenece exclusivamente a Desktop y es local y reconstruible.
- Los estados personales se modelarán como colecciones SQLite, nunca como organización de carpetas físicas.
- La reproducción se abre en una aplicación externa.
- MEGA y Pixeldrain serán proveedores nativos de v1; aria2 administrará HTTP. JDownloader será opcional, tanto local como remoto.
- Las notificaciones de episodios estarán activadas por defecto. La descarga automática se configurará por anime.
- La identidad visual es nueva; solo se conserva el nombre AnimeHub del antecedente.

## Convenciones por aplicación

### Web

- Usa App Router, componentes de servidor por defecto y componentes cliente solo cuando la interacción lo exija.
- Antes de cambiar comportamiento de Next.js 16, consulta la documentación incluida en `node_modules/next/dist/docs/`.
- Reutiliza HeroUI y bibliotecas open source maduras cuando encajen de forma natural, especialmente para accesibilidad, DnD y carruseles. Evita dependencias para abstracciones triviales.
- Mantén una dirección editorial oscura, composición deliberada, tipografía clara y accesibilidad WCAG. La portada actual valida el pipeline, no es el diseño final.

### API

- Conserva Fastify; no dependas accidentalmente de Express en ejecución o pruebas.
- Inyecta configuración mediante `@nestjs/config`. Nunca leas o expongas secretos fuera de los límites necesarios.
- `health/live` comprueba el proceso. `health/ready` comprueba PostgreSQL. No conviertas Redis opcional en requisito de readiness sin una decisión explícita.
- Mantén controladores finos, lógica en servicios y acceso de datos centralizado.

## Seguridad y datos

- Nunca confirmes ni versionas `.env`, credenciales, cookies, HTML capturado con datos sensibles o dumps de base de datos.
- Valida entradas en la frontera HTTP y aplica listas explícitas de orígenes CORS.
- No registres URLs firmadas, tokens de proveedores o datos de MyJDownloader.
- No modifiques bases ajenas al rol y base dedicados `animehub_dev` / `animehub`.

## Calidad

Antes de entregar cambios, ejecuta la comprobación mínima relevante y, para cambios transversales, toda la suite:

```bash
pnpm install --frozen-lockfile
pnpm prisma:validate
pnpm prisma:generate
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @animehub/api test:e2e
pnpm build
docker compose config
```

Añade pruebas unitarias para lógica y e2e para contratos HTTP. No dependas de Redis en las pruebas base.

## Git

- Usa Conventional Commits en inglés y cambios pequeños y enfocados.
- No confirmes `node_modules`, `.next`, `dist`, `coverage`, clientes Prisma generados, archivos `.env` ni artefactos Docker.
- No copies código, historial o artefactos de `Anime_downloader`; es solo antecedente conceptual.
- Mantén `README.md`, `.env.example` y OpenAPI sincronizados con interfaces públicas.
