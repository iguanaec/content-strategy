# Música de fondo original

Compuesta y sintetizada por código en `music.py`, sin samples ni loops de terceros (libre de derechos). Instrumentos: kick, clap y hats sintetizados, bajo, pluck Karplus-Strong, pad de sierras y campanas FM. Efectos con pedalboard.

La pista sigue el timeline de la voz, escena por escena:
- Gancho: pluck curioso en Am.
- Lanza su promo: groove a 104 BPM.
- 1 → 80 mensajes: beat acelerado, con una subida que cae justo en "ochenta".
- "Nadie respondió": se van los drums y quedan pad y piano triste.
- "¿Cuánto vale una hora…?": casi silencio.
- Iguana: se abre en mayor con campanas.
- Dani tranquilo: groove suave.
- Logo: acorde final.

Uso: `python music.py <timeline.json> musica.wav`. En `remotion/prep_audio4.py` se le aplica ducking de −7 dB cuando habla la voz y se normaliza a −24 LUFS.
