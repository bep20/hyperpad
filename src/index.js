import React from 'react';
import ConfigProvider from 'antd/es/config-provider';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AppContextProvider } from './context/AppStore';
import { NotifyContextProvider } from './context/Notify';
import QueryProvider from './context/Query';

const root = createRoot(document.getElementById('root'));
root.render(
  <AppContextProvider>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#9700ec',
          fontFamily: 'Outfit',
          letterSpacing: '1px',
        },
        compaonents: {
          Collapse: {
            headerBg: '#dacaff',
            headerPadding: '1rem',
          },
        },
      }}>
      <QueryProvider>
        <NotifyContextProvider>
          <App />
        </NotifyContextProvider>
      </QueryProvider>
    </ConfigProvider>
  </AppContextProvider>,
);

// image
// main => Redefining meaning of stonks
// subtitle => One Stonk at a time
// Radiym() DexScreener() BirdEye()
