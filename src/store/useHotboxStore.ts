import { create } from 'zustand';
import { menuData as initialMenuData, MenuSchema, SliceSchema } from '../data/menus';

export type ThemeName = 'neon' | 'dark' | 'solarized';

export interface HotboxState {
  isOpen: boolean;
  isEditorOpen: boolean;
  position: { x: number; y: number };
  theme: ThemeName;
  
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
  
  menuData: initialMenuData,
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
