import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import StoreContextProvider from './context/StoreContext.jsx'
import { Route, BrowserRouter, Routes } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
    </BrowserRouter>
    
    
  </StrictMode>,
)
