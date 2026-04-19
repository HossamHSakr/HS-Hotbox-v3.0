import { ThemeName } from '../store/useHotboxStore';

// Defines the visual themes based on the user's images
export const themes: Record<ThemeName, any> = {
  neon: {
    slices: {
      defaultBg: 'rgba(15, 10, 20, 0.85)',
      hoverBg: 'rgba(30, 20, 40, 0.95)',
      stroke: 'rgba(255, 0, 255, 0.6)', 
      hoverStroke: 'rgba(0, 255, 255, 0.9)',
      text: '#ffffff',
    },
    center: {
      bg: 'rgba(15, 10, 20, 0.9)',
      hoverBg: 'rgba(255, 0, 50, 0.3)',
      stroke: 'rgba(0, 255, 255, 0.8)',
    },
    glow: 'drop-shadow(0 0 10px rgba(255, 0, 255, 0.4))',
    hoverGlow: 'drop-shadow(0 0 15px rgba(0, 255, 255, 0.6))',
  },
  dark: {
    slices: {
      defaultBg: 'rgba(30, 30, 30, 0.9)',
      hoverBg: 'rgba(50, 50, 50, 0.95)',
      stroke: 'rgba(100, 100, 100, 0.5)',
      hoverStroke: 'rgba(255, 255, 255, 0.8)',
      text: '#ffffff',
    },
    center: {
      bg: 'rgba(20, 20, 20, 0.9)',
      hoverBg: 'rgba(60, 60, 60, 0.95)',
      stroke: 'rgba(80, 80, 80, 0.8)',
    },
    glow: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.5))',
    hoverGlow: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))',
  },
  solarized: {
    slices: {
      defaultBg: 'rgba(253, 246, 227, 0.9)', // Beige light
      hoverBg: 'rgba(238, 232, 213, 0.95)',
      stroke: 'rgba(147, 161, 161, 0.6)',
      hoverStroke: 'rgba(181, 137, 0, 0.9)',
      text: '#073642',
    },
    center: {
      bg: 'rgba(238, 232, 213, 0.95)',
      hoverBg: 'rgba(211, 1, 2, 0.2)', // red tint
      stroke: 'rgba(38, 139, 210, 0.7)',
    },
    glow: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2))',
    hoverGlow: 'drop-shadow(0 0 10px rgba(181, 137, 0, 0.5))',
  }
};
