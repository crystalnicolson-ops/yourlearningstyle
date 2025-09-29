import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.be928a6a28094e879afb600aa9894e39',
  appName: 'yourlearningstyle',
  webDir: 'dist',
  server: {
    url: 'https://be928a6a-2809-4e87-9afb-600aa9894e39.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    // Configure launch screen background to match app
    backgroundColor: '#F0F8FF',
    // Configure splash screen
    splashBackgroundColor: '#F0F8FF',
    // Configure status bar
    statusBarStyle: 'dark',
    // Hide the offload text by using proper splash screen
    splashFadeOutDuration: 300,
    hideLogs: true
  },
  bundledWebRuntime: false
};

export default config;