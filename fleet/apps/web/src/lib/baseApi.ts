import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/config/api';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth?: { access?: string } };
      const token: string | undefined = state?.auth?.access;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
    timeout: API_CONFIG.TIMEOUT,
  }),
  tagTypes: ['Vehicle', 'Inspection', 'Ticket', 'User', 'Shift', 'Issue', 'Upload'],
  endpoints: () => ({}),
});


