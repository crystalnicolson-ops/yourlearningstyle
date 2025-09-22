import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Native status bar fix for Capacitor (removes green band on Android/iOS)
// Ensures the WebView doesn't underlap a colored native status bar
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

(async () => {
  try {
    if (Capacitor.getPlatform() !== "web") {
      // Do not draw under the status bar
      await StatusBar.setOverlaysWebView({ overlay: false });
      // Match our app background (hsl(208, 100%, 97%) ≈ #F0F8FF)
      await StatusBar.setBackgroundColor({ color: "#F0F8FF" });
      // Choose text/icon color for contrast
      await StatusBar.setStyle({ style: Style.Dark });
    }
  } catch (err) {
    // Ignore if plugin is unavailable (e.g., web preview)
    console.warn("StatusBar setup skipped:", err);
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
