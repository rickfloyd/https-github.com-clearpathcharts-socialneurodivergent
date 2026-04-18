import { InterfaceProfile } from '../../types';

/**
 * Resolves the institutional interface physics based on the selected profile.
 * Calibrates terminal rendering parameters, motion smoothing, and visual intensity.
 */
export const resolveInterfacePhysics = (profile: InterfaceProfile) => {
  return {
    flickerReduced: profile.behavior.motion === 'static',
    intensity: profile.behavior.glow === 'high' ? 1.0 : profile.behavior.glow === 'medium' ? 0.6 : 0.2,
    smoothing: profile.behavior.motion !== 'static',
    dataDensity: profile.behavior.dataDensity,
    refreshRate: profile.behavior.motion === 'dynamic' ? 'sync' : 'stable',
    colorCalibration: 'institutional-v4',
    glowBlur: profile.behavior.glow === 'low' ? 5 : profile.behavior.glow === 'high' ? 20 : 12,
    animationSpeed: profile.behavior.motion === 'static' ? 0 : profile.behavior.motion === 'dynamic' ? 1.5 : 0.8,
  };
};
