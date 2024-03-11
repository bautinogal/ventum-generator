import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from "react-redux";
import http from '../../lib/http/index.js';
//import { getPaginatedTable, getRowByPks, getTable } from '../../lib/tables/index.js';

export const getData = createAsyncThunk(
  'GET_CATEGORY_DATA',
  async (payload, thunkAPI) => {

    const addFkRows = async (tableRows, tableName, tableSchema, fkTableName) => {
      try {
        if (tableSchema.properties[fkTableName].type === 'object') {
          const fkTable = (await http.get(`/api/tables/${fkTableName}/rows`)).body;
          tableRows.forEach(row => row[fkTableName] = fkTable.find(fkRow => fkRow.id === row[fkTableName]));

        } else {
          const interTableName = tableName + fkTableName[0].toUpperCase() + fkTableName.slice(1) + 'Map';
          const interTable = (await http.get(`/api/tables/${interTableName}/rows`)).body;
          const fkTable = (await http.get(`/api/tables/${fkTableName}/rows`)).body;

          tableRows.forEach(row => {
            const tableRowId = tableSchema.name + 'Id'; //rolId
            const fkTableRowId = tableSchema.properties[fkTableName].items.name + 'Id'; //permissionId
            const interTableRows = interTable.filter(x => x[tableRowId] === row.id);
            const fkRows = interTableRows.map(interTableRow => fkTable.find(fkRow => fkRow.id === interTableRow[fkTableRowId]));
            row[fkTableName] = fkRows;
          });
        };
        return tableRows;
      } catch (error) {
        console.log(error)
      }
    };

    const { schema, catName } = payload;

    let tableRows = (await http.get(`/api/tables/${catName}/rows`)).body;
    const pks = ['id'];
    const fks = Object.entries(schema[catName]?.items?.properties || {})
      ?.filter(([k, v]) => (v.type === 'array' || v.type === 'object') && schema[k] != null)
      .map(x => x[0]);

    for (let i = 0; i < fks.length; i++) {
      tableRows = await addFkRows(tableRows, catName, schema[catName]?.items, fks[i]);
    };

    return { rows: tableRows, pks, fks };

  },
);

export const postRow = createAsyncThunk(
  'POST_CATEGORY_ROW',
  async (payload, thunkAPI) => {
    const { table, row, schema } = payload;
    let res = await http.post(`/api/tables/${table}`, {}, row);
    await thunkAPI.dispatch(getData({ schema, catName: table })).unwrap();
    return { res, message: `ID:${res.body?.id} insertado en ${table}` };
  },
);

const initialState = {
  fetching: 0,
  error: null,
  message: null,
  data: { rows: [], pks: [], fks: [] },
};

const genericCatSlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    cleanError: (state, action) => ({ ...state, error: null }),
    cleanMessage: (state, action) => ({ ...state, message: null }),
  },
  extraReducers: {
    [getData.pending]: (state, action) => ({ ...state, fetching: state.fetching + 1 }),
    [getData.rejected]: (state, action) => ({ ...state, error: action.error.message, fetching: state.fetching - 1 }),
    [getData.fulfilled]: (state, action) => ({ ...state, data: action.payload, fetching: state.fetching - 1 }),

    [postRow.pending]: (state, action) => ({ ...state, fetching: state.fetching + 1 }),
    [postRow.rejected]: (state, action) => ({ ...state, error: action.error.message, fetching: state.fetching - 1 }),
    [postRow.fulfilled]: (state, action) => ({ ...state, message: action.payload.message, fetching: state.fetching - 1 }),
  },
})

export const { cleanError, cleanMessage } = genericCatSlice.actions;
export default genericCatSlice.reducer;