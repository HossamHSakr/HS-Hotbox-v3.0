using System;
using System.Diagnostics;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace HSHotbox
{
    public partial class OverlayForm : Form
    {
        private WebView2? webView;
        private KeyboardHook hook;

        // Constants for window sizing
        const int WS_EX_TRANSPARENT = 0x00000020;
        const int WS_EX_LAYERED = 0x00080000;

        public OverlayForm()
        {
            // Setup true transparent chromeless overlay
            this.FormBorderStyle = FormBorderStyle.None;
            this.TopMost = true;
            this.ShowInTaskbar = false;
            this.StartPosition = FormStartPosition.Manual;
            
            // Handle null reference safely for Bounds
            if (Screen.PrimaryScreen != null)
            {
                this.Bounds = Screen.PrimaryScreen.Bounds; // Full monitor stretch
            }

            // Magic pink transparency key to pierce straight through the window
            this.BackColor = Color.Magenta;
            this.TransparencyKey = Color.Magenta;

            InitializeWebView();

            // Set up Global Shift+Space Hook natively
            hook = new KeyboardHook();
            hook.KeyPressed += Hook_KeyPressed;
            hook.RegisterHotKey(ModifierKeysNative.Shift, Keys.Space);
            
            // Hide initially until toggled
            this.Hide();
        }

        private async void InitializeWebView()
        {
            webView = new WebView2();
            webView.Dock = DockStyle.Fill;
            // The browser background must be explicitly transparent to pass through to the Magenta TransparencyKey
            webView.DefaultBackgroundColor = Color.Transparent;
            this.Controls.Add(webView);

            await webView.EnsureCoreWebView2Async(null);

            // Connect IPC events receiving from React
            webView.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;

            // Load either local dev server or built dist folder
            #if DEBUG
               webView.Source = new Uri("http://localhost:3000");
            #else
               string appDir = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "dist", "index.html");
               webView.Source = new Uri(appDir);
            #endif
        }

        // Must match EventHandler signature: object? sender
        private void Hook_KeyPressed(object? sender, KeyPressedEventArgs e)
        {
            if (this.Visible)
            {
                this.Hide();
            }
            else
            {
                // Force focus, move to foreground
                this.Show();
                this.BringToFront();
                SetForegroundWindow(this.Handle);
                
                // Inject fake payload to UI to open AT cursor correctly. (Shift+Space doesn't send MouseMove naturally)
                if (webView != null && webView.CoreWebView2 != null)
                {
                    string js = $"window.dispatchEvent(new CustomEvent('native-hotbox-open', {{ detail: {{ x: {Cursor.Position.X}, y: {Cursor.Position.Y} }} }}));";
                    webView.CoreWebView2.ExecuteScriptAsync(js);
                }
            }
        }

        private void CoreWebView2_WebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                var payload = JsonDocument.Parse(e.WebMessageAsJson);
                var root = payload.RootElement;
                
                string? action = root.GetProperty("action").GetString();
                string? target = root.GetProperty("target").GetString();
                
                bool shiftPressed = false;
                if (root.TryGetProperty("shiftPressed", out JsonElement spElement))
                {
                    shiftPressed = spElement.GetBoolean();
                }

                if (string.IsNullOrEmpty(action) || string.IsNullOrEmpty(target)) return;

                // Here we actually perform the OS Level triggers that WebApps can't
                switch (action)
                {
                    case "open_folder":
                    case "launch_app":
                    case "run_script":
                        // Expand vars like %userprofile%
                        string expTarget = Environment.ExpandEnvironmentVariables(target);
                        if (!string.IsNullOrEmpty(expTarget)) 
                        {
                            bool redirected = false;

                            // If shift is held and action is folder, commandeer the active explorer window
                            if (shiftPressed && action == "open_folder")
                            {
                                try 
                                {
                                    Type? shellAppType = Type.GetTypeFromProgID("Shell.Application");
                                    if (shellAppType != null)
                                    {
                                        dynamic? shell = Activator.CreateInstance(shellAppType);
                                        if (shell != null)
                                        {
                                            foreach (dynamic win in shell.Windows()) 
                                            {
                                                string name = System.IO.Path.GetFileNameWithoutExtension(win.FullName).ToLower();
                                                if (name == "explorer") 
                                                {
                                                    // Tell existing Windows Explorer to jump to target
                                                    win.Navigate(expTarget);
                                                    
                                                    // Pop window to front
                                                    SetForegroundWindow((IntPtr)win.HWND);
                                                    redirected = true;
                                                    break; // Stop after first explorer found
                                                }
                                            }
                                        }
                                    }
                                } 
                                catch (Exception comEx) 
                                {
                                    Console.WriteLine("Shell Redirection Failed: " + comEx.Message);
                                }
                            }

                            if (!redirected)
                            {
                                Process.Start(new ProcessStartInfo
                                {
                                    FileName = expTarget,
                                    UseShellExecute = true
                                });
                            }
                        }
                        break;
                }

                // If IPC completes an interaction, auto-hide the overlay
                this.Hide();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error executing IPC command: " + ex.Message);
            }
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            hook.Dispose();
            webView?.Dispose();
            base.OnFormClosed(e);
        }

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool SetForegroundWindow(IntPtr hWnd);
    }
    
    // Abstracting Windows hook for global OS-level shortcuts
    public class KeyboardHook : IDisposable
    {
        private Window window = new Window();
        private int currentId;

        public KeyboardHook()
        {
            window.KeyPressed += delegate (object? sender, KeyPressedEventArgs args)
            {
                KeyPressed?.Invoke(this, args);
            };
        }

        public void RegisterHotKey(ModifierKeysNative modifier, Keys key)
        {
            currentId++;
            if (!RegisterHotKey(window.Handle, currentId, (uint)modifier, (uint)key))
                throw new InvalidOperationException("Couldn't register the hot key.");
        }

        public event EventHandler<KeyPressedEventArgs>? KeyPressed;

        public void Dispose()
        {
            for (int i = currentId; i > 0; i--)
            {
                UnregisterHotKey(window.Handle, i);
            }
            window.Dispose();
        }

        [DllImport("user32.dll")]
        private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

        [DllImport("user32.dll")]
        private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

        // Invisible window to intercept messages
        private class Window : NativeWindow, IDisposable
        {
            private static int WM_HOTKEY = 0x0312;

            public Window()
            {
                this.CreateHandle(new CreateParams());
            }

            protected override void WndProc(ref Message m)
            {
                base.WndProc(ref m);

                if (m.Msg == WM_HOTKEY)
                {
                    Keys key = (Keys)(((int)m.LParam >> 16) & 0xFFFF);
                    ModifierKeysNative modifier = (ModifierKeysNative)((int)m.LParam & 0xFFFF);
                    KeyPressed?.Invoke(this, new KeyPressedEventArgs(modifier, key));
                }
            }

            public event EventHandler<KeyPressedEventArgs>? KeyPressed;

            public void Dispose()
            {
                this.DestroyHandle();
            }
        }
    }

    [Flags]
    public enum ModifierKeysNative : uint
    {
        Alt = 1,
        Control = 2,
        Shift = 4,
        Win = 8
    }

    public class KeyPressedEventArgs : EventArgs
    {
        public ModifierKeysNative Modifier { get; }
        public Keys Key { get; }

        internal KeyPressedEventArgs(ModifierKeysNative modifier, Keys key)
        {
            Modifier = modifier;
            Key = key;
        }
    }

    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new OverlayForm());
        }
    }
}
