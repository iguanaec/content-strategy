import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
const FONTS: [string, string, string][] = [
  ['Anton', 'fonts/anton-latin-400-normal.woff2', '400'],
  ['Montserrat', 'fonts/montserrat-latin-500-normal.woff2', '500'],
  ['Montserrat', 'fonts/montserrat-latin-800-normal.woff2', '800'],
  ['Montserrat', 'fonts/montserrat-latin-900-normal.woff2', '900'],
];
export const Fonts: React.FC = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FONTS.map(([n, u, w]) => new FontFace(n, `url(${staticFile(u)})`, {weight: w}).load().then((f) => document.fonts.add(f)))).then(() => continueRender(h));
  }, [h]);
  return null;
};
