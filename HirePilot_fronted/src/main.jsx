// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './index.css'

import * as AuthPages from './pages/Auth';
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import Dashboard from './pages/Dashboard/index.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PublicRoute from './components/PublicRoute.jsx' 
import { routes } from './routes/routes.js'

// 1. IMPORTANTE: Importar las nuevas páginas legales
import PrivacyPolicy from './pages/Legal/PrivacyPolicy.jsx'
import TermsOfUse from './pages/Legal/TermsOfUse.jsx'
import HackathonDisclaimer from './pages/Legal/HackathonDisclaimer.jsx'

const router = createBrowserRouter([
  // ---------------------------------------------------------
  // 🌍 RUTAS GLOBALES (Accesibles para todos, logueados o no)
  // ---------------------------------------------------------
  {
    path: routes.home,
    element: <HomePage />,
  },
  {
    path: routes.privacy,
    element: <PrivacyPolicy />,
  },
  {
    path: routes.terms,
    element: <TermsOfUse />,
  },
  {
    path: routes.hackathonDisclaimer,
    element: <HackathonDisclaimer />,
  },
  
  // ---------------------------------------------------------
  // 🔒 RUTAS PÚBLICAS RESTRINGIDAS (Solo si NO estás logueado)
  // ---------------------------------------------------------
  {
    element: <PublicRoute />, 
    children: [
      {
        path: routes.login,
        element: <AuthPages.LoginPage />,
      },
      {
        path: routes.register,
        element: <AuthPages.RegisterPage />
      },
      {
        path: routes.verifyEmail,
        element: <AuthPages.VerifyEmail />,
      }
    ]
  },

  // ---------------------------------------------------------
  // 🔐 RUTAS PRIVADAS (Solo accesibles SI estás logueado)
  // ---------------------------------------------------------
  {
    path: routes.dashboard,
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },

  // Ruta 404
  {
    path: routes.notFound,
    element: <NotFoundPage />,
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster position="top-right" reverseOrder={false} />
    <RouterProvider router={router} />
  </StrictMode>,
)