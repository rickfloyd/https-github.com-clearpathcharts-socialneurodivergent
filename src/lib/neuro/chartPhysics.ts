
import { NeuroProfile } from '../../types';

export interface ChartPhysics {
  candleWidth: number;
  gridCount: number;
  animationSpeed: number;
  glowBlur: number;
  dataDensity: number;
  spacing: number;
}

export const resolveChartPhysics = (profile: NeuroProfile): ChartPhysics => {
  const { behavior } = profile;

  const densityMap = { low: 0.5, normal: 1.0, high: 1.5 };
  const spacingMap = { relaxed: 1.5, normal: 1.0, tight: 0.7 };

  const density = densityMap[behavior.dataDensity];
  const spacing = spacingMap[behavior.spacing];

  // Resolve candle width based on data density
  const candleWidth = 6 * density;

  // Resolve grid count
  const gridCount = Math.round(10 * density);

  // Resolve animation speed
  let animationSpeed = 300;
  if (behavior.motion === 'dynamic') animationSpeed = 100;
  if (behavior.motion === 'static') animationSpeed = 0;

  // Resolve glow blur
  let glowBlur = 0;
  if (behavior.glow === 'low') glowBlur = 4;
  if (behavior.glow === 'medium') glowBlur = 8;
  if (behavior.glow === 'high') glowBlur = 16;

  return {
    candleWidth,
    gridCount,
    animationSpeed,
    glowBlur,
    dataDensity: density,
    spacing: spacing,
  };
};
