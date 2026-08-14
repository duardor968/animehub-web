# Design QA — AnimeHub Web v1

## Verificación final — 2026-08-14

La ronda se validó en el Chrome visible del usuario con la API y la web locales. Se revisaron los cuatro viewports obligatorios: 1440 × 900, 1920 × 1080, 768 × 1024 y 390 × 844 CSS px.

### Hero de inicio

- Las imágenes reales de AnimeAV1 cargan y conservan un área estable para el texto.
- Autoplay confirmado a 7 segundos; pausa y reanudación detienen y restauran el avance.
- Las flechas envuelven primero/último en ambas direcciones.
- El indicador activo mide 48 px y muestra progreso; el inactivo conserva 24 px y ya no colapsa a 0 px.
- La primera pantalla mantiene jerarquía y contraste en escritorio, tablet y móvil sin desborde horizontal.

### Catálogo y filtros

- Los filtros de escritorio actualizan la URL y los resultados; se comprobó `category=especial`.
- El drawer móvil de HeroUI abre a ancho completo, termina su transición sin transparencia residual y mantiene accesibles `Limpiar` y `Aplicar filtros`.
- El filtro móvil se aplicó y cerró correctamente con la misma URL.
- Select, Disclosure, Checkbox, RadioGroup, NumberField, SearchField y TagGroup son controles HeroUI; no quedan controles HTML directos en la UI de producción auditada.

### Episodios

- El rango usa NumberField de HeroUI y se adapta a una columna en 390 px.
- `Seleccionar esta página` usa Checkbox de HeroUI, conserva selección entre páginas y refleja estado indeterminado.
- La selección de tarjeta nace como cuña diagonal desde la esquina superior derecha del Card real; no usa un wrapper cuadrado externo.
- El hover mantiene la cuña neutra. Solo el estado seleccionado usa azul.
- El borde azul se limita a parte superior y laterales; el borde inferior no cambia.
- La bandeja de selección es legible sobre la navegación móvil y usa singular/plural correcto.

### Descargas y progreso

- La descarga individual inicia con las preferencias actuales sin drawer de confirmación.
- Con JDownloader apagado se mostró un Toast HeroUI `danger`, rojo, persistente, cerrable y con mensaje veraz: `JDownloader no respondió`.
- Con JDownloader activo se mostró éxito únicamente después de la aceptación de LinkGrabber.
- Los rangos usan siempre un trabajo de fondo, incluso por debajo de 50 episodios, para exponer polling real.
- Prueba granular de One Piece 1–20: el Toast pasó de `0 de 20` a `17 de 20` antes de completar y entregar 40 enlaces. No se ejecutó la serie completa de 1173 episodios.
- La región de Toast se desplaza sobre la navegación fija en móvil para evitar solapamientos.
- La carrera de reemplazo de Toasts quedó protegida: el `onClose` de una instancia anterior no borra el identificador de la nueva.

### Calidad y accesibilidad

- Los controles críticos exponen nombre accesible y estados `aria-pressed`, `aria-current`, `aria-live` o roles de HeroUI según corresponda.
- No se observó desborde horizontal en los cuatro viewports.
- La navegación móvil, los drawers, los controles de rango y los selectores conservaron objetivos táctiles alcanzables.
- Web: 7 archivos / 15 tests pasaron; TypeScript y ESLint pasaron.
- API: 5 archivos / 9 tests pasaron; TypeScript pasó.
- E2E: 5 contratos HTTP pasaron; Prisma validó/generó y OpenAPI se regeneró sin cambios de hash.
- El build de producción de Next.js y NestJS pasó; el repositorio completo cumple Prettier.

### Riesgos no bloqueantes

- La disponibilidad de pósters y fotogramas depende de AnimeAV1; los fallbacks mantienen el espacio cuando falta una imagen.
- En trabajos muy rápidos puede observarse `0 de N` y luego el terminal sin otro conteo. La prueba 1–20 confirmó que los trabajos con duración suficiente sí publican progreso intermedio real.
- `pnpm audit --audit-level high` detecta GHSA-2v37-7h3g-55p8 en una versión transitiva de `nanoid` usada por el toolchain de webpack/Nest. No afecta el alcance visual de esta ronda y no se añadió un override de dependencias sin revisión específica.

final result: passed
