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
import PublicRoute from './components/PublicRoute.jsx' // 1. IMPORTANTE: Importar el componente
import { routes } from './routes/routes.js'

const router = createBrowserRouter([
  // Ruta base (accesible para todos)
  {
    path: routes.home,
    element: <HomePage />,
  },
  
  // ---------------------------------------------------------
  // 🔒 RUTAS PÚBLICAS (Solo accesibles si NO estás logueado)
  // ---------------------------------------------------------
  {
    element: <PublicRoute />, // El componente padre que evalúa el token
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
        // verifyEmail también suele ser pública, un usuario logueado 
        // rara vez necesita entrar aquí manualmente con un link
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