// Production API for iOS production builds, dev API for development
const getApiUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // For production builds, use production API
  // __DEV__ is automatically false in production builds (EAS build, App Store, etc.)
  if (!__DEV__) {
    // Production API URL - iOS production builds go straight to production
    return 'https://taki.pythonanywhere.com/api';
  }
  
  // Development: Use IP address for iOS simulator and Android device compatibility
  return 'http://192.168.1.110:8000/api';
};

const API_URL = getApiUrl();

let access: string | null = null;
let refresh: string | null = null;
export const tokenStore = {
  getAccess: () => access,
  setAccess: (t: string) => (access = t),
  getRefresh: () => refresh,
  setRefresh: (t: string) => (refresh = t),
};

export async function api(path: string, init: RequestInit = {}) {
  const headers = { ...(init.headers || {}), Authorization: access ? `Token ${access}` : undefined } as any;
  return await fetch(`${API_URL}${path}`, { ...init, headers });
}

// TODO: persist tokens to expo-secure-store


