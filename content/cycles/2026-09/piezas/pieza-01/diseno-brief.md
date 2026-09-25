# Pieza 01 — Brief de diseño

## Diseño en Canva (editable)
- **Título**: "Pieza 01 — 3 señales WhatsApp (carrusel Iguana)". Búscalo por ese título en canva.com, porque los links de Canva rotan y dejan de funcionar.
- Design ID: `DAHWO61VFXs`. Tiene 5 páginas de **1080x1440 (3:4)** y está en la cuenta y el equipo de Canva de Iguana.
- El diseño de la versión anterior (`DAHWOWDSfNk`) quedó en otra cuenta y ya no se usa.

## Sistema visual (Brandboard Iguana)
- **Fondo**: Blanco Lava `#F8F8F6` en todos los slides. Nunca fondo verde ni negro.
- **Verde Iguana `#0C7A3E`**: es el único acento. Se usa en el arco que sangra desde una esquina, el badge circular, los pills, la palabra clave del titular y el botón.
- **Gris Galápagos `#E8E8E6`**: tarjetas redondeadas detrás de las ilustraciones.
- **Negro Basalto `#1A1A1A`**: solo para texto.
- **Tipografía**: Plus Jakarta Sans en todo el carrusel.
- **Formato**: inspirado en carruseles editoriales (titular grande, tarjetas con esquinas muy redondeadas, arco de color, pills, botón pill) y con mucho espacio en blanco.
- **No lleva**: logo, contadores tipo `1/5`, etiquetas tipo "Señal 1", barras de progreso ni fotos. Se ven "muy IA".

## Por slide
| # | Layout | Ilustración (media ID de Canva, fondo transparente) |
|---|--------|-----------------------------------------------------|
| 1 | Pill gris con "No perdiste ese cliente por precio.", titular grande con "3 horas en contestarle." en verde y arco verde abajo a la derecha | Iguana sobre roca mirando un celular con globos de chat (`MAHWO_C2ADQ`) |
| 2 | Badge verde con reloj, tarjeta gris con la ilustración arriba y el texto abajo | Reloj de bolsillo, celular y globo "…" (`MAHWO8z6vJ8`) |
| 3 | Titular, tres pills (Cuaderno · Notas del celular · Memoria), apoyo y tarjeta gris abajo | Cuaderno con líneas tachadas, post-its y celular (`MAHWOy2fc0w`) |
| 4 | "?" gigante gris de fondo, titular centrado con "nunca" en verde y tarjeta gris | Silla de salón vacía con globo de diálogo (`MAHWO6lCOjM`) |
| 5 | Reflexión, CTA grande, botón verde "Guárdalo para releerlo" y línea de arco verde | Iguana recostada en una roca junto a un cactus (`MAHWO4A69mc`) |

## Prompts de las ilustraciones (estilo línea de iguana.ec)
Se generaron con Canva AI y después se les quitó el fondo con la herramienta "remove background" de Canva. Gemini no se pudo usar porque el proyecto no tenía créditos (error 402).

**Base:**
> Minimal hand-drawn black ink line art on a pure white background: [SUJETO]. Style: single thin uniform line weight, clean contour outlines only, NO shading, NO crosshatching, NO stippling, NO grey tones, NO fills, flat 2D, sketchy and slightly playful like a doodle in a notebook or a coloring-book outline. Lots of empty white space, no text.

**[SUJETO]:**
1. a side-view iguana sitting on a small simple rock, looking at a smartphone standing next to it, two small empty speech bubbles above the phone
2. a round pocket watch with two clock hands and small tick marks (no numerals) and a short chain, lying next to a smartphone; one empty speech bubble with three dots above the phone
3. an open notebook with a few scribbled lines crossed out, two loose sticky notes and a smartphone beside it, seen slightly from above
4. a single empty salon/barber chair in side view, one small empty speech bubble floating above it
5. a side-view iguana relaxed and lying on a low flat rock next to a small simple prickly pear cactus, wide horizontal composition (3:2)

Lo que **no** funcionó:
- El grabado con trama cruzada tipo lámina del siglo XIX quedó demasiado realista.
- Usar como referencia la iguana del Brandboard (`MAExt1cNbLg`) hace fallar la generación, porque es un elemento de la librería de Canva.

## Pendientes antes de publicar
- [ ] Revisar en Canva que todos los textos estén en Plus Jakarta Sans. La API de Canva no permite fijar la familia tipográfica, y los slides 2 y 5 podrían haber quedado con otra sans parecida.
- [ ] Exportar los PNG desde Canva (Compartir → Descargar → PNG, todas las páginas) y dejarlos en `media/` para que `publicar` los detecte.
