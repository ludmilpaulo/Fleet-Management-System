/**
 * Suppresses expected warnings in Expo Go environment
 * These warnings are informational and don't affect functionality
 */

// Store original console.warn
const originalWarn = console.warn;

// Initialize warning suppressor
let isInitialized = false;

export const suppressExpectedWarnings = () => {
  if (isInitialized) return;
  isInitialized = true;

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString?.() || '';
    
    // Suppress Mixpanel JavaScript mode warning (expected in Expo Go)
    if (message.includes('MixpanelReactNative is not available') || 
        message.includes('using JavaScript mode') ||
        message.includes('MixpanelReactNative')) {
      return; // Suppress this expected warning
    }
    
    // Suppress expo-notifications warnings (expected in Expo Go)
    if (message.includes('expo-notifications') || 
        message.includes('Expo Go') ||
        message.includes('development build') ||
        message.includes('Android Push notifications') ||
        message.includes('functionality is not fully supported')) {
      return; // Suppress expected warnings
    }
    
    // Suppress SafeAreaView deprecation warnings (we've already fixed all imports)
    if (message.includes('SafeAreaView has been deprecated')) {
      return; // Suppress - we're using react-native-safe-area-context
    }
    
    // Call original warn for all other warnings
    originalWarn(...args);
  };
};

// Auto-initialize on import
suppressExpectedWarnings();

