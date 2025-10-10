import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { issueAPI } from '@/lib/api'

export interface Issue {
  id: number
  vehicle: number
  inspection_item?: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  created_at: string
  updated_at: string
}

export interface IssueStats {
  total: number
  by_status: Record<string, number>
  by_severity: Record<string, number>
  open_issues: number
  critical_issues: number
}

interface IssuesState {
  issues: Issue[]
  stats: IssueStats | null
  loading: boolean
  error: string | null
}

const initialState: IssuesState = {
  issues: [],
  stats: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async () => {
    const response = await issueAPI.list()
    return response.data
  }
)

export const fetchIssueStats = createAsyncThunk(
  'issues/fetchIssueStats',
  async () => {
    const response = await issueAPI.stats()
    return response.data
  }
)

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (issueData: Partial<Issue>) => {
    const response = await issueAPI.create(issueData)
    return response.data
  }
)

export const updateIssue = createAsyncThunk(
  'issues/updateIssue',
  async ({ id, data }: { id: number; data: Partial<Issue> }) => {
    const response = await issueAPI.update(id.toString(), data)
    return response.data
  }
)

const issuesSlice = createSlice({
  name: 'issues',
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
      // Fetch issues
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false
        state.issues = action.payload
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch issues'
      })
      
      // Fetch issue stats
      .addCase(fetchIssueStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIssueStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchIssueStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch issue stats'
      })
      
      // Create issue
      .addCase(createIssue.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.loading = false
        state.issues.unshift(action.payload)
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create issue'
      })
      
      // Update issue
      .addCase(updateIssue.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateIssue.fulfilled, (state, action) => {
        state.loading = false
        const index = state.issues.findIndex(i => i.id === action.payload.id)
        if (index !== -1) {
          state.issues[index] = action.payload
        }
      })
      .addCase(updateIssue.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update issue'
      })
  },
})

export const { clearError, setLoading } = issuesSlice.actions
export default issuesSlice.reducer
