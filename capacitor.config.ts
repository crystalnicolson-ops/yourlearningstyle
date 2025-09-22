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
    // Ensure native iOS view (status bar/safe area) matches app background
    backgroundColor: '#F0F8FF'
  },
  bundledWebRuntime: false
};

export default config;