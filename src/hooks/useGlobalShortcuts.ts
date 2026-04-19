import React from 'react';
import { useHotboxStore } from '../store/useHotboxStore';

export function useGlobalShortcuts() {
  const { isOpen, setIsOpen, setPosition, goBack, currentMenuId } = useHotboxStore();

  React.useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handleMouseMove = (e: MouseEvent) => {
      // If the hotbox is open, we don't necessarily want to update the center
      // But we track it while it's closed so it spawns at cursor
      if (!isOpen) {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }
    };

    // Native C# Intercept Hook
    const handleNativeOpen = (e: any) => {
       const { x, y } = e.detail;
       setPosition(x, y);
       setIsOpen(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + Space (Fallback for web)
      if (e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        if (!isOpen) {
          setPosition(mouseX, mouseY);
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }

      // Escape key behavior
      if (e.key === 'Escape') {
        if (isOpen) {
          e.preventDefault();
          if (currentMenuId === 'main') {
            setIsOpen(false);
          } else {
            goBack();
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('native-hotbox-open', handleNativeOpen);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('native-hotbox-open', handleNativeOpen);
    };
  }, [isOpen, setIsOpen, setPosition, goBack, currentMenuId]);
}
