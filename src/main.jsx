import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Admin paneli yalnızca /admin yolunda yüklenir (firebase/auth + dashboard kodu
// public ziyaretçilere gönderilmez -> daha küçük bundle, daha iyi Core Web Vitals).
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

// Basit yol tabanlı yönlendirme: /admin -> yönetim paneli, aksi halde site.
const isAdmin = window.location.pathname.replace(/\/+$/, '').toLowerCase().endsWith('/admin')
  || window.location.pathname.toLowerCase() === '/admin';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#030712' }} />}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
