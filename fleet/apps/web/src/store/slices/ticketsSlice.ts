import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ticketAPI } from '@/lib/api'

export interface Ticket {
  id: number
  issue: number
  assignee?: number
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  due_at?: string
  created_at: string
  updated_at: string
}

export interface TicketStats {
  total: number
  by_status: Record<string, number>
  by_priority: Record<string, number>
  open_tickets: number
  urgent_tickets: number
  overdue_tickets: number
}

interface TicketsState {
  tickets: Ticket[]
  stats: TicketStats | null
  loading: boolean
  error: string | null
}

const initialState: TicketsState = {
  tickets: [],
  stats: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async () => {
    const response = await ticketAPI.list()
    return response.data
  }
)

export const fetchTicketStats = createAsyncThunk(
  'tickets/fetchTicketStats',
  async () => {
    const response = await ticketAPI.stats()
    return response.data
  }
)

export const createTicket = createAsyncThunk(
  'tickets/createTicket',
  async (ticketData: Partial<Ticket>) => {
    const response = await ticketAPI.create(ticketData)
    return response.data
  }
)

export const updateTicket = createAsyncThunk(
  'tickets/updateTicket',
  async ({ id, data }: { id: number; data: Partial<Ticket> }) => {
    const response = await ticketAPI.update(id.toString(), data)
    return response.data
  }
)

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch tickets'
      })
      
      // Fetch ticket stats
      .addCase(fetchTicketStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTicketStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchTicketStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch ticket stats'
      })
      
      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false
        state.tickets.unshift(action.payload)
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create ticket'
      })
      
      // Update ticket
      .addCase(updateTicket.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.loading = false
        const index = state.tickets.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tickets[index] = action.payload
        }
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update ticket'
      })
  },
})

export const { clearError, setLoading } = ticketsSlice.actions
export default ticketsSlice.reducer
