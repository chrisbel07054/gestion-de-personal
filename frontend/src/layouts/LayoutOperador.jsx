import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import WelcomePanel from '../components/comunes/WelcomePanel.jsx';
import logoInstitucion from '../assets/IVSS.svg';

export default function LayoutOperador({ children }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-corporativo-fondo flex flex-col pb-16 md:pb-0">
      <WelcomePanel />
      {/* Barra superior */}
      <header className="bg-corporativo-oscuro border-b border-corporativo-borde/50 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between">
          {/* Logo y título */}
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
                  Clínica Popular tipo 1 &quot;Nuestra Señora de la Paz&quot;
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white opacity-80 block font-semibold mt-0.5">
                  Operador de Registro
                </span>
              </div>
            </div>
          </div>

          {/* Identificación del módulo + salir */}
          <div className="flex items-center gap-3">
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

      {/* Contenido principal */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Pie móvil */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-corporativo-oscuro/95 backdrop-blur-md border-t border-corporativo-borde/50 px-4 py-3 flex items-center justify-center shadow-lg">
        <span className="text-xs font-semibold text-white/80">
          Operador de Registro
        </span>
      </div>
    </div>
  );
}