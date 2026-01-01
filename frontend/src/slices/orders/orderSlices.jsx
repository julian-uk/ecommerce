import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchAllUserOrders = createAsyncThunk(
  'orders/fetchAllUserOrders',
  async () => {
    try {
      const response = await API.get('/orders');
      return response.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Could not fetch orders');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [], // Ensure this is an empty array
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        // FIX: Force payload to be an array. If it's an object with a data property, use that.
        const data = action.payload;
        state.orders = Array.isArray(data) ? data : (data.orders || data.data || []);
      })
      .addCase(fetchAllUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orders = []; // Reset to empty array on error to prevent .map crashes
      });
  },
});

export default orderSlice.reducer;