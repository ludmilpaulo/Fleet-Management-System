# Frontend Integration Guide — Fleet API

This README helps **Next.js (web admin)** and **Expo (mobile)** developers connect to the Django/DRF backend quickly and safely.

> **API base (dev):** `http://localhost:8000/api`
>
> **Docs (Swagger UI):** `http://localhost:8000/api/docs/`
>
> **OpenAPI JSON:** `http://localhost:8000/api/schema/`

---

## 1) Environments & Required Vars

### Web (Next.js)

Create `.env.local` in `apps/web/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
# Optional (for image URLs if you use S3 public)
NEXT_PUBLIC_S3_PUBLIC_URL=http://localhost:9000/fleet-photos
```

### Mobile (Expo)

Create `.env` in `apps/mobile/` (Expo can also use `app.config.ts` or `app.json` with `extra`):

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
EXPO_PUBLIC_S3_PUBLIC_URL=http://localhost:9000/fleet-photos
```

Use `process.env.NEXT_PUBLIC_*` in web, and `process.env.EXPO_PUBLIC_*` in Expo (or `Constants.expoConfig?.extra`).

---

## 2) Auth — JWT (SimpleJWT)

### Endpoints

* `POST /accounts/auth/login` → `{ access, refresh }`
* `POST /accounts/auth/refresh` → `{ access, refresh? }` (rotation enabled)
* `GET  /accounts/me` → current user profile

**Request body (login):**

```json
{ "username": "demo", "password": "demo" }
```

**Store tokens** in memory/secure storage (web: memory + cookie if you need SSR; mobile: `expo-secure-store`). On `401` from an API call, **silently refresh** once, then retry.

### Pseudocode refresh logic (shared)

```ts
async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const access = tokenStore.getAccess();
  const headers = { ...(init.headers||{}), Authorization: access ? `Bearer ${access}` : undefined };
  let resp = await fetch(input, { ...init, headers });
  if (resp.status !== 401) return resp;
  const refresh = tokenStore.getRefresh();
  if (!refresh) return resp;
  const r = await fetch(`${API_URL}/accounts/auth/refresh`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ refresh }) });
  if (!r.ok) return resp;
  const j = await r.json();
  tokenStore.setAccess(j.access); if (j.refresh) tokenStore.setRefresh(j.refresh);
  const retryHeaders = { ...(init.headers||{}), Authorization: `Bearer ${j.access}` };
  return fetch(input, { ...init, headers: retryHeaders });
}
```

---

## 3) Core API Map (MVP)

All routes are **org-scoped** by the authenticated user.

### Vehicles

* `GET  /fleet/vehicles`
* `POST /fleet/vehicles`
* `GET  /fleet/vehicles/{id}`
* `PATCH/DELETE /fleet/vehicles/{id}`

**Minimal vehicle payload:**

```json
{ "reg_number": "CA12345", "make": "VW", "model": "Polo", "year": 2020, "color": "White" }
```

### Shifts & Inspections

* `POST /inspections/shifts/start`  (body: `{ "vehicle_id": number, "gps": {"lat": -33.9, "lng": 18.4} }`)
* `POST /inspections/shifts/{id}/end` (optional gps)
* `POST /inspections/` (body: `{ "shift_id": number, "type": "START" | "END" }`)
* `POST /inspections/{id}/complete` (body: `{ "status": "PASS" | "FAIL" }`)
* `POST /uploads/sign` → presigned S3 POST form
* `POST /uploads/confirm` (persist a `Photo` row)

**Photo confirm payload:**

```json
{
  "inspection_id": 123,
  "file_key": "org/1/photos/uuid",
  "part": "FRONT",
  "angle": "WIDE",
  "width": 1280,
  "height": 720,
  "taken_at": "2025-09-26T10:15:00Z",
  "gps_lat": -33.9,
  "gps_lng": 18.4
}
```

### Issues & Tickets

* `POST /issues/issues`  (create from failed inspection)
* `GET  /tickets/tickets` (kanban by status on the web)
* `PATCH /tickets/tickets/{id}` (update status/assignee)

### Telemetry

* `POST /telemetry/parking` (log a parking location)
* `GET  /telemetry/parking?vehicle=<id>`

---

## 4) File Uploads — Presigned POST (S3/MinIO)

**Step 1: sign**

```http
POST /uploads/sign
{ "contentType": "image/jpeg" }
```

Response contains `{ url, fields, key }`.

**Step 2: upload** (directly to S3)

* Construct a `FormData` with all `fields` plus the binary under `file`.
* `POST` to `url`.

**Step 3: confirm**

```http
POST /uploads/confirm
{ "inspection_id": 1, "file_key": "<key>", "part": "FRONT", "angle": "WIDE", ... }
```

**Web example (TypeScript):**

```ts
async function uploadPhoto(file: File, meta: {inspection_id:number; part:string; angle:string; width:number; height:number; taken_at:string; gps_lat?:number; gps_lng?:number;}) {
  const sign = await authFetch(`${API_URL}/uploads/sign`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({contentType: file.type}) }).then(r=>r.json());
  const fd = new FormData();
  Object.entries(sign.fields).forEach(([k,v]) => fd.append(k, String(v)));
  fd.append('file', file);
  await fetch(sign.url, { method:'POST', body: fd });
  return authFetch(`${API_URL}/uploads/confirm`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...meta, file_key: sign.key }) }).then(r=>r.json());
}
```

**Mobile example (Expo):**

```ts
import * as FileSystem from 'expo-file-system';

