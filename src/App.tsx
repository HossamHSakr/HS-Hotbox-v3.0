import React from 'react';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { RadialMenu } from './components/RadialMenu';
import { EditorPanel } from './components/EditorPanel';
import { AnimatePresence } from 'motion/react';

export default function App() {
  useGlobalShortcuts();

  // Detect native WebView environment (C# Photino or WebView2)
  const isNative = !!(window as any).chrome?.webview || !!(window as any).external?.sendMessage;

  return (
    <div 
      className="w-full h-screen overflow-hidden text-white flex flex-col font-sans"
      style={{
        // If native C#, become truly transparent to the OS. If Web Preview, show mock desktop.
        background: isNative ? 'transparent' : 'url(https://images.unsplash.com/photo-1707343843437-caacff5cfa74?q=80&w=2670&auto=format&fit=crop)',
        backgroundColor: isNative ? 'transparent' : '#111',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Some fake window content to show the "overlay" nature over other apps (Web Preview Only) */}
      {!isNative && (
        <div className="absolute top-10 left-10 w-96 h-64 bg-[#1e1e1e] rounded-lg shadow-2xl border border-white/10 flex flex-col overflow-hidden pointer-events-none">
          <div className="h-8 bg-[#2d2d2d] w-full flex items-center px-3 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mx-auto pr-9">Maya App (Mock)</div>
          </div>
          <div className="flex-1 p-4 grid grid-cols-3 gap-2">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="bg-white/5 rounded-md"></div>
             ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        <EditorPanel key="editor-panel" />
      </AnimatePresence>

      {/* The actual Radial Hotbox overlay component that is globally visible */}
      <RadialMenu />
    </div>
  );
}
