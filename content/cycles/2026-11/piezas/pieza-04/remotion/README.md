# Montaje final en Remotion

- `public/video.mp4`: copiar aquí el render 3D sin audio (`../motion-3d`, salida de `render.js`).
- `public/voice_clean.wav`: voz limpia (reducción de ruido, EQ, compresión, -16 LUFS) generada con `prep_audio.py` (pedalboard + noisereduce + pyloudnorm).
- `public/sfx/` + `public/cues.json`: efectos de sonido de **wyzowl/sfx-kit** (CC0, https://github.com/wyzowl/sfx-kit), colocados con su punto de sincronización sobre cada evento del video.

Render:
```
npm install
npx remotion render src/index.ts Motion out/iguana-motion.mp4 --codec=h264 --crf=17 --audio-codec=aac
```
Masterizado final a -14 LUFS / -1.5 dBTP con `ffmpeg loudnorm` (dos pasadas).
