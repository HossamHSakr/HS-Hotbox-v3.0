export type ActionType = 'submenu' | 'open_folder' | 'launch_app' | 'run_script' | 'cancel';

export interface SliceSchema {
  id?: string;
  label: string;
  icon: string | any; // allow lucide icon component names or emoji
  action: ActionType;
  target: string;
}

export interface MenuSchema {
  name: string;
  slices: SliceSchema[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const rawMenuData: Record<string, MenuSchema> = {
  main: {
    name: "Main",
    slices: [
      { label: "Projects", icon: "folder", action: "submenu", target: "projects" },
      { label: "Studio", icon: "monitor", action: "submenu", target: "studio" },
      { label: "Quick Access", icon: "zap", action: "submenu", target: "quick_access" },
      { label: "Hot Scripts", icon: "flame", action: "submenu", target: "hot_scripts" },
      { label: "Run", icon: "play", action: "submenu", target: "run" }
    ]
  },
  projects: {
    name: "Projects",
    slices: [
      { label: "Open", icon: "folder-open", action: "open_folder", target: "F:\\Studio" },
      { label: "Upload", icon: "cloud-upload", action: "open_folder", target: "D:\\My Drive\\Clients" },
      { label: "04_Delivery", icon: "package", action: "open_folder", target: "R:\\Studio\\Delivery" },
      { label: "Sa3it-Elnour", icon: "folder", action: "submenu", target: "sa3it_elnour" },
      { label: "Back", icon: "arrow-left", action: "submenu", target: "main" }
    ]
  },
  sa3it_elnour: {
    name: "Sa3it Elnour",
    slices: [
      { label: "Assets", icon: "package", action: "open_folder", target: "F:\\Studio\\Sa3it_Elnour\\Assets" },
      { label: "Renders", icon: "monitor", action: "open_folder", target: "F:\\Studio\\Sa3it_Elnour\\Renders" },
      { label: "Back", icon: "arrow-left", action: "submenu", target: "projects" }
    ]
  },
  studio: {
    name: "Studio",
    slices: [
      { label: "Open", icon: "folder-open", action: "open_folder", target: "F:\\Studio" },
      { label: "RESOURCES", icon: "book", action: "open_folder", target: "F:\\Studio\\RESOURCES" },
      { label: "Software", icon: "disc", action: "open_folder", target: "G:\\Transfere" },
      { label: "Back", icon: "arrow-left", action: "submenu", target: "main" }
    ]
  },
  quick_access: {
    name: "Quick Access",
    slices: [
      { label: "Desktop", icon: "monitor", action: "open_folder", target: "%userprofile%\\Desktop" },
      { label: "Documents", icon: "file-text", action: "open_folder", target: "%userprofile%\\Documents" },
      { label: "Downloads", icon: "download", action: "open_folder", target: "%userprofile%\\Downloads" },
      { label: "Recent", icon: "clock", action: "open_folder", target: "%userprofile%\\Recent" },
      { label: "Back", icon: "arrow-left", action: "submenu", target: "main" }
    ]
  },
  hot_scripts: {
    name: "Hot Scripts",
    slices: [
      { label: "Studio Tools", icon: "wrench", action: "submenu", target: "studio_tools" },
      { label: "hotbox_editor", icon: "edit", action: "run_script", target: "C:\\Scripts\\hotbox_editor.ahk" },
      { label: "Open Hotbox", icon: "folder-open", action: "open_folder", target: "C:\\Scripts\\HSK_hotbox" },
      { label: "Back", icon: "arrow-left", action: "submenu", target: "main" }
    ]
  },
  studio_tools: {
    name: "Studio Tools",
    slices: [
      { label: "Cleanup", icon: "wrench", action: "run_script", target: "cleanup.bat" },
      { label: "Backup", icon: "server", action: "run_script", target: "backup.ps1" },
      { label: "Back", icon: "arrow-left", action: "submenu", target: "hot_scripts" }
    ]
  },
  run: {
    name: "Run",
    slices: [
      { label: "Calculator", icon: "calculator", action: "launch_app", target: "calc.exe" },
      { label: "cmd", icon: "terminal", action: "launch_app", target: "cmd.exe" },
      { label: "Notepad++", icon: "file-edit", action: "launch_app", target: "notepad++.exe" },
      { label: "This PC", icon: "server", action: "launch_app", target: "explorer.exe" },
      { label: "Back", icon: "arrow-left", action: "submenu", target: "main" }
    ]
  }
};

// Inject IDs
export const menuData: Record<string, MenuSchema> = Object.fromEntries(
  Object.entries(rawMenuData).map(([k, v]) => [
    k,
    {
      ...v,
      slices: v.slices.map(s => ({ ...s, id: generateId() }))
    }
  ])
);
