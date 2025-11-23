import * as SecureStore from 'expo-secure-store';

import { Platform } from 'react-native';

// API URL configuration - automatically uses network IP for physical devices
const API_URL = (() => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (__DEV__) {
    // Use network IP for physical devices
    const networkIP = process.env.EXPO_PUBLIC_NETWORK_IP || '192.168.1.110';
    const isPhysicalDevice = Platform.OS === 'ios' || Platform.OS === 'android';
    const apiURL = isPhysicalDevice 
      ? `http://${networkIP}:8000/api`
      : 'http://localhost:8000/api';
    console.log(`[API Client] Using API URL: ${apiURL} (Device: ${Platform.OS}, Physical: ${isPhysicalDevice}, Network IP: ${networkIP})`);
    return apiURL;
  }
  // Production API URL
  return 'https://taki.pythonanywhere.com/api';
})();

// Token storage using expo-secure-store
export const tokenStore = {
  getAccess: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('access_token');
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },
  setAccess: async (t: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync('access_token', t);
    } catch (error) {
      console.error('Error storing access token:', error);
    }
  },
  getRefresh: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },
  setRefresh: async (t: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync('refresh_token', t);
    } catch (error) {
      console.error('Error storing refresh token:', error);
    }
  },
  clear: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },
};

export async function api(path: string, init: RequestInit = {}) {
  const access = await tokenStore.getAccess();
  const headers = { 
    ...(init.headers || {}), 
    Authorization: access ? `Token ${access}` : undefined 
  } as any;
  return await fetch(`${API_URL}${path}`, { ...init, headers });
}


