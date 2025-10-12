import { baseApi } from '@/lib/baseApi';

export const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listVehicles: b.query<unknown, { page?: number; search?: string } | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args && 'page' in args && args.page) params.set('page', String(args.page));
        if (args && 'search' in args && args.search) params.set('search', String(args.search));
        const qs = params.toString();
        return `/fleet/vehicles${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Vehicle'],
    }),
    createVehicle: b.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({ url: '/fleet/vehicles', method: 'POST', body }),
      invalidatesTags: ['Vehicle'],
    }),
    updateVehicle: b.mutation<unknown, { id: number; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/fleet/vehicles/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Vehicle'],
    }),
  }),
});

export const { useListVehiclesQuery, useCreateVehicleMutation, useUpdateVehicleMutation } = vehiclesApi;


