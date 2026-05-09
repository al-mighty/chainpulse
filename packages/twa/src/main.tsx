import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { App } from './App';
import './styles/twa.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl="https://cheslav.space/twa/tonconnect-manifest.json">
    <App />
  </TonConnectUIProvider>,
);
