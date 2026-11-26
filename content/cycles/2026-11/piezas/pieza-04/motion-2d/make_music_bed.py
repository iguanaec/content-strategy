# Genera public/music_bed.wav (-18 LUFS) a partir de la pista original: ../musica/musica-original.wav
import soundfile as sf, numpy as np, pyloudnorm as pyln
from pedalboard import Pedalboard, Limiter
m, sr = sf.read('../musica/musica-original.wav'); m = m.astype(np.float32)
mt = pyln.Meter(sr); m = pyln.normalize.loudness(m, mt.integrated_loudness(m), -18.0)
m = Pedalboard([Limiter(threshold_db=-2)])(m, sr); sf.write('public/music_bed.wav', m, sr, subtype='PCM_24')
