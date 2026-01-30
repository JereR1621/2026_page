/**
 * Punto de entrada del cliente.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'


import './styles/base.css'
import './styles/app.css'
import './styles/carrera.css'
import './styles/malla.css'
import './styles/dynamic.css'
import './styles/organigrama.css'
import './styles/responsive.css'
import './styles/portal.css'


import App from './App.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
