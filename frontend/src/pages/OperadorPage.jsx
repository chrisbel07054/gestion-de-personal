import LayoutOperador from '../layouts/LayoutOperador.jsx';
import logoInstitucion from '../assets/IVSS.svg';
import useOperador from '../hooks/useOperador.js';

export default function OperadorPage() {
  const {
    cedula,
    setCedula,
    empleado,
    observacion,
    setObservacion,
    loading,
    userName,
    obtenerUrlFoto,
    obtenerNombreDepartamento,
    obtenerNombreCargo,
    renderizarDias,
    buscarEmpleado,
    registrarAsistencia,
  } = useOperador();

  const fotoUrl = empleado ? obtenerUrlFoto(empleado.foto) : '';

  return (
    <LayoutOperador>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Cabecera */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-corporativo-borde shadow-sm">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={logoInstitucion}
                alt="Logo Institución"
                className="h-14 w-auto object-contain shrink-0"
              />

              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-corporativo-oscuro tracking-tight leading-tight">
                  Registro de Asistencia
                </h1>

                <div className="hidden sm:flex mt-1 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-corporativo-boton">
                  <span>Control de entrada y salida del personal</span>
                </div>
              </div>
            </div>

            <div className="sm:hidden mt-1 text-sm text-corporativo-boton leading-relaxed">
              Control de entrada y salida del personal
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3.5 py-2 text-xs font-bold text-corporativo-oscuro whitespace-nowrap">
              {userName}
            </div>
          </div>
        </div>

        {/* Búsqueda de empleado */}
        <div className="bg-white rounded-3xl border border-corporativo-borde/40 shadow-sm p-6">
          <form
            onSubmit={buscarEmpleado}
            noValidate
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="Ingrese número de cédula ..."
              value={cedula}
              onChange={(e) => {
                const soloNumeros = e.target.value
                  .replace(/\D/g, '')
                  .slice(0, 8);

                setCedula(soloNumeros);
              }}
              className="flex-1 min-w-0 rounded-xl border border-corporativo-borde/40 px-4 py-3 text-base bg-white text-corporativo-oscuro outline-none focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde transition-all"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-xl bg-corporativo-principal px-8 py-3 text-base font-semibold text-white hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-md transition-all"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

        {/* Información del empleado */}
        {empleado && (
          <div className="bg-white rounded-3xl border border-corporativo-borde/40 shadow-md p-4 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 md:gap-8 w-full">
              {/* Foto */}
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Foto empleado"
                  className="w-24 h-32 sm:w-28 sm:h-36 md:w-40 md:h-48 rounded-2xl object-cover object-center border-2 border-corporativo-principal/60 shadow-md shrink-0"
                />
              ) : (
                <div className="w-24 h-32 sm:w-28 sm:h-36 md:w-40 md:h-48 rounded-2xl bg-corporativo-fondo border border-corporativo-principal/30 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl shadow-inner shrink-0">
                  👤
                </div>
              )}

              {/* Datos del empleado */}
              <div className="min-w-0 space-y-2 sm:space-y-3 md:space-y-4 flex-1 w-full text-center sm:text-left flex flex-col justify-center">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-corporativo-oscuro tracking-tight leading-tight break-words">
                    {empleado.nombre} {empleado.apellido}
                  </h2>

                  <p className="text-xs sm:text-sm font-bold text-corporativo-boton tracking-wide uppercase mt-1">
                    Cédula:{' '}
                    <span className="font-semibold text-corporativo-oscuro">
                      {empleado.cedula}
                    </span>
                  </p>
                </div>

                <div className="pt-2 border-t border-corporativo-borde/60 space-y-1.5 text-xs sm:text-sm max-w-lg mx-auto sm:mx-0 w-full">
                  {/* Cargo */}
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="font-semibold text-corporativo-boton flex items-center gap-1 shrink-0">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-corporativo-principal"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Cargo:
                    </span>

                    <span className="font-bold text-corporativo-oscuro truncate text-right sm:text-left">
                      {obtenerNombreCargo(empleado)}
                    </span>
                  </div>

                  {/* Departamento */}
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="font-semibold text-corporativo-boton flex items-center gap-1 shrink-0">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-corporativo-principal"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Departamento:
                    </span>

                    <span className="font-bold text-corporativo-oscuro truncate text-right sm:text-left">
                      {obtenerNombreDepartamento(empleado)}
                    </span>
                  </div>

                  {/* Horario */}
                  {empleado.horario && (
                    <div className="flex items-start justify-between sm:justify-start gap-4">
                      <span className="font-semibold text-corporativo-boton flex items-start gap-1 shrink-0">
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-corporativo-principal"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Horario:
                      </span>

                      <span className="font-bold text-corporativo-oscuro text-right sm:text-left break-words">
                        {empleado.horario.horaEntrada} - {empleado.horario.horaSalida}

                        {empleado.horario.diasLaborales && (
                          <span className="text-xs sm:text-sm text-corporativo-boton ml-1 font-medium">
                            ({renderizarDias(empleado.horario.diasLaborales)})
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Observación y botones */}
            <div className="space-y-4 pt-6 border-t border-corporativo-borde/30">
              <div>
                <label className="block text-xs font-bold text-corporativo-boton uppercase tracking-wider mb-2">
                  Observación de asistencia (Opcional)
                </label>

                <textarea
                  placeholder="Escriba alguna observación..."
                  value={observacion}
                  onChange={(e) => {
                    const texto = e.target.value;
                    const textoFormat =
                      texto.charAt(0).toUpperCase() + texto.slice(1);

                    setObservacion(textoFormat);
                  }}
                  rows={3}
                  className="w-full rounded-2xl border border-corporativo-borde/40 px-4 py-3 text-sm bg-corporativo-fondo/30 text-corporativo-oscuro outline-none focus:bg-white focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde transition-all resize-none shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => registrarAsistencia('entrada')}
                  disabled={loading}
                  className="w-full sm:w-auto rounded-2xl bg-corporativo-principal px-8 py-3.5 text-sm font-bold text-white hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Registrar Entrada
                </button>

                <button
                  type="button"
                  onClick={() => registrarAsistencia('salida')}
                  disabled={loading}
                  className="w-full sm:w-auto rounded-2xl bg-corporativo-boton px-8 py-3.5 text-sm font-bold text-white hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Registrar Salida
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </LayoutOperador>
  );
}
