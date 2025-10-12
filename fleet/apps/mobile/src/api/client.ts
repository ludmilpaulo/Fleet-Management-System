const API_URL = process.env.EXPO_PUBLIC_API_URL!;

let access: string | null = null;
let refresh: string | null = null;
export const tokenStore = {
  getAccess: () => access,
  setAccess: (t: string) => (access = t),
  getRefresh: () => refresh,
  setRefresh: (t: string) => (refresh = t),
};

export async function api(path: string, init: RequestInit = {}) {
  const headers = { ...(init.headers || {}), Authorization: access ? `Bearer ${access}` : undefined } as any;
  let resp = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (resp.status !== 401 || !refresh) return resp;
  const r = await fetch(`${API_URL}/accounts/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!r.ok) return resp;
  const j = await r.json();
  tokenStore.setAccess(j.access);
  if (j.refresh) tokenStore.setRefresh(j.refresh);
  return fetch(`${API_URL}${path}`, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${j.access}` } });
}

// TODO: persist tokens to expo-secure-store


