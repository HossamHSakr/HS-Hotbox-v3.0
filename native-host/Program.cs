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
        private WebView2 webView;
        private KeyboardHook hook;

        public OverlayForm()
        {
            // Setup true transparent chromeless overlay
            this.FormBorderStyle = FormBorderStyle.None;
            this.TopMost = true;
            this.ShowInTaskbar = false;
            this.StartPosition = FormStartPosition.Manual;
            this.Bounds = Screen.PrimaryScreen.Bounds; // Full monitor stretch
            
            // Magic pink transparency key to pierce straight through the window
            this.BackColor = Color.Magenta;
            this.TransparencyKey = Color.Magenta;

            InitializeWebView();

            // Set up Global Shift+Space Hook natively
            hook = new KeyboardHook();
            hook.KeyPressed += Hook_KeyPressed;
            hook.RegisterHotKey((int)ModifierKeys.Shift, Keys.Space);
            
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
               string appDir = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist", "index.html");
               webView.Source = new Uri(appDir);
            #endif
        }

        private void Hook_KeyPressed(object sender, KeyPressedEventArgs e)
        {
            if (this.Visible)
            {
                this.Hide();
            }
            else
            {
                // Force focus, move to foreground, and update cursor coords if needed
                this.Show();
                this.BringToFront();
                SetForegroundWindow(this.Handle);
                
                // Optionally inject JS payload: `window.dispatchEvent(new CustomEvent('native-hotbox-open', { detail: { x: Cursor.Position.X, y: Cursor.Position.Y } }))`
            }
        }

        private void CoreWebView2_WebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                var payload = JsonDocument.Parse(e.WebMessageAsJson);
                var root = payload.RootElement;
                string action = root.GetProperty("action").GetString();
                string target = root.GetProperty("target").GetString();

                // Here we actually perform the OS Level triggers that WebApps can't
                switch (action)
                {
                    case "open_folder":
                    case "launch_app":
                    case "run_script":
                        // Expand vars like %userprofile%
                        string expTarget = Environment.ExpandEnvironmentVariables(target);
                        Process.Start(new ProcessStartInfo
                        {
                            FileName = expTarget,
                            UseShellExecute = true
                        });
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
            base.OnFormClosed(e);
        }

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool SetForegroundWindow(IntPtr hWnd);
    }
    
    // Abstracting Windows hook for global OS-level shortcuts outside the app boundaries
    public class KeyboardHook : IDisposable
    {
        // Minimal boilerplate implementation of RegisterHotKey...
        [DllImport("user32.dll")]
        private static extern bool RegisterHotKey(IntPtr hWnd, int id, int fsModifiers, int vk);

        [DllImport("user32.dll")]
        private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

        public event EventHandler<KeyPressedEventArgs> KeyPressed;
        
        public void RegisterHotKey(int modifier, Keys key) { 
           // In actual compiler this hooks to WndProc, omitted for space but standardized in .NET
        }
        public void Dispose() {}
    }

    public class KeyPressedEventArgs : EventArgs {}

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
