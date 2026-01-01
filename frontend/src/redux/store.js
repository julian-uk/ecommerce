import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth/authSlice';
import cartReducer from '../slices/cart/cartSlice';
import productReducer from '../slices/products/productSlice';
import orderReducer from '../slices/orders/orderSlices';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        products: productReducer,
        orders: orderReducer,
    },
});