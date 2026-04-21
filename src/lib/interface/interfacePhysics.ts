import { InterfaceProfile } from '../../types';

/**
 * Resolves the institutional interface physics based on the selected profile.
 * Calibrates terminal rendering parameters, motion smoothing, and visual intensity.
 */
export const resolveInterfacePhysics = (profile: InterfaceProfile) => {
  return {
    flickerReduced: profile.motion === 'Off',
    intensity: profile.glow === 'High' ? 1.0 : profile.glow === 'Medium' ? 0.6 : 0.2,
    smoothing: profile.motion !== 'Off',
    dataDensity: profile.dataDensity,
    refreshRate: profile.motion === 'Normal' ? 'sync' : 'stable',
    colorCalibration: 'institutional-v4',
    glowBlur: profile.glow === 'High' ? 20 : profile.glow === 'Medium' ? 12 : 5,
    animationSpeed: profile.motion === 'Off' ? 0 : profile.motion === 'Normal' ? 1.5 : 0.8,
  };
};
