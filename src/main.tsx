import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { checkStorageVersion } from './app/storageVersion';
import './styles.css';

checkStorageVersion();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
