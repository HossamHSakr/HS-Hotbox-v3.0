// Simulate a preload bridge/IPC for cross-platform (Electron, Tauri, or C#/C++) integration
export const ipcBridge = {
  executeAction: async (action: string, target: string, shiftPressed: boolean = false) => {
    const payload = JSON.stringify({ action, target, shiftPressed });

    // Photino / WebView2 bridge detection
    if (typeof window !== 'undefined') {
      const gThis = window as any;
      
      if (gThis.chrome?.webview) {
        // Microsoft Edge WebView2 (Windows Native standard)
        gThis.chrome.webview.postMessage(payload);
        return;
      } else if (gThis.external?.sendMessage) {
        // Photino.NET Native Bridge
        gThis.external.sendMessage(payload);
        return;
      }
    }
    
    // Fallback for AI Studio Browser Web Preview
    console.log(`[IPC Sim] Executing action: '${action}' with target: '${target}'`);
  }
};
