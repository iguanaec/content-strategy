import React from 'react';
import {Composition} from 'remotion';
import {Motion} from './Motion';
import cues from '../public/cues.json';
export const RemotionRoot: React.FC = () => (
  <Composition id="Motion" component={Motion} width={1080} height={1920} fps={30}
    durationInFrames={Math.ceil(cues.total * 30)} />
);
