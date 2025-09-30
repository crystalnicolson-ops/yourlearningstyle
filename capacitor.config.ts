import { CapacitorConfig } from '@capacitor/cli';

const liveReloadUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'app.lovable.be928a6a28094e879afb600aa9894e39',
  appName: 'yourlearningstyle',
  webDir: 'dist',
  server: liveReloadUrl ? { url: liveReloadUrl, cleartext: true } : { cleartext: true },
  ios: {
    // Configure launch screen background to match app
    backgroundColor: '#6366F1',
    // Configure splash screen
    splashBackgroundColor: '#6366F1',
    // Configure status bar
    statusBarStyle: 'light',
    // Hide the offload text by using proper splash screen
    splashFadeOutDuration: 300,
    hideLogs: true
  },
  bundledWebRuntime: false
};

export default config;