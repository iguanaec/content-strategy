import React from 'react';
import {Composition, Still} from 'remotion';
import {Sheet} from './Sheet';
import {Motion2D} from './Motion2D';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Motion2D" component={Motion2D} width={1080} height={1920} fps={30} durationInFrames={1443} />
    <Still id="Sheet" component={Sheet} width={1920} height={1080} />
  </>
);
