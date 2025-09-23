import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Native status bar fix for Capacitor (removes green band on Android/iOS)
// Ensures the WebView doesn't underlap a colored native status bar
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { App as CapApp } from "@capacitor/app";

(async () => {
  try {
    const platform = Capacitor.getPlatform();
    if (platform === "ios") {
      // On iOS, use a solid status bar background matching the app to avoid any banding
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: "#F0F8FF" });
      await StatusBar.setStyle({ style: Style.Dark });
    } else if (platform === "android") {
      // On Android, use a solid status bar background matching the app
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: "#F0F8FF" });
      await StatusBar.setStyle({ style: Style.Dark });
    }
  } catch (err) {
    // Ignore if plugin is unavailable (e.g., web preview)
    console.warn("StatusBar setup skipped:", err);
  }
})();

// Recover gracefully when app resumes from background (prevents blank white screen)
CapApp.addListener('appStateChange', async ({ isActive }) => {
  if (!isActive) return;
  try {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios' || platform === 'android') {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: "#F0F8FF" });
      await StatusBar.setStyle({ style: Style.Dark });
    }
  } catch {}
  // If the React root lost its children for any reason, force a safe reload
  const root = document.getElementById('root');
  if (root && root.childElementCount === 0) {
    window.location.reload();
  }
});

// Also re-apply UI when tab becomes visible again (web preview)
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible') {
    try {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios' || platform === 'android') {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: "#F0F8FF" });
        await StatusBar.setStyle({ style: Style.Dark });
      }
    } catch {}
  }
});

createRoot(document.getElementById("root")!).render(<App />);
