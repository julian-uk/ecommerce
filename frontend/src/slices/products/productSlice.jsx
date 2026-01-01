import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  const response = await API.get('/products'); // We will create this backend route next
  return response.data;
});

export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (productId, { rejectWithValue }) => {
      try {
        await API.delete(`/products/${productId}`);
        return productId; // Return the ID so we can filter it out of the state
      } catch (err) {
        return rejectWithValue(err.response.data);
      }
    }
  );

  // Add this thunk to your productSlice.js
export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, updates }, { rejectWithValue }) => {
      try {
        const response = await API.patch(`/products/${id}`, updates);
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response.data);
      }
    }
  );


const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      }).addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload; // Update the item in the list
        }
      });
  },
});

export default productSlice.reducer;