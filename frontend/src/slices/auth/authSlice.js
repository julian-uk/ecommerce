import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// 1. Thunk: Register User (POST /auth/register)
export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
    try {
        const response = await API.post('/auth/register', userData);
        localStorage.setItem('token', response.data.token); // Save JWT to browser
        return response.data; // { token, user_id }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message || 'Registration failed');
    }
});

// 2. Thunk: Login User (POST /auth/login)
export const loginUser = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
    try {
        const response = await API.post('/auth/login', credentials);
        localStorage.setItem('token', response.data.token);
        return response.data; // { token, user_id }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message || 'Login failed');
    }
});

// 3. Thunk: Initial Auth Check (GET /auth/status)
// This is used when the user refreshes the page to see if their token is still valid
export const checkAuthStatus = createAsyncThunk('auth/checkStatus', async (_, thunkAPI) => {
    try {
        const response = await API.get('/auth/status');
        console.log("Auth Status Response:", response.data.user);
        return response.data.user; // Returns the full user object
    } catch (error) {
        localStorage.removeItem('token');
        return thunkAPI.rejectWithValue('Session expired');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('token'),
        isAuthenticated: false,
        loading: false,
        error: null,
    },
    reducers: {
        // authSlice.js
setCredentials: (state, action) => {
    state.token = action.payload.token;
    state.isAuthenticated = true;
    state.user = action.payload.user;
    localStorage.setItem('token', action.payload.token);
  },
        logout: (state) => {
            localStorage.removeItem('token');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle Check Auth Status
            .addCase(checkAuthStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.loading = false;
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            })
            // Handle Login
            .addCase(loginUser.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Handle Register
            .addCase(registerUser.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            });
    },
});

export const { logout, clearError,setCredentials } = authSlice.actions;
export default authSlice.reducer;