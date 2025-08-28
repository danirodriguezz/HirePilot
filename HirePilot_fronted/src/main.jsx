import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import * as AuthPages from './pages/Auth';
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { routes } from './routes/routes.js'

const router = createBrowserRouter([
  {
    path: routes.home,
    element: <HomePage />,
  },
  {
    path: routes.notFound,
    element: <NotFoundPage />,
  },
  {
    path: routes.login,
    element: <AuthPages.LoginPage />,
  },
  {
    path: routes.register,
    element: <AuthPages.RegisterPage />
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
