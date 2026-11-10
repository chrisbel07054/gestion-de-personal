import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, rol } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Normalizamos el rol del usuario y los roles permitidos a mayúsculas
  const rolActual = rol ? String(rol).trim().toUpperCase() : '';
  const rolesNormalizados = allowedRoles.map((r) => String(r).trim().toUpperCase());

  if (rolesNormalizados.length > 0 && !rolesNormalizados.includes(rolActual)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}