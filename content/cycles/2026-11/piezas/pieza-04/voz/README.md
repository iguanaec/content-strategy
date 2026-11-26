# Voz en off (v10)

- `referencia-voz-usuario.mp3`: audio que entregó el usuario (5 s, primera frase). Se usa tal cual para "¿Sabías que noviembre y diciembre…".
- El resto del guion está generado con el mismo timbre y energía (Chatterbox multilingüe, clonación a partir del clip de referencia): `gen5.py`, `regen.py`, `regen2.py`. Es una voz provisional para fijar el ritmo; cuando llegue la grabación completa se reemplaza.
- `asm6.py`: acorta pausas, iguala niveles, ensambla y limpia la voz (−16 LUFS). `align6.py`: alinea cada palabra del guion con su tiempo real (Whisper) y genera `timeline6.json`, que mueve cortes, subtítulos y efectos.
- Para re-sincronizar con una grabación nueva: poner las frases en `clip_<id>.wav`, correr `asm6.py` y `align6.py`, copiar `timeline6.json` a `motion-3d/assets/` y volver a renderizar.