async function uploadFromUri(uri: string, contentType: string, meta: any) {
  const sign = await authFetch(`${API_URL}/uploads/sign`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({contentType}) }).then(r=>r.json());
  const body = new FormData();
  Object.entries(sign.fields).forEach(([k,v]) => body.append(k, String(v)));
  body.append('file', { uri, name: 'photo.jpg', type: contentType } as any);
  await fetch(sign.url, { method: 'POST', body });
  return authFetch(`${API_URL}/uploads/confirm`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...meta, file_key: sign.key }) }).then(r=>r.json());
}
```

---

## 5) RTK Query Setup (Web)

Create `apps/web/src/lib/baseApi.ts`:

```ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.access;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    }
  }),
  tagTypes: ['Vehicle','Inspection','Ticket'],
  endpoints: () => ({}),
});
```

Example service `apps/web/src/services/vehicles.ts`:

```ts
import { baseApi } from '@/lib/baseApi';

export const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listVehicles: b.query<any[], void>({ query: () => '/fleet/vehicles', providesTags: ['Vehicle'] }),
    createVehicle: b.mutation<any, any>({
      query: (body) => ({ url: '/fleet/vehicles', method: 'POST', body }),
      invalidatesTags: ['Vehicle']
    })
  })
});

export const { useListVehiclesQuery, useCreateVehicleMutation } = vehiclesApi;
```

---

## 6) Mobile Fetch Helper (Expo)

Create `apps/mobile/src/api/client.ts`:

```ts
const API_URL = process.env.EXPO_PUBLIC_API_URL!;

let access: string | null = null;
let refresh: string | null = null;
export const tokenStore = { getAccess: () => access, setAccess: (t:string)=>access=t, getRefresh:()=>refresh, setRefresh:(t:string)=>refresh=t };

export async function api(path: string, init: RequestInit = {}) {
  const hdrs = { ...(init.headers||{}), Authorization: access ? `Bearer ${access}` : undefined };
  let resp = await fetch(`${API_URL}${path}`, { ...init, headers: hdrs });
  if (resp.status !== 401 || !refresh) return resp;
  const r = await fetch(`${API_URL}/accounts/auth/refresh`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ refresh }) });
  if (!r.ok) return resp;
  const j = await r.json(); tokenStore.setAccess(j.access); if (j.refresh) tokenStore.setRefresh(j.refresh);
  return fetch(`${API_URL}${path}`, { ...init, headers: { ...(init.headers||{}), Authorization: `Bearer ${j.access}` } });
}
```

Login example:

```ts
const resp = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/accounts/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password })});
const { access, refresh } = await resp.json();
tokenStore.setAccess(access); tokenStore.setRefresh(refresh);
```

---

## 7) WebSockets (Realtime)

**Channels route:** `ws://localhost:8000/ws/org/<org_id>/`

