import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { App } from './App';
import './styles/tokens.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl="https://cheslav.space/chainpulse/tonconnect-manifest.json">
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);
