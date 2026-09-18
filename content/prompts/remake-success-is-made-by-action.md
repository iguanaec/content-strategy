# Remake — "Success is made by action" (paleta Iguana)

Prompt de reproducción 1:1 del reel de referencia (11.03s, 720×1280, 30fps, 9:16),
con la paleta cambiada a Iguana Corp y el logo adjunto al cierre.

## Análisis del video original (medido, no estimado)

| Dato | Valor |
|---|---|
| Duración | 11.03 s |
| Resolución | 720×1280 (9:16 vertical) |
| Frame rate | 30 fps |
| Audio | AAC estéreo, sin voz en off, ~172 BPM |
| Cortes duros | 2.4 s · 4.6 s · 7.17 s |
| Acentos de audio | 0.0–0.45 s · 1.09 s · 2.41 s · 4.85 s · 7.21 s · 10.43 s |
| Caídas de volumen | 6.5 s y 8.5–9.5 s (tensión antes del remate) |

## Mapeo de color

| Original | Iguana |
|---|---|
| Violeta profundo de fondo | Negro Basalto `#1A1A1A` (con tinte verde muy oscuro `#0A1F14`) |
| Magenta / violeta de acento y glow | Verde Iguana `#0C7A3E` |
| Blanco del texto | Blanco Lava `#F8F8F6` |
| Círculos rojos ("tomorrow") | Gris grafito apagado `#3A3A3A` |
| Círculo verde ("now") | Verde Iguana `#0C7A3E` |
| UI clara del mockup de Instagram | Blanco Lava `#F8F8F6` |

Único color saturado en todo el video: Verde Iguana. Todo lo demás es neutro.

---

## PROMPT

