import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import WelcomePanel from '../components/comunes/WelcomePanel.jsx';
import logoInstitucion from '../assets/IVSS.svg';

export default function LayoutRRHH({ children }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const isActive = (path) => location.pathname === path;
  return (
    <div className="min-h-screen bg-corporativo-fondo flex flex-col pb-16 md:pb-0">
      <WelcomePanel />
      <header className="bg-corporativo-oscuro border-b border-corporativo-borde/50 shadow-md sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-sm flex items-center justify-center">
              <img 
                src={logoInstitucion} 
                alt="Logo Clínica" 
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:block h-10 w-px bg-white/20"></div>
              <div>
                <span className="text-sm sm:text-lg font-bold text-white tracking-tight block leading-tight">
                  Clínica Popular tipo I "Nuestra Señora de la Paz"
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white opacity-80 block font-semibold mt-0.5">
                  Recursos Humanos
                </span>
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-3">
            <Link 
              to="/dashboard" 
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/dashboard') 
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30' 
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/dashboard/empleados" 
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/dashboard/empleados') 
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30' 
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Empleados
            </Link>

            <Link 
              to="/dashboard/horarios" 
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/dashboard/horarios') 
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30' 
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Horarios
            </Link>

            <Link 
              to="/dashboard/asistencia" 
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/dashboard/asistencia') 
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30' 
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Asistencia
            </Link>

            <Link 
              to="/dashboard/reportes" 
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/dashboard/reportes') 
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30' 
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Reportes
            </Link>
            <Link 
              to="/dashboard/estadisticas" 
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/dashboard/estadisticas') 
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30' 
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Estadisticas
            </Link>
          </nav>

          {/* Botón Salir */}
          <div>
            <button
              type="button"
              className="rounded-xl bg-corporativo-boton px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-corporativo-principal transition-all cursor-pointer shadow-sm border border-white/20"
              onClick={handleLogout}
            >
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>
      </header>
      
{/* Menú móvil */}
<nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-corporativo-oscuro border-t border-corporativo-borde/50 shadow-lg">
  <div className="grid grid-cols-6 items-stretch px-1 py-2">
    {[
      { label: 'Inicio', path: '/dashboard' },
      { label: 'Empleados', path: '/dashboard/empleados' },
      { label: 'Horarios', path: '/dashboard/horarios' },
      { label: 'Asistencia', path: '/dashboard/asistencia' },
      { label: 'Reportes', path: '/dashboard/reportes' },
      { label: 'Estadísticas', path: '/dashboard/estadisticas' },
    ].map(({ label, path }) => (
      <Link
        key={path}
        to={path}
        className={`flex min-w-0 items-center justify-center rounded-lg px-0.5 py-2 text-center text-[9px] font-semibold leading-tight transition-colors ${
          isActive(path)
            ? 'bg-corporativo-principal text-white'
            : 'text-white/80 hover:bg-corporativo-principal/40'
        }`}
      >
        <span className="block max-w-full truncate">
          {label}
        </span>
      </Link>
    ))}
  </div>
</nav>


      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}