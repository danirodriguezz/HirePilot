import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  // Verificamos si existe el token en el localStorage
  const isAuthenticated = !!localStorage.getItem("access_token");

  // Si el usuario ya está logueado, lo expulsamos de aquí hacia el dashboard
  // Usamos replace: true para no ensuciar el historial de navegación (botón "Atrás")
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está logueado, le permitimos ver el componente hijo (Outlet)
  return <Outlet />;
};

export default PublicRoute;