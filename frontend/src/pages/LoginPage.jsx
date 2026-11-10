import { Navigate } from 'react-router-dom';
import logoInstitucion from '../assets/IVSS.svg';
import useLogin from '../hooks/useLogin.js';

export default function LoginPage() {
  const {
    form,
    error,
    isAuthenticated,
    isLoading,
    destinoAutenticado,
    handleChange,
    handleSubmit,
  } = useLogin();

  if (isAuthenticated) {
    return <Navigate to={destinoAutenticado} replace />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-corporativo-fondo px-4 py-6 sm:px-6 sm:py-8">
      <section className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 sm:p-8 border border-corporativo-borde">
        <div className="mb-6 sm:mb-8 text-center flex flex-col items-center">
          <img src={logoInstitucion} alt="Logo Institución" className="h-16 sm:h-20 w-auto mb-3 sm:mb-4 object-contain" />
          <h1 className="text-2xl sm:text-3xl font-bold text-corporativo-oscuro leading-tight">
            Gestión Personal
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm text-corporativo-boton">
            Iniciar sesión
          </p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-corporativo-principal" htmlFor="usuario">
              Usuario
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              value={form.usuario}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-corporativo-borde px-4 py-3 text-sm sm:text-base outline-none focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde bg-white text-corporativo-oscuro"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-corporativo-principal" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-corporativo-borde px-4 py-3 text-sm sm:text-base outline-none focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde bg-white text-corporativo-oscuro"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-sm text-corporativo-boton font-medium flex items-start gap-1.5 animate-fadeIn">
              <span className="break-words">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-corporativo-principal px-4 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm cursor-pointer text-sm sm:text-base"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
}