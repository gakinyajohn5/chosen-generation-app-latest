import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chosengeneration.app',
  appName: 'Chosen Generation',
  webDir: 'dist', // Change this to 'build' if your framework uses build instead of dist
  server: {
    androidScheme: 'https'
  }
};

export default config;
