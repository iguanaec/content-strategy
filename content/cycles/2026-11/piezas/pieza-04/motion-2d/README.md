# Motion 2D de Dani (sin voz, sin subtítulos)

Animación vectorial (React + SVG) con Remotion 4. El personaje es un rig reutilizable: `src/char/Dani.tsx`.

- Escenas: `src/Motion2D.tsx`. Props y fondos: `src/world.tsx`.
- Tiempos: `src/timeline.json` marca cuándo empieza cada frase. Hoy tiene el ritmo del guion de referencia (48 s). Cuando llegue la voz real, se transcribe con timestamps, se reemplaza este archivo y las escenas, música y efectos se re-sincronizan solos.
- Audio: música original (`../musica`) + efectos CC0 (`public/sfx`, wyzowl/sfx-kit) con `public/cues.json`. Sin voz.
- Hoja de personaje: `npx remotion still src/index.ts Sheet out/sheet.png`.

## Render
```
npm i
python make_music_bed.py   # crea public/music_bed.wav
npx remotion render src/index.ts Motion2D out/iguana-2d.mp4 --concurrency=3 --codec=h264 --crf=17 --audio-codec=aac --audio-bitrate=256k
# máster a -14 LUFS: ffmpeg loudnorm en dos pasadas (I=-14, TP=-1.5, LRA=7), copiando el video
```
Evitar filtros CSS/SVG tipo `blur` en escenas grandes: en el render provocaron fallos de rasterización por tramos.
