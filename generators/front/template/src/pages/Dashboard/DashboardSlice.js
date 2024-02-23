import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from "react-redux";
import http from '../../lib/http/index.js';
//import { getPaginatedTable, getRowByPks, getTable } from '../../lib/tables/index.js';

export const getData = createAsyncThunk(
  'GET_DASHBOARD_DATA',
  async (payload, thunkAPI) => ({
    schema: (await http.get('/api/schema')).body,
    //user: await http.get('/api/user'),
  }),
);

const initialState = {
  fetching: 0,
  error: null,
  message: null,
  selectedCat: null,
  isExpanded: false,
  data: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setSelectedCat: (state, action) => ({ ...state, selectedCat: action.payload }),
    setIsExpanded: (state, action) => ({ ...state, isExpanded: action.payload }),
    cleanError: (state, action) => ({ ...state, error: null }),
    cleanMessage: (state, action) => ({ ...state, message: null }),
  },
  extraReducers: {
    [getData.pending]: (state, action) => ({ ...state, fetching: state.fetching + 1 }),
    [getData.rejected]: (state, action) => ({ ...state, fetching: state.fetching - 1 }),
    [getData.fulfilled]: (state, action) => ({
      ...state, data: action.payload,
      selectedCat: Object.keys(action.payload.schema)[0], fetching: state.fetching - 1
    }),

  },
})

export const { setSelectedCat, setIsExpanded, cleanError, cleanMessage } = dashboardSlice.actions;
export default dashboardSlice.reducer;