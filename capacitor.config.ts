import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.monarch.fitness',
  appName: 'Monarch',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "PLACEHOLDER_WEB_CLIENT_ID",
      clientId: "PLACEHOLDER_WEB_CLIENT_ID",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
