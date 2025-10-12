import { baseApi } from '@/lib/baseApi';

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    listTickets: b.query<unknown, void>({
      query: () => '/tickets/tickets',
      providesTags: ['Ticket'],
    }),
    updateTicket: b.mutation<unknown, { id: number; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/tickets/tickets/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Ticket'],
    }),
  }),
});

export const { useListTicketsQuery, useUpdateTicketMutation } = ticketsApi;


