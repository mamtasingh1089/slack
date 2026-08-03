import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// This creates and exports the async thunk, which fixes the "export not found" error.
export const fetchActivitiesForUser = createAsyncThunk(
  'activity/fetchForUser',
  async ({ userId, workspaceId, unreadOnly }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/activity/user/${userId}/workspace/${workspaceId}?unreadOnly=${unreadOnly}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivitiesForUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchActivitiesForUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchActivitiesForUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default activitySlice.reducer;