import { baseApi } from '@/lib/baseApi';

export const inspectionsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    startShift: b.mutation<unknown, { vehicle_id: number; gps?: unknown }>({
      query: (body) => ({ url: '/inspections/shifts/start', method: 'POST', body }),
      invalidatesTags: ['Inspection'],
    }),
    endShift: b.mutation<unknown, { id: number; gps?: unknown }>({
      query: ({ id, ...rest }) => ({ url: `/inspections/shifts/${id}/end`, method: 'POST', body: rest }),
      invalidatesTags: ['Inspection'],
    }),
    createInspection: b.mutation<unknown, { shift_id: number; type: 'START' | 'END' }>({
      query: (body) => ({ url: '/inspections/', method: 'POST', body }),
      invalidatesTags: ['Inspection'],
    }),
    completeInspection: b.mutation<unknown, { id: number; status: 'PASS' | 'FAIL' }>({
      query: ({ id, ...rest }) => ({ url: `/inspections/${id}/complete`, method: 'POST', body: rest }),
      invalidatesTags: ['Inspection'],
    }),
  }),
});

export const { useStartShiftMutation, useEndShiftMutation, useCreateInspectionMutation, useCompleteInspectionMutation } = inspectionsApi;


