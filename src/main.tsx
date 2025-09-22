import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Native status bar fix for Capacitor (removes green band on Android/iOS)
// Ensures the WebView doesn't underlap a colored native status bar
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

(async () => {
  try {
    const platform = Capacitor.getPlatform();
    if (platform === "ios") {
      // On iOS, let content extend under the status bar and use safe-area padding
      await StatusBar.setOverlaysWebView({ overlay: true });
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

createRoot(document.getElementById("root")!).render(<App />);
