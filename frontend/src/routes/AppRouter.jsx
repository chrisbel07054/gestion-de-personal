import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

// Páginas generales
import LoginPage from '../pages/LoginPage.jsx';

// Administrador
import AdminPage from '../pages/AdminPage.jsx';
import DepartamentosPage from '../pages/DepartamentosPage.jsx';
import CargosPage from '../pages/CargosPage.jsx';
import UsuariosPage from '../pages/UsuariosPage.jsx';
import AuditoriaPage from '../pages/AuditoriaPage.jsx';

// Recursos Humanos
import DashboardPage from '../pages/DashboardPage.jsx';
import EmpleadosPage from '../pages/EmpleadosPage.jsx';
import EmpleadoPage from '../pages/EmpleadoPage.jsx';
import HorariosPage from '../pages/HorariosPage.jsx';
import AsistenciaPage from '../pages/AsistenciaPage.jsx';
import ReportesPage from '../pages/ReportesPage.jsx';
import EstadisticasPage from '../pages/EstadisticasPage.jsx';

// Operador
import OperadorPage from '../pages/OperadorPage.jsx';

// Protección
import ProtectedRoute from './ProtectedRoute.jsx';


function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-sm p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          No autorizado
        </h1>

        <p className="mt-3 text-slate-600">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    </div>
  );
}

export default function AppRouter() {
  const {
    isAuthenticated,
    rol,
    _hasHydrated
  } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="text-sm font-medium text-slate-600">
          Cargando sesión...
        </div>
      </div>
    );
  }

  /* Ruta inicial según el rol autenticado. */
  const getRedirectPath = () => {
    if (rol === 'ADMINISTRADOR') {
      return '/admin';
    }

    if (rol === 'RRHH') {
      return '/dashboard';
    }

    if (rol === 'OPERADOR') {
      return '/operador';
    }

    return '/login';
  };

  return (
    <Routes>

      {/* LOGIN */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={getRedirectPath()} replace />
            : <LoginPage />
        }
      />

      {/* ADMINISTRADOR */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={['ADMINISTRADOR']}
          />
        }
      >
        <Route
        path="/admin"
        element={<AdminPage />}
        />
        <Route
          path="/admin/departamentos"
          element={<DepartamentosPage />}
        />
        <Route
          path="/admin/cargos"
          element={<CargosPage />}
        />
        <Route
          path="/admin/usuarios"
          element={<UsuariosPage />}
        />
        <Route
          path="/admin/auditoria"
          element={<AuditoriaPage />}
        />
      </Route>

      {/*  RECURSOS HUMANOS */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={['RRHH', 'ADMINISTRADOR']}
          />
        }
      >
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
        <Route
          path="/dashboard/empleados"
          element={<EmpleadosPage />}
        />
        <Route
          path="/dashboard/empleados/:id"
          element={<EmpleadoPage />}
        />
        <Route
          path="/dashboard/horarios"
          element={<HorariosPage />}
        />
        <Route
          path="/dashboard/asistencia"
          element={<AsistenciaPage />}
        />
        <Route
          path="/dashboard/reportes"
          element={<ReportesPage />}
        />
        <Route
          path="/dashboard/estadisticas"
          element={<EstadisticasPage />}
        />
      </Route>
      {/* OPERADOR DE REGISTRO */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={['OPERADOR']}
          />
        }
      >
        <Route
          path="/operador"
          element={<OperadorPage />}
        />
      </Route>

      {/* SIN AUTORIZACIÓN */}
      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />

      {/* RUTA NO EXISTENTE */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated
                ? getRedirectPath()
                : '/login'
            }
            replace
          />
        }
      />

    </Routes>
  );
}