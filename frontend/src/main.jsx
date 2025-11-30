import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Import CSS global Anda (jika ada)
import './styles/global.css'; 
import "./styles/LoginPage.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
