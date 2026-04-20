import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
const BACKENDURL = import.meta.env.VITE_BACKENDURL;

import { loadThemeFromStorage } from './themeUtils.js';

import { DialogProvider } from './components/DialogProvider.jsx';

// 🔥 LOAD THEME FROM STORAGE BEFORE REACT
loadThemeFromStorage();
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <DialogProvider>
      <App />
    </DialogProvider>
  </BrowserRouter>
);