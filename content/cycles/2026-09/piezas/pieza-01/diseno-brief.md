# Pieza 01 — Brief de diseño

## Diseño en Canva (editable)
- **Editar**: https://www.canva.com/d/OLiZQwCduu3D8h9
- **Ver**: https://www.canva.com/d/Fent8c4OXMlUIVt
- Design ID: `DAHWOWDSfNk` · 5 páginas · **1080x1440 (3:4)**. Se eligió 3:4 en lugar de 4:5 porque es el formato vertical actual de IG y ocupa más espacio en el feed.

## Sistema visual
- **Fondo**: blanco cálido. No se usan fondos oscuros ni verdes.
- **Colores**: se usan solo como texto y acentos.
  - Negro roca `#2B2420`: titulares y cuerpo.
  - Coral `#C8683B`: palabra clave y etiquetas "SEÑAL 0X / 03". Es solo acento puntual.
  - Verde `#2F5D50`: líneas finas y notas en mono.
- **Tipografía**: Plus Jakarta Sans para titulares y cuerpo, y Space Mono para etiquetas, contadores y notas.
- **Jerarquía en 4 niveles**: etiqueta mono → titular XL → apoyo regular → nota mono.
- **Detalles**: contador `0X/05` arriba a la derecha, barra de progreso coral abajo y número gigante de fondo en el slide 2.
- No lleva logo ni nombre de producto (es awareness puro).

## Por slide
| # | Layout | Foto IA (media ID de Canva) |
|---|--------|-----------------------------|
| 1 | Hook en dos niveles, "3 horas en contestarle" en coral XL, foto abajo | Mano con celular lleno de chats (`MAHWORZFTE4`) |
| 2 | "01" gigante de fondo, titular XL, foto abajo | Celular boca abajo en mesa de salón (`MAHWOYAS9qY`) |
| 3 | Foto a sangre a la izquierda, texto a la derecha | Cuaderno de citas desordenado (`MAHWOdSZ4_k`) |
| 4 | Titular con "nunca" en coral más grande, foto abajo a la derecha | Silla de salón vacía (`MAHWOQaMvFk`) |
| 5 | Solo tipografía: reflexión, línea verde y CTA XL | — |

## Prompts de las fotos (Canva AI, 4:5)
1. Close-up of a Latin American woman's hand holding a smartphone full of unread chat notifications, warm evening light, bright cream/beige tones, beauty salon counter, no face, documentary 35mm.
2. Smartphone face down on a wooden salon work table, faint notification glow, brushes and spray bottle, natural daylight, warm cream tones, no people.
3. Top-down flat lay: open appointment notebook with crossed-out times, sticky notes, pen, smartphone with notes app, bright daylight, terracotta accents.
4. Single empty styling chair in a small clean salon, soft afternoon light, off-white walls, beige and muted green, calm melancholic mood.

## Pendientes antes de publicar
- [ ] Revisar en Canva que las fuentes sean Plus Jakarta Sans y Space Mono. La API de Canva no permite fijar la familia tipográfica, así que algunos textos pueden haber quedado con una sans o una mono parecida.
- [ ] Decidir si se agrega un watermark discreto del handle en el slide 5. Por defecto no se agrega.
- [ ] Exportar los PNG desde Canva (Compartir → Descargar → PNG, todas las páginas) y dejarlos en `media/` para que `publicar` los detecte.
