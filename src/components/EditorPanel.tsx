import React, { useState } from 'react';
import { useHotboxStore } from '../store/useHotboxStore';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { Settings, Check, Edit2, GripVertical, Trash2, MousePointer2, Clock, Zap, Plus, Save } from 'lucide-react';
import { SliceSchema } from '../data/menus';

export function EditorPanel() {
  const { 
    isEditorOpen, currentMenuId, theme, setTheme, menuData, updateSlices,
    navMethod, hoverDelayEnabled, hoverDelay, setNavConfig,
    animStiffness, animDamping, animDuration, setAnimConfig,
    customTheme, setCustomTheme, savedThemes, saveCustomTheme, deleteCustomTheme
  } = useHotboxStore();

  const [isCreatingTheme, setIsCreatingTheme] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');

  const currentSlices = menuData[currentMenuId]?.slices || [];

  const handleReorder = (newSlices: SliceSchema[]) => {
    updateSlices(currentMenuId, newSlices);
  };

  const handleRemove = (idToRemove: string | undefined) => {
    if (!idToRemove) return;
    updateSlices(currentMenuId, currentSlices.filter(s => s.id !== idToRemove));
  };
  
  const handleSaveTheme = () => {
    if (newThemeName.trim()) {
      saveCustomTheme(newThemeName.trim().toLowerCase(), customTheme);
      setTheme(newThemeName.trim().toLowerCase());
      setIsCreatingTheme(false);
      setNewThemeName('');
    }
  };

  if (!isEditorOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-8 right-8 bottom-8 w-[360px] bg-[#0A0A0A]/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden z-40 pointer-events-auto"
    >
      <div className="h-12 bg-white/5 w-full flex items-center px-4 border-b border-white/10 justify-between shrink-0">
        <div className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
           <Settings size={14} className="text-indigo-400" /> Hotbox Editor
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 text-sm text-gray-300">
         
         {/* Theme Picker */}
         <div className="flex flex-col gap-2">
           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Global Style</label>
           {['neon', 'dark', 'solarized', ...Object.keys(savedThemes), 'custom'].map((t) => (
             <div key={t} className="flex gap-2">
               <button 
                 onClick={() => setTheme(t as any)}
                 className={`flex-1 px-3 py-2.5 rounded-lg flex justify-between items-center transition-all ${
                   theme === t 
                   ? 'border border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                   : 'border border-white/5 bg-black/40 hover:bg-white/10'
                 }`}
               >
                 <span className="capitalize text-sm font-medium">{t} Theme</span>
                 {theme === t && <Check size={16} className="text-indigo-400" />}
               </button>
               {Object.keys(savedThemes).includes(t) && (
                 <button 
                   onClick={() => deleteCustomTheme(t)}
                   className="px-3 shrink-0 rounded-lg flex items-center justify-center transition-all border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400"
                 >
                   <Trash2 size={16} />
                 </button>
               )}
             </div>
           ))}
         </div>

         {/* Custom Theme Colors Picker (Only visible if theme === 'custom') */}
         <AnimatePresence>
            {theme === 'custom' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-3 overflow-hidden bg-black/40 p-3 rounded-lg border border-white/10 mt-1"
              >
                 <div className="text-[10px] uppercase font-bold text-indigo-300">Custom Colors</div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-gray-400">Slice BG</span>
                     <div className="flex items-center gap-2">
                        <input type="color" value={customTheme?.sliceBg} onChange={(e) => setCustomTheme({ sliceBg: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                     </div>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-gray-400">Slice Hover</span>
                     <div className="flex items-center gap-2">
                        <input type="color" value={customTheme?.sliceHoverBg} onChange={(e) => setCustomTheme({ sliceHoverBg: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                     </div>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-gray-400">Text</span>
                     <div className="flex items-center gap-2">
                        <input type="color" value={customTheme?.sliceText} onChange={(e) => setCustomTheme({ sliceText: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                     </div>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-gray-400">Stroke</span>
                     <div className="flex items-center gap-2">
                        <input type="color" value={customTheme?.sliceStroke} onChange={(e) => setCustomTheme({ sliceStroke: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                     </div>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-gray-400">Center BG</span>
                     <div className="flex items-center gap-2">
                        <input type="color" value={customTheme?.centerBg} onChange={(e) => setCustomTheme({ centerBg: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                     </div>
                   </div>
                   <div className="flex flex-col gap-1">
                     <span className="text-xs text-gray-400">Center Hover</span>
                     <div className="flex items-center gap-2">
                        <input type="color" value={customTheme?.centerHoverBg} onChange={(e) => setCustomTheme({ centerHoverBg: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                     </div>
                   </div>
                 </div>

                 {/* Save Theme Sub-Panel */}
                 <div className="mt-2 pt-3 border-t border-white/10">
                   {!isCreatingTheme ? (
                     <button 
                       onClick={() => setIsCreatingTheme(true)}
                       className="w-full py-1.5 flex items-center justify-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-xs rounded border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                     >
                       <Plus size={12} /> Save as New Theme
                     </button>
                   ) : (
                     <div className="flex flex-col gap-2">
                       <input 
                         autoFocus
                         type="text" 
                         placeholder="Theme Name..." 
                         value={newThemeName}
                         onChange={(e) => setNewThemeName(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSaveTheme()}
                         className="w-full bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                       />
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setIsCreatingTheme(false)}
                           className="flex-1 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                         >
                           Cancel
                         </button>
                         <button 
                           onClick={handleSaveTheme}
                           disabled={!newThemeName.trim()}
                           className="flex-1 py-1 text-xs bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 rounded text-white transition-colors flex items-center justify-center gap-1"
                         >
                           <Save size={12} /> Save
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
              </motion.div>
            )}
         </AnimatePresence>
         
         <hr className="border-white/5" />

         {/* Navigation Behavior */}
         <div className="flex flex-col gap-3">
           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Navigation Behavior</label>
           <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setNavConfig('click', hoverDelayEnabled, hoverDelay)}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${navMethod === 'click' ? 'bg-indigo-500/20 border-indigo-500/50 border text-indigo-300' : 'bg-black/40 border border-white/5'}`}
              >
                <MousePointer2 size={14} /> Click
              </button>
              <button 
                onClick={() => setNavConfig('hover', hoverDelayEnabled, hoverDelay)}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${navMethod === 'hover' ? 'bg-indigo-500/20 border-indigo-500/50 border text-indigo-300' : 'bg-black/40 border border-white/5'}`}
              >
                <Clock size={14} /> Hover
              </button>
           </div>
           
           {navMethod === 'hover' && (
             <div className="flex flex-col gap-1 mt-1 bg-black/30 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-gray-400">Hover Delay</span>
                  <span className="text-indigo-300 font-mono">{hoverDelay}ms</span>
                </div>
                <input 
                  type="range" 
                  min="100" max="1000" step="50" 
                  value={hoverDelay}
                  onChange={(e) => setNavConfig(navMethod, hoverDelayEnabled, parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
             </div>
           )}
         </div>

         <hr className="border-white/5" />

         {/* Animation Physics */}
         <div className="flex flex-col gap-3">
           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Zap size={11} className="text-yellow-500" /> Animation Physics
           </label>
           
           <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Spring Stiffness</span>
                  <span className="text-gray-300 font-mono">{animStiffness}</span>
              </div>
              <input type="range" min="100" max="600" value={animStiffness} onChange={(e) => setAnimConfig(parseInt(e.target.value), animDamping, animDuration)} className="w-full accent-yellow-500 h-1 bg-white/10 rounded-lg appearance-none" />
           </div>

           <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Spring Damping</span>
                  <span className="text-gray-300 font-mono">{animDamping}</span>
              </div>
              <input type="range" min="10" max="60" value={animDamping} onChange={(e) => setAnimConfig(animStiffness, parseInt(e.target.value), animDuration)} className="w-full accent-yellow-500 h-1 bg-white/10 rounded-lg appearance-none" />
           </div>

           <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Slice Transition (s)</span>
                  <span className="text-gray-300 font-mono">{animDuration}s</span>
              </div>
              <input type="range" min="0.05" max="0.5" step="0.01" value={animDuration} onChange={(e) => setAnimConfig(animStiffness, animDamping, parseFloat(e.target.value))} className="w-full accent-yellow-500 h-1 bg-white/10 rounded-lg appearance-none" />
           </div>
         </div>

         <hr className="border-white/5" />

         {/* Tree Menu List (Draggable) */}
         <div className="flex flex-col gap-2">
           <div className="flex justify-between items-end mb-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <span className="text-indigo-400">{menuData[currentMenuId]?.name}</span> Slices
              </label>
              <button className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                <Edit2 size={10} /> JSON
              </button>
           </div>

           <Reorder.Group axis="y" values={currentSlices} onReorder={handleReorder} className="flex flex-col gap-2">
             {currentSlices.map((slice, i) => (
               <Reorder.Item 
                 key={slice.id || `slice-${i}-${slice.label}`} 
                 value={slice}
                 className="flex items-center gap-3 p-2 bg-black/50 hover:bg-white/5 transition-colors cursor-grab active:cursor-grabbing rounded-lg border border-white/5 relative group"
               >
                  <GripVertical size={14} className="text-gray-600 group-hover:text-gray-400" />
                  
                  <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center shrink-0 border border-white/5">
                     <span className="text-[10px] uppercase font-bold text-gray-300">{slice.icon.substring(0, 2)}</span>
                  </div>
                  
                  <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                    <span className="font-semibold text-white text-[11px]">{slice.label}</span>
                    <span className="text-[9px] text-gray-500 truncate w-full" title={slice.target}>
                      {slice.action} &rarr; {slice.target.split('\\').pop()}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemove(slice.id); }}
                    className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
               </Reorder.Item>
             ))}
           </Reorder.Group>
           
           <button 
             className="w-full py-2.5 mt-2 border border-dashed border-white/10 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
           >
              + Add Slice
           </button>

         </div>
      </div>
    </motion.div>
  );
}
