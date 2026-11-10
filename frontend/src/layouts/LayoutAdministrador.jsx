import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import WelcomePanel from '../components/comunes/WelcomePanel.jsx';
import logoInstitucion from '../assets/IVSS.svg';

export default function LayoutAdministrador({ children }) {
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
      {/* Barra de Navegación Superior */}
      <header className="bg-corporativo-oscuro border-b border-corporativo-borde/50 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between">

          {/* Logo y Título Institucional */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-sm flex items-center justify-center">
              <img
                src={logoInstitucion}
                alt="Logo Institución"
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
                  Panel Administrador
                </span>
              </div>
            </div>
          </div>

          {/* Enlaces de Navegación Centrales */}
          <nav className="hidden md:flex items-center gap-3">

            {/* Inicio */}
            <Link
              to="/admin"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/admin')
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30'
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Inicio
            </Link>

            {/* Departamentos */}
            <Link
              to="/admin/departamentos"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/admin/departamentos')
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30'
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Departamentos
            </Link>

            {/* Cargos */}
            <Link
              to="/admin/cargos"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/admin/cargos')
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30'
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Cargos
            </Link>

            {/* Usuarios */}
            <Link
              to="/admin/usuarios"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/admin/usuarios')
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30'
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Usuarios
            </Link>

            {/* Auditoría */}
            <Link
              to="/admin/auditoria"
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive('/admin/auditoria')
                  ? 'bg-corporativo-principal text-white shadow-sm ring-1 ring-corporativo-claro2/30'
                  : 'text-white/80 hover:text-white hover:bg-corporativo-principal/40'
              }`}
            >
              Auditoría
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

      {/* Menú móvil inferior */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-corporativo-oscuro/95 backdrop-blur-md border-t border-corporativo-borde/50 px-2 py-2 flex items-center justify-around shadow-lg">

        {/* Inicio */}
        <Link
          to="/admin"
          className={`text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-all ${
            isActive('/admin')
              ? 'bg-corporativo-principal text-white'
              : 'text-white/80'
          }`}
        >
          Inicio
        </Link>

        {/* Departamentos */}
        <Link
          to="/admin/departamentos"
          className={`text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-all ${
            isActive('/admin/departamentos')
              ? 'bg-corporativo-principal text-white'
              : 'text-white/80'
          }`}
        >
          Departamentos
        </Link>

        {/* Cargos */}
        <Link
          to="/admin/cargos"
          className={`text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-all ${
            isActive('/admin/cargos')
              ? 'bg-corporativo-principal text-white'
              : 'text-white/80'
          }`}
        >
          Cargos
        </Link>

        {/* Usuarios */}
        <Link
          to="/admin/usuarios"
          className={`text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-all ${
            isActive('/admin/usuarios')
              ? 'bg-corporativo-principal text-white'
              : 'text-white/80'
          }`}
        >
          Usuarios
        </Link>

        {/* Auditoría */}
        <Link
          to="/admin/auditoria"
          className={`text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-all ${
            isActive('/admin/auditoria')
              ? 'bg-corporativo-principal text-white'
              : 'text-white/80'
          }`}
        >
          Auditoría
        </Link>
      </div>

      {/* Contenido Principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}