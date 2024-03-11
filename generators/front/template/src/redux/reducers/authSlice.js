import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import http from '../../lib/http/index.js';

export const signIn = createAsyncThunk(
  'SIGN_IN',
  async (payload, thunkAPI) => {
    const res = (await http.post(`/api/authenticate`, {}, payload));
    if(res.status !== 200 && res.status !== 304) throw new Error(res?.body?.error);
    return res.body;
  },
);

const initialState = {
  fetching: 0,
  error: null,
  message: null,
  data: { jwt: null, permissions: [], rols: [], user: null },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut: (state, action) => ({ ...state, data: { jwt: null, permissions: [], rols: [], user: null }}),
    cleanError: (state, action) => ({ ...state, error: null }),
    cleanMessage: (state, action) => ({ ...state, message: null }),
  },
  extraReducers: {
    [signIn.pending]: (state, action) => ({ ...state, fetching: state.fetching + 1 }),
    [signIn.rejected]: (state, action) => ({ ...state, error: action.error.message, fetching: state.fetching - 1 }),
    [signIn.fulfilled]: (state, action) => ({ ...state, data: action.payload, fetching: state.fetching - 1 }),
  },
})

export const { cleanError, cleanMessage, signOut } = authSlice.actions;
export default authSlice.reducer;