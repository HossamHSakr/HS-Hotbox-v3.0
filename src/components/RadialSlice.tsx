import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SliceSchema } from '../data/menus';
import { describeArc } from '../utils/math';
import { themes } from '../data/themes';
import { ThemeName, useHotboxStore } from '../store/useHotboxStore';
import * as Icons from 'lucide-react';
import clsx from 'clsx';

interface RadialSliceProps {
  slice: SliceSchema;
  index: number;
  total: number;
  innerRadius: number;
  outerRadius: number;
  themeName: ThemeName;
  onSelect?: (slice: SliceSchema) => void;
}

// ----------------------------------------------------
// SHARED MATH HELPER
// ----------------------------------------------------
function getSliceLayout(index: number, total: number, innerRadius: number, outerRadius: number) {
  const sliceAngle = 360 / total;
  const angleOffset = -90 - sliceAngle / 2;
  const startAngle = index * sliceAngle + angleOffset;
  const endAngle = startAngle + sliceAngle;
  const midAngle = startAngle + sliceAngle / 2;
  const midAngleRad = (midAngle * Math.PI) / 180;
  
  const labelRadius = innerRadius + (outerRadius - innerRadius) / 2;
  const labelX = labelRadius * Math.cos(midAngleRad);
  const labelY = labelRadius * Math.sin(midAngleRad);
  
  return { startAngle, endAngle, labelX, labelY };
}


// ----------------------------------------------------
// LAYER 1: THE BACKGROUND & EVENT LISTENER
// ----------------------------------------------------
export function RadialSliceBackground({
  slice, index, total, innerRadius, outerRadius, themeName, onSelect
}: RadialSliceProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { navMethod, hoverDelayEnabled, hoverDelay, animDuration, customTheme } = useHotboxStore();
  
  const theme = themeName === 'custom' ? {
    slices: {
      defaultBg: customTheme.sliceBg,
      hoverBg: customTheme.sliceHoverBg,
      stroke: customTheme.sliceStroke,
      hoverStroke: customTheme.sliceStroke,
      text: customTheme.sliceText
    },
    glow: 'none',
    hoverGlow: 'none'
  } as any : themes[themeName as keyof typeof themes];

  const hoverTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (navMethod === 'hover' && hoverDelayEnabled && slice.action === 'submenu') {
      hoverTimeout.current = setTimeout(() => {
        if (onSelect) onSelect(slice);
      }, hoverDelay);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  };

  React.useEffect(() => {
    return () => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }
  }, []);

  const { startAngle, endAngle } = getSliceLayout(index, total, innerRadius, outerRadius);
  const pathD = describeArc(0, 0, innerRadius, outerRadius, startAngle, endAngle);

  const isSolarizedDarkSector = themeName === 'solarized' && (index > 1 && index < 5);
  let resolvedBg = isHovered ? theme.slices.hoverBg : theme.slices.defaultBg;
  if (themeName === 'solarized' && isSolarizedDarkSector) {
    resolvedBg = isHovered ? 'rgba(7, 54, 66, 0.95)' : 'rgba(0, 43, 54, 0.9)';
  }

  return (
    <motion.path
      d={pathD}
      fill={resolvedBg}
      stroke={isHovered ? theme.slices.hoverStroke : theme.slices.stroke}
      strokeWidth={isHovered ? 2 : 1}
      style={{ filter: isHovered ? theme.hoverGlow : theme.glow }}
      className="cursor-pointer transition-colors duration-200"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: animDuration, delay: index * 0.02 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        if (navMethod === 'click' || !hoverDelayEnabled || slice.action !== 'submenu') {
           if (onSelect) onSelect(slice);
        }
      }}
    />
  );
}


// ----------------------------------------------------
// LAYER 2: THE LABEL & ICON (TEXT FOREGROUND)
// ----------------------------------------------------
export function RadialSliceLabel({
  slice, index, total, innerRadius, outerRadius, themeName
}: RadialSliceProps) {
  const { animDuration, customTheme } = useHotboxStore();
  
  const theme = themeName === 'custom' ? {
    slices: { text: customTheme.sliceText }
  } as any : themes[themeName as keyof typeof themes];

  const { labelX, labelY } = getSliceLayout(index, total, innerRadius, outerRadius);

  const IconNamesMap: Record<string, keyof typeof Icons> = {
    'folder': 'Folder', 'folder-open': 'FolderOpen', 'monitor': 'Monitor',
    'zap': 'Zap', 'flame': 'Flame', 'play': 'Play', 'cloud-upload': 'CloudUpload',
    'package': 'Package', 'arrow-left': 'ArrowLeft', 'book': 'Book',
    'disc': 'Disc', 'file-text': 'FileText', 'download': 'Download',
    'clock': 'Clock', 'wrench': 'Wrench', 'edit': 'Edit', 'calculator': 'Calculator',
    'terminal': 'Terminal', 'file-edit': 'FileEdit', 'server': 'Server',
  };

  const IconKey = IconNamesMap[slice.icon] || 'ChevronRight';
  const IconComponent = Icons[IconKey] as React.ElementType;

  const isSolarizedDarkSector = themeName === 'solarized' && (index > 1 && index < 5);
  let resolvedText = theme.slices.text;
  if (themeName === 'solarized' && isSolarizedDarkSector) {
    resolvedText = '#fdf6e3';
  }

  const hasArrow = slice.action === 'submenu';
  // Adjust entire content block vertically so its true visual centroid lands on (0,0)
  // Stack: Icon (-20...0), Text Baseline (14), Arrow (18...32)
  const contentOffsetY = hasArrow ? -6 : 1;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: animDuration, delay: index * 0.02 }}
      style={{ pointerEvents: 'none' }}
    >
      <g transform={`translate(${labelX}, ${labelY})`}>
        <g transform={`translate(0, ${contentOffsetY})`}>
          <g transform="translate(-10, -20)">
            {IconComponent && <IconComponent size={20} color={resolvedText} />}
          </g>
          
          <text
            y="14"
            textAnchor="middle"
            fill={resolvedText}
            fontSize="13"
            fontWeight="600"
            className="tracking-wide"
            style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.7)' }}
          >
            {slice.label}
          </text>

          {hasArrow && (
            <g transform="translate(-7, 18)">
               <Icons.ChevronDown size={14} color={resolvedText} className="opacity-70" />
            </g>
          )}
        </g>
      </g>
    </motion.g>
  );
}
