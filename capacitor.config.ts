import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor wraps the same web build (dist/) into native Android / iOS shells.
 * Generate the native projects with:  npx cap add android   /   npx cap add ios
 */
const config: CapacitorConfig = {
  appId: 'com.kamco.store',
  appName: 'KamCo',
  webDir: 'dist',
  // Point this at a machine running the KamCo API when testing on a device;
  // leave empty in production builds so the app uses its configured API URL.
  server: {
    androidScheme: 'https',
  },
}

export default config
