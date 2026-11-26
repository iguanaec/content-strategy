import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, interpolate, useVideoConfig} from 'remotion';
import data from '../public/cues.json';
type Cue = {id: string; file: string; start: number; vol: number; dur: number};
export const Motion: React.FC = () => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#F8F8F6'}}>
      <OffthreadVideo src={staticFile('video.mp4')} muted />
      {/* Voz en off limpia (-16 LUFS) */}
      <Audio src={staticFile('voice_clean.wav')} volume={1} />
      {/* Efectos de sonido CC0 (wyzowl/sfx-kit), alineados por su punto de sincronizacion */}
      {(data.cues as Cue[]).map((c, i) => {
        const from = Math.round(c.start * fps);
        const len = Math.max(1, Math.ceil((c.dur + 0.05) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={len} layout="none">
            <Audio src={staticFile(c.file)}
              volume={(f) => c.vol * interpolate(f, [len - 4, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
