import React from 'react';
import { useHotboxStore, ThemeName } from '../store/useHotboxStore';

export function DevControls() {
  const { theme, setTheme } = useHotboxStore();

  const themes: ThemeName[] = ['neon', 'dark', 'solarized'];

  return null; // Hid DevControls to focus exclusively on Editor panel interactions and realism
}
