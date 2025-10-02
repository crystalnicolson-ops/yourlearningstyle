import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

// Native status bar fix for Capacitor (removes green band on Android/iOS)
// Ensures the WebView doesn't underlap a colored native status bar
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { App as CapApp } from "@capacitor/app";

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

async function setupNativeFeatures() {
  try {
    const platform = Capacitor.getPlatform();
    if (platform === "ios") {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: "#6366F1" });
      await StatusBar.setStyle({ style: Style.Light });
    } else if (platform === "android") {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: "#6366F1" });
      await StatusBar.setStyle({ style: Style.Light });
    }
  } catch (err) {
    console.warn("StatusBar setup skipped:", err);
  }
}

// Safer app resume handler
function setupResumeHandler() {
  try {
    const platform = Capacitor.getPlatform();
    let lastBackgroundAt = 0;

    // Only reload if the app is actually broken, not just on every resume
    const shouldReloadOnResume = () => {
      try {
        // Check if React root is actually empty or broken
        const root = document.getElementById('root');
        if (!root || root.childElementCount === 0) {
          return true;
        }
        
        // Throttle reloads to prevent loops
        const now = Date.now();
        const last = Number(sessionStorage.getItem('lastResumeReload') || '0');
        if (now - last < 5000) return false; // 5s guard instead of 2s
        
        return false; // Don't auto-reload unless necessary
      } catch {
        return false; // Safer default
      }
    };

    // Fires when app state changes (native)
    CapApp.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        console.log('[Resume] appStateChange -> active');
        await setupNativeFeatures();

        const idleMs = Date.now() - (lastBackgroundAt || Date.now());
        // iOS sometimes purges the WKWebView after long background; hard-reload to recover
        if (platform === 'ios' && idleMs > 30000) {
          console.log('[Resume] iOS idle > 30s, forcing reload');
          sessionStorage.setItem('lastResumeReload', String(Date.now()));
          window.location.reload();
          return;
        }

        // Only reload if the React tree is actually broken
        setTimeout(() => {
          if (shouldReloadOnResume()) {
            console.log('[Resume] React root broken, reloading...');
            sessionStorage.setItem('lastResumeReload', String(Date.now()));
            window.location.reload();
          }
        }, 500); // Give React time to render
      } else {
        // App going to background
        lastBackgroundAt = Date.now();
        console.log('[Background] appStateChange -> inactive');
      }
    });

    // Explicit resume event (native) - just setup native features, don't reload
    CapApp.addListener('resume', async () => {
      console.log('[Resume] resume event');
      await setupNativeFeatures();
      
      // Only reload if absolutely necessary
      setTimeout(() => {
        if (shouldReloadOnResume()) {
          console.log('[Resume] React root broken on resume, reloading...');
          sessionStorage.setItem('lastResumeReload', String(Date.now()));
          window.location.reload();
        }
      }, 500);
    });

    // Handle tab visibility changes (web only)
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        await setupNativeFeatures();
        // Check if page needs reload after being hidden
        setTimeout(() => {
          if (shouldReloadOnResume()) {
            console.log('[Resume] React root broken after visibility change, reloading...');
            sessionStorage.setItem('lastResumeReload', String(Date.now()));
            window.location.reload();
          }
        }, 300);
      } else {
        // going hidden
        lastBackgroundAt = Date.now();
      }
    });

    // Handle bfcache restores on iOS Safari/WKWebView
    window.addEventListener('pageshow', (ev: any) => {
      if (ev && ev.persisted) {
        console.log('[Resume] pageshow from bfcache, forcing reload');
        window.location.reload();
      }
    });
  } catch (err) {
    console.warn('Resume handler setup failed:', err);
  }
}

// Root blank-screen watchdog (iOS/WebKit resilience)
function startRootWatchdog() {
  try {
    let attempts = 0;
    const maxAttempts = 10; // check for ~10s total
    const interval = setInterval(() => {
      const root = document.getElementById('root');
      const isBlank = !root || root.childElementCount === 0 || ((root.textContent || '').trim() === '' && root.children.length === 0);
      if (document.visibilityState === 'visible' && isBlank) {
        const now = Date.now();
        const lastHeal = Number(sessionStorage.getItem('lastAutoHeal') || '0');
        if (now - lastHeal > 10000) { // throttle to avoid loops
          console.log('[Watchdog] Empty root detected, forcing reload');
          sessionStorage.setItem('lastAutoHeal', String(now));
          clearInterval(interval);
          window.location.reload();
          return;
        }
      }
      attempts++;
      if (attempts >= maxAttempts) clearInterval(interval);
    }, 1000);
  } catch (e) {
    console.warn('Watchdog init failed:', e);
  }
}

// Safe initialization
async function initializeApp() {
  try {
    // Set up native features
    await setupNativeFeatures();
    
    // Set up resume handler
    setupResumeHandler();
    
    // Ensure root element exists
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    // Create and render React app
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );

    // Start watchdog after initial render
    startRootWatchdog();
    
  } catch (error) {
    console.error("App initialization failed:", error);
    // Fallback: show basic error message
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, rgb(125, 211, 252) 0%, rgb(147, 51, 234) 50%, rgb(236, 72, 153) 100%); padding: 20px;">
          <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 8px; padding: 32px; max-width: 400px; text-align: center; color: white;">
            <h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 16px;">Loading Error</h2>
            <p style="margin-bottom: 24px; opacity: 0.8;">The app failed to load. Please refresh the page.</p>
            <button onclick="window.location.reload()" style="background: rgba(255, 255, 255, 0.2); color: white; padding: 8px 24px; border: none; border-radius: 6px; cursor: pointer;">Refresh Page</button>
          </div>
        </div>
      `;
    }
  }
}

// Start the app
initializeApp();
