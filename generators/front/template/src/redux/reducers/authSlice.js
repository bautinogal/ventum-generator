import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
//import http from '../utils/http';
const http = fetch;

export const getDetectores = createAsyncThunk(
  'GET_DETECTORES',
  async (payload, thunkAPI) => await http.GET('/detectores'),
);

export const postDetectores = createAsyncThunk(
  'POST_DETECTORES',
  async (payload, thunkAPI) => {
    let res = await http.POST('/detectores', payload);
    thunkAPI.dispatch(getDetectores());
    return res;
  }
);

export const deleteDetectores = createAsyncThunk(
  'DEL_DETECTORES',
  async (payload, thunkAPI) => {
    let res = await http.DELETE(`/detectores/?ids=${payload.join(',')}`);
    thunkAPI.dispatch(getDetectores());
    return res;
  }
);

export const editDetectores = createAsyncThunk(
  'EDIT_DETECTORES',
  async (payload, thunkAPI) => {
    let res = await http.PATCH('/detectores', payload);
    thunkAPI.dispatch(getDetectores());
    return res;
  }
);

const initialState = {
  fetchingDetectores: 0,
  errorDetectores: null,
  messageDetectores: null,
  detectores: [],
};

const detectoresSlice = createSlice({
  name: 'detectoresCat',
  initialState,
  reducers: {
    cleanError: (state, action) => ({ ...state, errorDetectores: null }),
    cleanMessage: (state, action) => ({ ...state, messageDetectores: null }),
  },
  extraReducers: {
    [getDetectores.pending]: (state, action) => ({ ...state, fetchingDetectores: state.fetchingDetectores + 1 }),
    [getDetectores.rejected]: (state, action) => ({ ...state, fetchingDetectores: state.fetchingDetectores - 1 }),
    [getDetectores.fulfilled]: (state, action) => ({ ...state, detectores: action.payload.body, fetchingDetectores: state.fetchingDetectores - 1 }),

    [postDetectores.pending]: (state, action) => ({ ...state, fetchingDetectores: state.fetchingDetectores + 1 }),
    [postDetectores.rejected]: (state, action) => ({ ...state, fetchingDetectores: state.fetchingDetectores - 1, errorDetectores: "No se pudo agergar el Detectore." }),
    [postDetectores.fulfilled]: (state, action) => ({
      ...state,
      fetchingDetectores: state.fetchingDetectores - 1,
      messageDetectores: action.payload.status === 200 ? "Detectore agregado!" : null,
      errorDetectores: action.payload.status != 200 ? "No se pudo agergar el Detectore." : null,
    }),

    [deleteDetectores.pending]: (state, action) => ({ ...state, fetchingDetectores: state.fetchingDetectores + 1 }),
    [deleteDetectores.rejected]: (state, action) => ({ ...state, fetchingDetectores: state.fetchingDetectores - 1, errorDetectores: "No se pudieron eliminar los detectores!" }),
    [deleteDetectores.fulfilled]: (state, action) => ({
      ...state,
      fetchingDetectores: state.fetchingDetectores - 1,
      messageDetectores: action.payload.status === 200 ? "Detectores eliminados!" : null,
      errorDetectores: action.payload.status != 200 ? "No se pudieron eliminar los detectores!" : null,
    }),

    [editDetectores.pending]: (state, action) => ({ ...state, fetchingDetectores: state.fetchingDetectores + 1 }),
    [editDetectores.rejected]: (state, action) => ({ ...state, fetchingDetectores: state.fetchingDetectores - 1, errorDetectores: "No se pudieron editar los detectores!" }),
    [editDetectores.fulfilled]: (state, action) => ({
      ...state,
      fetchingDetectores: state.fetchingDetectores - 1,
      messageDetectores: action.payload.status === 200 ? "Detectores editados!" : null,
      errorDetectores: action.payload.status != 200 ? "No se pudieron editar los detectores!" : null,
    })
  },
})

export const { cleanError, cleanMessage } = detectoresSlice.actions
export default detectoresSlice.reducer;