import { baseApi } from '@/lib/baseApi';
import { API_CONFIG } from '@/config/api';

export const inspectionsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    startShift: b.mutation<unknown, { vehicle_id: number; gps?: unknown }>({
      query: (body) => ({ url: API_CONFIG.ENDPOINTS.SHIFTS.START, method: 'POST', body }),
      invalidatesTags: ['Inspection', 'Shift'],
    }),
    endShift: b.mutation<unknown, { id: number; gps?: unknown }>({
      query: ({ id, ...rest }) => ({ url: API_CONFIG.ENDPOINTS.SHIFTS.END(id), method: 'POST', body: rest }),
      invalidatesTags: ['Inspection', 'Shift'],
    }),
    createInspection: b.mutation<unknown, { shift_id: number; type: 'START' | 'END' }>({
      query: (body) => ({ url: API_CONFIG.ENDPOINTS.INSPECTIONS.CREATE, method: 'POST', body }),
      invalidatesTags: ['Inspection'],
    }),
    completeInspection: b.mutation<unknown, { 
      id: number; 
      status: 'PASS' | 'FAIL';
      fuel_level?: number;
      odometer_km?: number;
      fuel_level_photo?: string;
      odometer_photo?: string;
    }>({
      query: ({ id, ...rest }) => ({ url: API_CONFIG.ENDPOINTS.INSPECTIONS.COMPLETE(id), method: 'POST', body: rest }),
      invalidatesTags: ['Inspection'],
    }),
    getInspectionDetails: b.query<unknown, { id: number }>({
      query: ({ id }) => ({ url: API_CONFIG.ENDPOINTS.INSPECTIONS.DETAIL(id) }),
      providesTags: ['Inspection'],
    }),
  }),
});

export const { 
  useStartShiftMutation, 
  useEndShiftMutation, 
  useCreateInspectionMutation, 
  useCompleteInspectionMutation,
  useGetInspectionDetailsQuery 
} = inspectionsApi;


