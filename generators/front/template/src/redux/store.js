import { configureStore } from '@reduxjs/toolkit';
import authSlice from './reducers/authSlice';
import dashboardSlice from '../pages/Dashboard/DashboardSlice';
import genericCatSlice from '../components/GenericCatSlice';

const store = configureStore({ 
    reducer: { 
        auth: authSlice,
        dashboard: dashboardSlice,
        genericCat: genericCatSlice,
    } 
})

export default store;