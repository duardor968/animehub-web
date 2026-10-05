# Portada: lectura inmediata y actualización independiente

## Contrato y experiencia

`GET /api/v1/home` solo lee PostgreSQL. Una sección ausente no bloquea las demás. Una copia caducada se sirve con `meta.stale=true`; las fechas no se adelantan cuando se conserva una sección inválida. Sin ninguna copia, devuelve 503 y el cliente recupera automáticamente el contenido. Un fallo SQL conserva la última respuesta válida en memoria, si existe, marcada como caducada.

El renderizado inicial usa Suspense y el estilo de skeleton ya existente. El cliente consulta la API pública cada minuto mientras la pestaña está visible y al recuperar el foco. Cancela solicitudes al ocultarse o desmontarse, conserva contenido, scroll, foco y selección del carrusel. En frío hace tres intentos iniciales (separados por 5 y 10 segundos), muestra un estado neutro si fallan y continúa recuperándose cada minuto. No añade botones, badges ni temporizadores a imágenes.

## Trabajo en segundo plano

- Episodios: vencimiento de 3 minutos; portada completa: 10 minutos.
- El proceso programa el siguiente vencimiento real y comprueba cachés vacías/caducadas al arrancar. No depende de visitas.
- Todos los disparadores usan un único vuelo por proceso y un lease PostgreSQL de 30 segundos con token de propietario.
- La publicación adquiere y conserva el bloqueo del lease, valida propietario y vencimiento, y escribe registros, secciones y metadatos en una sola transacción. Las lecturas usan `REPEATABLE READ`.
- Cada sección se valida por separado. Arrays vacíos, inválidos o con identificadores duplicados no reemplazan su copia anterior. Un fallo de escritura revierte la publicación completa.
- El enriquecimiento de metadatos visuales ocurre después de publicar el contenido esencial, con dos trabajadores como máximo y dentro del mismo presupuesto de 15 segundos y lease. Es opcional y nunca impide servir la copia publicada.
- Los fallos completos y parciales tienen backoff durable de 30, 60, 120, 240 y 300 segundos; un fallo de adquisición de base de datos también tiene backoff local.

## Presupuestos, sin prometer un SLA de página

La lectura usa un pool separado de tres conexiones, adquisición de hasta 500 ms y límite SQL/cliente de 1.500 ms, con transacción de lectura acotada a 2 segundos en total. El fetch de portada web tiene 3 segundos para conexión y cuerpo, sin cinco reintentos SSR. El refresco tiene 15 segundos agregados; las peticiones de fuente de este trabajo hacen hasta dos intentos de 6 segundos, dentro del presupuesto restante. Los aborts llegan a fetch y a las esperas; PostgreSQL cancela consultas bloqueadas por `statement_timeout` y la transacción revierte escrituras incompletas. Un proceso muerto libera su lease por vencimiento.

Estos límites son presupuestos internos, no una garantía extremo a extremo de 3 segundos. Red, proxy, JavaScript e imágenes tienen latencias independientes. No se modifican configuración global del proxy ni controles de seguridad/rate limit.

## Observabilidad

La portada web genera `X-Request-ID` y la API lo valida y devuelve. Logs estructurados enlazan lectura y trabajo disparado, resultado y duración. No registran cookies, credenciales, cabeceras completas, queries ni payloads de la fuente.

## HeroUI 3.2.4 → 3.2.6

Se revisaron los changelogs oficiales de [3.2.5](https://heroui.com/en/docs/react/releases/v3-2-5) y [3.2.6](https://heroui.com/en/docs/react/releases/v3-2-6). Se actualizan `@heroui/react` y `@heroui/styles` juntos y se declaran sus peers `@internationalized/date@3.12.4`, `react-aria@3.52.1` y `react-aria-components@1.21.1`.

Los cambios relevantes son foco de teclado, overlays y composición de Toast, correcciones de estilos y reducción de renders. La aplicación ya usaba HeroUI 3, React 19 y Tailwind 4: no requiere una migración mayor ni cambiar sus iconos. No hay overrides de las clases obsoletas/renombradas del changelog. Se mantienen los componentes y estilos de imágenes.

## Verificación

`pnpm test` cubre concurrencia de 100 lectores, caché fría/parcial, fallos, aborts, backoff, foco/visibilidad, retención de contenido y selección. `TEST_DATABASE_URL=... pnpm --filter @animehub/api test:integration` crea un esquema aislado y comprueba carreras entre propietarios, fencing, publicación atómica, rollback, lectura coherente y cancelación SQL real. Nunca apunta este comando a una base de producción. CI usa su PostgreSQL efímero.

Aplicar la migración `20261005133000_home_refresh_lease` antes de iniciar la nueva API. No se borra contenido existente.
