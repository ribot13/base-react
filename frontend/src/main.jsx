import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

// Import CSS global Anda (jika ada)
import './styles/theme.css'; 
import './styles/global.css'; 
import "./styles/LoginPage.css";
import './index.css';
import './styles/components/ui-components.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