* Server emits messages like: `{ "type": "org.event", "data": { "topic": "inspection.update", "payload": {...} } }`

**Quick client:**

```ts
const ws = new WebSocket(`ws://localhost:8000/ws/org/${orgId}/`);
ws.onmessage = (ev) => {
  const data = JSON.parse(ev.data);
  if (data.topic === 'inspection.update') {
    // invalidate cache or merge update
  }
};
```

---

## 8) Pagination, Filtering, Errors

* **Pagination**: DRF PageNumber — `?page=1&page_size=20` (default size 20, max 200)
* **Filtering**: use query params (e.g., `/inspections?vehicle=<id>&driver=<id>&date_from=2025-09-01`)
* **Errors**: JSON `{ "detail": "message" }`, validation → `{ "field": ["error"] }`

---

## 9) Local Dev Matrix

* Backend: `python manage.py runserver` or Docker compose (Postgres, Redis, MinIO)
* Web: `pnpm dev` on port 3000
* Mobile: `pnpm start` (Expo) — use Android emulator/iOS simulator or device

When running on a **device**, ensure the API URL is reachable from your phone (use your machine LAN IP, e.g., `http://192.168.0.12:8000/api`).

---

## Getting Started (Monorepo)

1) Infra

```bash
docker compose up -d
```

2) Backend (Django)

```bash
cd fleet/apps/backend
python -m venv .venv && .venv/Scripts/activate  # Windows PowerShell use .venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env  # if needed; file exists with defaults
make migrate
make run
```

Open `http://localhost:8000/api/docs/`.

3) Web (Next.js)

```bash
cd fleet/apps/web
pnpm install
pnpm dev
```

4) Mobile (Expo)

```bash
cd fleet/apps/mobile
pnpm install
pnpm start
```

Troubleshooting

- CORS: ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000` in `fleet/apps/backend/.env`.
- Mobile on device: set `EXPO_PUBLIC_API_URL` to your LAN IP, e.g. `http://192.168.0.12:8000/api`.
- MinIO Console: `http://localhost:9001` (user/pass `minioadmin`). Bucket `fleet-photos` is auto-created.


---

## 10) OpenAPI → TypeScript Types (optional)

You can generate API types for web/mobile into `packages/types`.

```bash
pnpm add -D openapi-typescript
npx openapi-typescript http://localhost:8000/api/schema/ -o ../../packages/types/fleet.d.ts
```

Import in web:

```ts
import type { components } from '@fleet/types/fleet';
```

---

## 11) Roles & Permissions (frontend hints)

* **OWNER / MANAGER**: full CRUD on vehicles, inspections, issues, tickets
* **DRIVER**: can start/end shifts, create inspections, upload photos; **cannot** delete vehicles
* **VIEWER**: read-only

Use role from `GET /accounts/me` to conditionally render UI.

---

## 12) Quick cURL Samples

```bash
# Login
curl -s -X POST http://localhost:8000/api/accounts/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo"}'

# List vehicles (with token)
curl -s http://localhost:8000/api/fleet/vehicles \
  -H 'Authorization: Bearer <ACCESS>'

# Start shift
curl -s -X POST http://localhost:8000/api/inspections/shifts/start \
  -H 'Authorization: Bearer <ACCESS>' -H 'Content-Type: application/json' \
  -d '{"vehicle_id":1, "gps": {"lat": -33.9, "lng": 18.4}}'
```


