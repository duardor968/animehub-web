# QA de diseño

## Referencias

- Capturas de AnimeHub Web anteriores al rediseño, aportadas en el hilo.
- Capturas de `Anime downloader` como antecedente funcional, no como plantilla visual.
- Sistema actual de HeroUI 3 para drawer, avisos, botones y progreso.

## Dirección validada

- Base azul petróleo con acento esmeralda y apoyo azul.
- Jerarquía dirigida por imágenes, sin tarjetas decorativas vacías.
- Carrusel manual y sin autoplay.
- Episodios densos con fotograma, número, antigüedad y descarga independiente.
- Ficha compacta seguida inmediatamente por el navegador visual de episodios.
- Preferencias y estados de descarga en un drawer derecho.

## Comprobaciones

- [x] Los fotogramas usan `/screenshots/{animeId}/{episodeNumber}.jpg` y cuentan con fallback de póster.
- [x] Los 42 recursos de imagen de la portada actual respondieron HTTP 200 en el smoke test local.
- [x] El carrusel admite botones, indicadores, teclado y gesto táctil sin autoplay.
- [x] La descarga individual inicia resolución y envío con una sola acción.
- [x] El envío rápido solo omite el drawer para un episodio y no oculta la selección de dispositivo MyJDownloader.
- [x] Los lotes muestran resumen, progreso determinado cuando existe total, cancelación, recuperación y reintento parcial.
- [x] El drawer de preferencias y descarga se ancla a la derecha y ocupa todo el ancho únicamente en móvil.
- [x] Las acciones visibles al pasar el cursor permanecen visibles en dispositivos táctiles y mediante foco.
- [x] Inicio, ficha, catálogo, búsqueda y horario responden con HTTP 200 en el entorno local.
- [x] Se respetan `prefers-reduced-motion`, foco visible y navegación móvil inferior.
- [x] Lint, tipos, pruebas unitarias y builds de producción pasan localmente.
- [ ] Comparación visual final en Chrome visible aprobada por el propietario.
