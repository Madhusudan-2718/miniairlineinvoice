import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import api from './services/api'

async function bootstrap() {
  try {
    await api.post('/reset');
  } catch (e) {
    // ignore if backend not ready yet
  }
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

bootstrap() 