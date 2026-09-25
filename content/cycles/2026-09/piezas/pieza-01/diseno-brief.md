# Pieza 01 — Brief de diseño

## Diseño en Canva (editable)
- **Título**: "Pieza 01 — 3 señales WhatsApp (carrusel Iguana)". Búscalo por ese título en canva.com, porque los links de Canva rotan y dejan de funcionar.
- Design ID: `DAHWO61VFXs`. Tiene 5 páginas de **1080x1440 (3:4)** y está en la cuenta y el equipo de Canva de Iguana.
- Versiones anteriores descartadas: `DAHWOWDSfNk` (quedó en otra cuenta) y una primera pasada solo con ilustraciones (muy plana, sin jerarquía).

## Sistema visual
- **Slides con foto (1, 3, 5)**: foto editorial cinematográfica a sangre completa (alto contraste, luz dramática, mucho negro), con el texto en blanco `#F8F8F6` encima y la palabra clave en Verde Iguana `#0C7A3E`.
- **Slides con ilustración (2, 4)**: fondo Blanco Lava `#F8F8F6`, ilustración de línea simple con fondo transparente, tarjeta Gris Galápagos `#E8E8E6` detrás. Nunca fondo verde ni negro en estos.
- **Verde Iguana `#0C7A3E`**: único acento en todo el carrusel (palabra clave, badge, botón).
- **Tipografía**: Plus Jakarta Sans en todo el carrusel.
- **Jerarquía**: cada slide tiene un salto de tamaño fuerte entre el elemento principal y el resto (ej. "3 horas en contestarle" a 132px vs. la frase de arriba a 30px; "nunca" a 190px vs. el resto del titular a 56px). Los layouts son distintos slide a slide (texto arriba + foto abajo, texto y foto lado a lado, texto centrado sobre "?" de fondo, texto sobre foto a sangre).
- **No lleva**: logo, contadores de página, etiquetas tipo "Señal 1/3", barras de progreso.

## Por slide
| # | Tipo | Layout | Media (Canva) |
|---|------|--------|----------------|
| 1 | Foto a sangre | Frase chica arriba, "Lo perdiste porque tardaste" en blanco y "3 horas en contestarle." gigante en verde, sobre la parte oscura de la foto | Mano con celular lleno de chats, luz dramática (`MAHWOyoy5EA`) |
| 2 | Ilustración | Composición lado a lado: ilustración a la izquierda, titular y apoyo a la derecha, badge circular arriba | Reloj de bolsillo y celular con globo "…" (`MAHWO8z6vJ8`) |
| 3 | Foto a sangre | Titular y apoyo abajo, sobre la zona oscura de la foto | Agenda abierta con notas tachadas, luz dramática (`MAHWO0mcaeQ`) |
| 4 | Ilustración | Titular partido en 3 bloques: frase arriba, "nunca" gigante en verde al centro, frase abajo; "?" gris gigante de fondo; ilustración en tarjeta abajo | Silla de salón vacía con globo de diálogo (`MAHWO6lCOjM`) |
| 5 | Foto a sangre | Reflexión chica arriba, CTA grande en blanco al centro, botón verde "Guárdalo para releerlo" abajo | Silla de salón vacía iluminada por un haz de luz (`MAHWO7lh1Do`) |

## Prompts de las fotos editoriales (slides 1, 3, 5)
> Cinematic editorial photograph, dramatic lighting with deep shadows, high contrast, [SUJETO], lots of negative dark space, premium brand-campaign feel, not stock-photo generic, 35mm film grain, no text overlays.

1. a woman's hand holding a smartphone showing unread chat notifications, the phone screen glowing as the main light source, no face visible
2. an open paper appointment notebook with crossed-out handwritten lines and a smartphone on a dark wood desk, one bright shaft of light hitting the notebook
3. a single empty salon styling chair lit by one dramatic shaft of warm light from a window, no people

## Prompts de las ilustraciones de línea (slides 2 y 4)
Se generaron con Canva AI y se les quitó el fondo con "remove background".

> Minimal hand-drawn black ink line art on a pure white background: [SUJETO]. Style: single thin uniform line weight, clean contour outlines only, NO shading, NO crosshatching, NO stippling, NO grey tones, NO fills, flat 2D, sketchy and slightly playful like a doodle in a notebook or a coloring-book outline. Lots of empty white space, no text.

1. a round pocket watch with two clock hands and small tick marks (no numerals) and a short chain, lying next to a smartphone; one empty speech bubble with three dots above the phone
2. a single empty salon/barber chair in side view, one small empty speech bubble floating above it

Lo que **no** funcionó:
- Fotos de stock genéricas (primera versión) y grabado a tinta con trama cruzada tipo lámina del siglo XIX (demasiado realista, no coincidía con el estilo de iguana.ec).
- Usar la iguana del Brandboard (`MAExt1cNbLg`) como referencia de imagen hace fallar la generación, porque es un elemento de la librería de Canva.
- Gemini no se pudo usar para las ilustraciones porque el proyecto no tenía créditos (error 402).

## Pendientes antes de publicar
- [ ] Revisar en Canva que todos los textos estén en Plus Jakarta Sans. La API de Canva no permite fijar la familia tipográfica.
- [ ] Exportar los PNG desde Canva (Compartir → Descargar → PNG, todas las páginas) y dejarlos en `media/` para que `publicar` los detecte. Desde esta sesión no se puede: la red bloquea el dominio de descargas de Canva.
