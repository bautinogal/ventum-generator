import { configureStore } from '@reduxjs/toolkit';
import authSlice from './reducers/authSlice';
import dashboardSlice from '../pages/Dashboard/DashboardSlice';

const store = configureStore({ 
    reducer: { 
        auth: authSlice,
        dashboard: dashboardSlice,
    } 
})

export default store;