import { create } from 'zustand';
import { menuData as fallbackMenuData, MenuSchema, SliceSchema } from '../data/menus';

export type ThemeName = 'neon' | 'dark' | 'solarized' | 'custom' | string;

export interface CustomThemeConfig {
  sliceBg: string;
  sliceHoverBg: string;
  sliceStroke: string;
  sliceText: string;
  centerBg: string;
  centerHoverBg: string;
}

export interface HotboxState {
  isOpen: boolean;
  isEditorOpen: boolean;
  position: { x: number; y: number };
  theme: ThemeName;
  customTheme: CustomThemeConfig;
  savedThemes: Record<string, CustomThemeConfig>;
  
  // Data
  menuData: Record<string, MenuSchema>;
  currentMenuId: string;
  history: string[]; // for back navigation
  
  // Configuration UI states
  navMethod: 'click' | 'hover';
  hoverDelayEnabled: boolean;
  hoverDelay: number;
  
  // Animation configs
  animStiffness: number;
  animDamping: number;
  animDuration: number;

  // Actions
  setIsOpen: (isOpen: boolean) => void;
  setIsEditorOpen: (isOpen: boolean) => void;
  setPosition: (x: number, y: number) => void;
  setTheme: (theme: ThemeName) => void;
  setCustomTheme: (config: Partial<CustomThemeConfig>) => void;
  saveCustomTheme: (name: string, config: CustomThemeConfig) => void;
  deleteCustomTheme: (name: string) => void;
  setMenuData: (data: Record<string, MenuSchema>) => void;
  navigateMenu: (menuId: string) => void;
  goBack: () => void;
  updateSlices: (menuId: string, slices: SliceSchema[]) => void;
  setNavConfig: (navMethod: 'click' | 'hover', delayEnabled: boolean, delay: number) => void;
  setAnimConfig: (stiffness: number, damping: number, duration: number) => void;
}

export const useHotboxStore = create<HotboxState>((set) => ({
  isOpen: false,
  isEditorOpen: false,
  position: { x: 0, y: 0 },
  theme: 'neon',
  savedThemes: {},
  customTheme: {
    sliceBg: '#1e1e1e',
    sliceHoverBg: '#2d2d2d',
    sliceStroke: '#ffffff',
    sliceText: '#ffffff',
    centerBg: '#1e1e1e',
    centerHoverBg: '#2d2d2d'
  },
  
  menuData: fallbackMenuData,
  currentMenuId: 'main',
  history: [],
  
  navMethod: 'click',
  hoverDelayEnabled: true,
  hoverDelay: 400,
  
  animStiffness: 300,
  animDamping: 25,
  animDuration: 0.2,

  setIsOpen: (isOpen: boolean) =>
    set((state) => ({
      isOpen,
      // reset menu if closing
      ...(isOpen ? {} : { currentMenuId: 'main', history: [] }),
    })),
  setIsEditorOpen: (isEditorOpen) => set({ isEditorOpen }),
  setPosition: (x, y) => set({ position: { x, y } }),
  setTheme: (theme) => set({ theme }),
  setCustomTheme: (config) => set((state) => ({ customTheme: { ...state.customTheme, ...config } })),
  saveCustomTheme: (name, config) => set((state) => ({ savedThemes: { ...state.savedThemes, [name]: config } })),
  deleteCustomTheme: (name) => set((state) => {
    const newThemes = { ...state.savedThemes };
    delete newThemes[name];
    return { savedThemes: newThemes, theme: state.theme === name ? 'neon' : state.theme };
  }),
  setMenuData: (data) => set({ menuData: data }),
  navigateMenu: (menuId) =>
    set((state) => ({
      history: [...state.history, state.currentMenuId],
      currentMenuId: menuId,
    })),
  goBack: () =>
    set((state) => {
      const newHistory = [...state.history];
      const prevMenu = newHistory.pop() || 'main';
      return {
        history: newHistory,
        currentMenuId: prevMenu,
      };
    }),
  updateSlices: (menuId, slices) => 
    set((state) => ({
      menuData: {
        ...state.menuData,
        [menuId]: {
          ...state.menuData[menuId],
          slices
        }
      }
    })),
  setNavConfig: (navMethod, hoverDelayEnabled, hoverDelay) => set({ navMethod, hoverDelayEnabled, hoverDelay }),
  setAnimConfig: (animStiffness, animDamping, animDuration) => set({ animStiffness, animDamping, animDuration }),
}));
