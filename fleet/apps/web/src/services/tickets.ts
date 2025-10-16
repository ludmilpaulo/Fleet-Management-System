import { baseApi } from '@/lib/baseApi';
import { API_CONFIG } from '@/config/api';

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listTickets: b.query<unknown, void>({
      query: () => API_CONFIG.ENDPOINTS.TICKETS.LIST,
      providesTags: ['Ticket'],
    }),
    createTicket: b.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({ url: API_CONFIG.ENDPOINTS.TICKETS.CREATE, method: 'POST', body }),
      invalidatesTags: ['Ticket'],
    }),
    updateTicket: b.mutation<unknown, { id: number; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: API_CONFIG.ENDPOINTS.TICKETS.UPDATE(id), method: 'PATCH', body }),
      invalidatesTags: ['Ticket'],
    }),
    getTicket: b.query<unknown, { id: number }>({
      query: ({ id }) => ({ url: API_CONFIG.ENDPOINTS.TICKETS.DETAIL(id) }),
      providesTags: ['Ticket'],
    }),
  }),
});

export const { 
  useListTicketsQuery, 
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useGetTicketQuery
} = ticketsApi;


