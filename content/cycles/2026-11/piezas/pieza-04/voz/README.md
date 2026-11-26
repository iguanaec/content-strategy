# Voz en off (v9)

- Motor: Chatterbox Multilingual (Resemble AI, licencia MIT), en CPU, `language_id="es"`. Incluye la marca de agua inaudible Perth que el modelo agrega por defecto.
- Timbre: clonado de `ref_M1.wav`, una referencia masculina en español generada con Supertonic-3 (voz M1) de VoiceStudio.
- Expresividad por frase (`exaggeration` 0.5–0.85): más intensidad en "ochenta", "cuatro horas", "nadie respondió" y la pregunta; más calma en el cierre.
- `gen4.py`: genera cada frase de `clauses.json` (hasta 4 intentos) y valida con Whisper que el texto sea exacto. Salida: `voice4.wav` + `timeline4.json`.
- `post4.py .22 1.1`: acorta las pausas internas a 0,22 s y acelera 1,1× sin cambiar el tono (Rubber Band). Salida: `voz-narracion.wav` + `timeline4t.json` (copiado como `motion-3d/assets/timeline4.json`).
