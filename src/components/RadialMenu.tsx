import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHotboxStore } from '../store/useHotboxStore';
import { SliceSchema } from '../data/menus';
import { RadialSliceBackground, RadialSliceLabel } from './RadialSlice';
import { themes } from '../data/themes';
import { X, Settings } from 'lucide-react';
import { ipcBridge } from '../utils/ipc';

export function RadialMenu() {
  const { 
    isOpen, position, theme, currentMenuId, setIsOpen, navigateMenu, goBack, 
    isEditorOpen, setIsEditorOpen, menuData, animStiffness, animDamping 
  } = useHotboxStore();
  const menuInfo = menuData[currentMenuId] || menuData['main'];

  
  // Local state to manage size
  const [radiusScale, setRadiusScale] = useState(1);

  // Wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isOpen && e.ctrlKey) {
        e.preventDefault();
        setRadiusScale((prev) => {
          const newScale = prev - e.deltaY * 0.001;
          return Math.min(Math.max(newScale, 0.5), 2); // clamp
        });
      }
    };
    
    // + and - keys
    const handleZoomKeys = (e: KeyboardEvent) => {
      if (isOpen && (e.key === '=' || e.key === '+' || e.key === '-')) {
        setRadiusScale((prev) => {
          const delta = (e.key === '-' ? -0.1 : 0.1);
          return Math.min(Math.max(prev + delta, 0.5), 2);
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleZoomKeys);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleZoomKeys);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTheme = themes[theme];
  const innerRadius = 50 * radiusScale;
  const outerRadius = 180 * radiusScale;

  // We need extra padding so the left-aligned gear doesn't get clipped
  const svgPadding = 80;
  const svgWidth = outerRadius * 2 + svgPadding * 2;
  const svgHeight = outerRadius * 2 + svgPadding * 2;

  const handleSliceSelect = (slice: SliceSchema) => {
    switch (slice.action) {
      case 'submenu':
        navigateMenu(slice.target);
        break;
      case 'open_folder':
      case 'launch_app':
      case 'run_script':
        ipcBridge.executeAction(slice.action, slice.target);
        setIsOpen(false);
        break;
      case 'cancel':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-auto z-[9999]"
      // A slightly transparent background allows catching clicks to close outside the menu
      style={{
        background: 'transparent'
      }}
      onClick={() => setIsOpen(false)}
      onContextMenu={(e) => { e.preventDefault(); /* prevent standard context right click */ }}
    >
      {/* Overlay positioned at the saved coordinates perfectly centered */}
      <div 
        className="absolute"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={(e) => e.stopPropagation()} // stop click from closing when clicking exactly on the SVG area itself
      >
        <svg 
          width={svgWidth} 
          height={svgHeight} 
          viewBox={`-${outerRadius + svgPadding} -${outerRadius + svgPadding} ${svgWidth} ${svgHeight}`}
          className="overflow-visible"
        >
          {/* Editor Gear Button on the Left */}
          <g transform={`translate(-${outerRadius + 35}, 0)`}>
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="cursor-pointer"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditorOpen(!isEditorOpen);
              }}
            >
              <circle
                r="22"
                fill={isEditorOpen ? currentTheme.center.hoverBg : currentTheme.center.bg}
                stroke={currentTheme.slices.stroke}
                strokeWidth={1.5}
                style={{ filter: isEditorOpen ? currentTheme.hoverGlow : currentTheme.glow }}
                className="transition-colors duration-200"
              />
              <Settings 
                x="-10" 
                y="-10" 
                width="20" 
                height="20" 
                color={theme === 'solarized' ? '#073642' : '#ffffff'} 
                strokeWidth={1.5}
                className="pointer-events-none"
              />
            </motion.g>
          </g>

          <AnimatePresence mode="popLayout">
            <motion.g 
              key={currentMenuId}
              initial={{ rotate: -15, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 15, opacity: 0 }}
              transition={{ type: "spring", stiffness: animStiffness, damping: animDamping }}
            >
              {/* --- LAYER 1: Backgrounds & Interactive drop-shadow paths --- */}
              <g className="radial-slice-backgrounds">
                {menuInfo.slices.map((slice, i) => (
                  <RadialSliceBackground
                    key={`bg-${slice.id || i}`}
                    slice={slice}
                    index={i}
                    total={menuInfo.slices.length}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    themeName={theme}
                    onSelect={handleSliceSelect}
                  />
                ))}
              </g>

              {/* --- LAYER 2: Foreground Labels & Icons (Rendered firmly on top) --- */}
              <g className="radial-slice-labels pointer-events-none">
                {menuInfo.slices.map((slice, i) => (
                  <RadialSliceLabel
                    key={`lbl-${slice.id || i}`}
                    slice={slice}
                    index={i}
                    total={menuInfo.slices.length}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    themeName={theme}
                  />
                ))}
              </g>
            </motion.g>
          </AnimatePresence>

          {/* Center piece */}
          <motion.g
            className="cursor-pointer"
            whileHover="hover"
            whileTap="tap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <motion.circle
              cx="0"
              cy="0"
              r={innerRadius - 4}
              fill={currentTheme.center.bg}
              stroke={currentTheme.center.stroke}
              strokeWidth={2}
              style={{ filter: currentTheme.glow }}
              variants={{
                hover: { scale: 1.05, fill: currentTheme.center.hoverBg },
                tap: { scale: 0.95 }
              }}
              className="transition-colors duration-200"
            />
            <motion.g
              variants={{
                hover: { scale: 1.05 },
                tap: { scale: 0.95 }
              }}
              className="pointer-events-none"
            >
              <X 
                x="-12" 
                y="-12" 
                width="24" 
                height="24" 
                color={theme === 'solarized' ? '#073642' : '#ffffff'} 
                strokeWidth={1.5} 
              />
            </motion.g>
          </motion.g>
        </svg>
      </div>
    </div>
  );
}
