// Use IP address for iOS simulator and Android device compatibility
// Default to 192.168.1.110 (update this to your computer's IP if different)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.110:8000/api';

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


