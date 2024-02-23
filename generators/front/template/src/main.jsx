import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
import store from "./redux/store";
import Pages from './pages/Pages.jsx';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import themeParams from './theme.js';
import { config } from './lib/auth0/index.js'
import { Auth0Provider } from "@auth0/auth0-react";


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider {...config} >
      <Provider store={store}>
        <ThemeProvider theme={createTheme(themeParams)}>
          <CssBaseline />
          <Pages />
        </ThemeProvider>
      </Provider>
    </Auth0Provider>
  </React.StrictMode>
);