```
A 9:16 vertical kinetic-typography motion graphics reel, 13 seconds total, 30fps,
720x1280. This is a beat-for-beat remake of a reference edit: keep the exact same
shot structure, the exact same transition types, and the exact same sound design
and timing. Change ONLY the color palette and sharpen the composition.

PALETTE (strict — no other saturated colors anywhere):
- Negro Basalto #1A1A1A — primary background
- Deep green-black #0A1F14 — background tint / gradient falloff
- Verde Iguana #0C7A3E — the ONLY accent color: all glows, highlight blocks,
  selection bars, the "now" marker, the final word
- Blanco Lava #F8F8F6 — all neutral typography and UI surfaces
- Graphite #3A3A3A — the "tomorrow" date markers (desaturated, dead, no glow)

TYPOGRAPHY: heavy geometric grotesque, all lowercase except where noted, tight
tracking. Italic weight for the accent words. Strong RGB chromatic-aberration
fringing on every text layer (about 2-3px split) — this is a signature of the
reference and must be preserved. On dark backgrounds all type carries a soft
Verde Iguana radial glow behind it.

GLOBAL LOOK: photoreal hero objects, studio-rendered, floating on flat darkness
with soft contact shadows. Heavy vignette. Shallow depth of field — hero object
sharp, everything else falling into blur. No people, no faces, no rooms, no
real locations, no handheld camera.

--- BEAT 1 — 0.00s to 2.40s ---
Background: Negro Basalto with a large soft-focus Verde Iguana circle bleeding in
from the lower left, deep green-black gradient falloff. Faint dot-grid texture.
COMPOSITION FIX vs reference: the word sits centered on the upper third with
generous negative space, not cropped by the frame edge.
0.00-0.60s: the word "success" in heavy white Blanco Lava. A Verde Iguana
selection-highlight bar sweeps left-to-right across the word while a mouse cursor
drags across it — the exact "selecting text in a design tool" motion of the
reference.
0.60-1.10s: the line "is made by" types in underneath in light italic grey.
1.10-1.50s: three photoreal glossy 3D objects drift slowly into frame from the
edges, dark and reflective with Verde Iguana rim light — a chess knight, a
lightning bolt, and a stopwatch. They stay soft-focus in the background layer.
1.50-2.40s: "success is made by" clears; the word "action" builds letter by
letter (a → o → acti n → action) in bold italic Verde Iguana with heavy neon
glow, centered, filling 60% of frame width.

--- TRANSITION at 2.40s ---
A fast vertical light-streak whip wipe: everything smears into horizontal motion
blur, a single hard Verde Iguana flash frame, then resolve. Lands exactly on the
music accent at 2.41s.

--- BEAT 2 — 2.40s to 4.60s ---
Pure Negro Basalto. A Verde Iguana radial glow low-left. An antique ornate pocket
watch — silver, exposed skeleton movement, photoreal product render — floats at
the lower-left third, tilted, sharply lit.
COMPOSITION FIX: the watch anchors the left third, the type stacks clean on the
right third, nothing overlaps.
The line builds word by word in sync with the beat:
  "not by waiting"  (Blanco Lava)
  "for the"         (Blanco Lava, smaller)
  "perfect"         (Blanco Lava on a solid Verde Iguana highlight block)
  "day"             (Blanco Lava, small, right-aligned under it)
Strong RGB split on all four lines.

--- HARD CUT at 4.60s ---
Straight cut on the beat, no transition effect. Lands on the accent at 4.85s.

--- BEAT 3 — 4.60s to 7.17s ---
Pull back and reveal: the entire previous frame is now the image inside an
Instagram post. The surrounding UI is Blanco Lava with a fine horizontal
scanline texture, like a photograph of a screen. The post card is tilted in 3D
perspective with slight lens warp and drifts with a slow push-in.
COMPOSITION FIX vs reference: straighten the card so the perspective reads
deliberate rather than accidental, and center it with even margins.
Card shows: heart icon "6", comment icon "0", share icon "0".
Caption types out letter by letter:
  @USERNAME_PLACEHOLDER  there will always be another reason
6.50s: the music thins out and drops in volume — hold the frame, let it breathe.

--- HARD CUT at 7.17s ---
Straight cut on the beat. Lands on the accent at 7.21s.

--- BEAT 4 — 7.17s to 9.80s ---
Pure black. A calendar grid sits on a plane tilted away in 3D perspective,
receding into darkness, lit by a single hard spotlight, heavy vignette, the far
rows falling out of focus.
"You don't start tomorrow" types in word by word across the top of the tilted
plane, heavy white Blanco Lava with pronounced RGB split.
The calendar grid scrolls upward fast with real motion blur. A filled GRAPHITE
#3A3A3A circle marks a date and keeps jumping forward as the grid scrolls —
5, 10, 16, 17, 19, 21, 25, 26, 27, 30 — tomorrow always moving away, always
dead grey, never glowing.
8.50-9.50s: the music drops to near silence. Only the scroll continues. Tension.

--- RESOLUTION — 9.80s to 11.03s ---
The scroll decelerates and lands: the number "31", and beside it a filled Verde
Iguana #0C7A3E circle labelled "now" with a soft green bloom — the first and only
saturated color since the pocket watch.
The calendar defocuses into heavy blur behind.
Stacking in, each on a beat:
  "you"    — Blanco Lava, heavy, strong RGB split
  "start"  — Blanco Lava, heavier, strong RGB split
  "now"    — Verde Iguana, twice the size, slight 3D extrusion, green glow
The music swells back in at 10.43s on "now".

--- LOGO OUTRO — 11.03s to 13.00s ---
CRITICAL: the Iguana Corp logo is PROVIDED AS AN ATTACHED IMAGE FILE. Use that
exact attached file as-is. Do NOT redraw it, do NOT redesign it, do NOT generate,
invent, approximate or stylize any logo, wordmark, iguana illustration or icon.
If the attached logo file is not available, leave the frame empty rather than
inventing a logo.
At 11.03s a solid Verde Iguana circle scales up from the "now" marker and fills
the entire frame. On the green field, the attached logo appears centered, scaled
to about 45% of frame width, in its original artwork, with a short 0.3s fade-up
and no distortion, no recolor, no added effects. Hold clean and still until
13.00s. Nothing else in frame.

SOUND DESIGN (reproduce the reference exactly):
No voice over. A single continuous fast electronic beat at ~172 BPM running the
whole length, slightly lo-fi and compressed. Edit accents land on 0.00s, 1.09s,
2.41s, 4.85s, 7.21s and 10.43s. The bed thins and drops in volume at 6.50s and
again from 8.50s to 9.50s for tension, then swells back at 10.43s. Add a soft
riser under the calendar scroll and one clean impact on the logo reveal at 11.03s.

NEGATIVE PROMPT: no live-action footage, no rooms or interiors, no photographic
environments, no people, no faces, no hands, no handheld camera, no lower-third
captions, no purple, no magenta, no violet, no red, no rainbow gradients, no
invented or generated logo, no text other than the lines specified above.
```

---

## Antes de usarlo — 2 cosas que hay que rellenar

1. `@USERNAME_PLACEHOLDER` → el handle real de Instagram (en el original decía
   `Burzaev_studio`, que es la cuenta del creador de la referencia).
2. Adjuntar el archivo del logo de Iguana junto con el prompt. El bloque de
   LOGO OUTRO depende de que el archivo esté adjunto.

## Variante en español

Si se quiere el copy en español en lugar de conservar el inglés del original,
se sustituyen solo estas líneas (mismo timing, misma composición):

| Beat | Inglés (original) | Español |
|---|---|---|
| 1 | success / is made by | el éxito / se construye con |
| 1 | action | acción |
| 2 | not by waiting for the **perfect** day | no esperando el día **perfecto** |
| 3 | there will always be another reason | siempre va a haber otra excusa |
| 4 | You don't start tomorrow | no empiezas mañana |
| Final | you start now | empiezas ahora |
