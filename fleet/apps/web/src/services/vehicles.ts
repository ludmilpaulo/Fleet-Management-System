import { baseApi } from '@/lib/baseApi';
import { API_CONFIG } from '@/config/api';

export const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listVehicles: b.query<unknown, { page?: number; search?: string } | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args && 'page' in args && args.page) params.set('page', String(args.page));
        if (args && 'search' in args && args.search) params.set('search', String(args.search));
        const qs = params.toString();
        return `${API_CONFIG.ENDPOINTS.VEHICLES.LIST}${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Vehicle'],
    }),
    createVehicle: b.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({ url: API_CONFIG.ENDPOINTS.VEHICLES.CREATE, method: 'POST', body }),
      invalidatesTags: ['Vehicle'],
    }),
    updateVehicle: b.mutation<unknown, { id: number; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: API_CONFIG.ENDPOINTS.VEHICLES.UPDATE(id), method: 'PATCH', body }),
      invalidatesTags: ['Vehicle'],
    }),
    getVehicle: b.query<unknown, { id: number }>({
      query: ({ id }) => ({ url: API_CONFIG.ENDPOINTS.VEHICLES.DETAIL(id) }),
      providesTags: ['Vehicle'],
    }),
    deleteVehicle: b.mutation<unknown, { id: number }>({
      query: ({ id }) => ({ url: API_CONFIG.ENDPOINTS.VEHICLES.DELETE(id), method: 'DELETE' }),
      invalidatesTags: ['Vehicle'],
    }),
  }),
});

export const { 
  useListVehiclesQuery, 
  useCreateVehicleMutation, 
  useUpdateVehicleMutation,
  useGetVehicleQuery,
  useDeleteVehicleMutation
} = vehiclesApi;


