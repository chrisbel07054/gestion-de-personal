import { hoy, idDe, nombreEmpleado } from '../../hooks/useEstadisticas.js';
import SelectPersonalizado from '../comunes/SelectPersonalizado.jsx';

// --- ICONOS SVG ---
const SVGIcon = ({ d, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const iconoPeriodo = <SVGIcon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
const iconoDepto = <SVGIcon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />;
const iconoBusqueda = <SVGIcon d="M21 21l-4.35-4.35m2.35-5.15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />;
const iconoCalendario = <SVGIcon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />;

const opcionesPeriodos = [
  { id: 'dia', nombre: 'Día actual' },
  { id: 'semana', nombre: 'Semana actual' },
  { id: 'mes', nombre: 'Mes actual' },
  { id: 'anio', nombre: 'Año actual' },
  { id: 'personalizado', nombre: 'Personalizado' },
];

const claseCampo =
  'w-full rounded-xl border border-corporativo-borde/60 bg-white pl-10 pr-3 py-2.5 text-sm text-corporativo-oscuro outline-none focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde transition-all shadow-2xs disabled:bg-corporativo-fondo';

function Campo({ etiqueta, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-corporativo-oscuro">
        {etiqueta}
      </label>
      {children}
    </div>
  );
}

export default function FiltrosEstadisticas({
  filtros,
  actualizarFiltro,
  aplicarFiltros,
  limpiarFiltros,
  empleadosEncontrados,
  empleadoSeleccionado,
  departamentos,
  cargandoCatalogos,
  cargando,
}) {
  const cambiar = (campo) => (evento) =>
    actualizarFiltro(campo, evento.target.value);

  const esPersonalizado = filtros.periodo === 'personalizado';

  return (
    <div className="rounded-3xl border border-corporativo-borde bg-white p-4 shadow-sm space-y-3 sm:p-6">
      <form
        onSubmit={aplicarFiltros}
        className={`grid grid-cols-1 items-end gap-3 sm:grid-cols-2 ${
          esPersonalizado ? 'lg:grid-cols-6' : 'lg:grid-cols-4'
        }`}
      >
        {/* PERÍODO CON SELECT PERSONALIZADO */}
        <Campo etiqueta="Período">
          <SelectPersonalizado
            value={filtros.periodo}
            onChange={(valor) => actualizarFiltro('periodo', valor)}
            options={opcionesPeriodos}
            iconSVG={iconoPeriodo}
            className="w-full"
            mostrarOpcionVacia={false}
          />
        </Campo>

        {/* DEPARTAMENTO CON SELECT PERSONALIZADO */}
        <Campo etiqueta="Departamento">
          <SelectPersonalizado
            value={filtros.departamentoId}
            onChange={(valor) => actualizarFiltro('departamentoId', valor)}
            options={departamentos}
            placeholder="Todos los departamentos"
            iconSVG={iconoDepto}
            disabled={cargandoCatalogos}
            className="w-full"
          />
        </Campo>

        {/* EMPLEADO */}
        <Campo etiqueta="Empleado">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">
              {iconoBusqueda}
            </span>
            <input
              type="text"
              value={
                empleadoSeleccionado
                  ? `${nombreEmpleado(empleadoSeleccionado)}${
                      empleadoSeleccionado.cedula
                        ? ` — ${empleadoSeleccionado.cedula}`
                        : ''
                    }`
                  : filtros.empleadoBusqueda
              }
              onChange={cambiar('empleadoBusqueda')}
              disabled={cargandoCatalogos}
              placeholder="Cédula o nombre..."
              className={claseCampo}
            />

            {!filtros.empleadoId &&
              filtros.empleadoBusqueda.trim() &&
              empleadosEncontrados.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-corporativo-borde bg-white shadow-lg">
                  {empleadosEncontrados.map((empleado) => (
                    <button
                      key={idDe(empleado)}
                      type="button"
                      onClick={() => {
                        actualizarFiltro('empleadoId', {
                          id: String(idDe(empleado)),
                          busqueda: `${nombreEmpleado(empleado)}${
                            empleado.cedula ? ` — ${empleado.cedula}` : ''
                          }`,
                        });
                      }}
                      className="w-full cursor-pointer px-4 py-3 text-left transition-colors hover:bg-corporativo-fondo"
                    >
                      <div className="text-sm font-semibold text-corporativo-oscuro">
                        {nombreEmpleado(empleado)}
                      </div>
                      <div className="text-xs text-corporativo-boton">
                        {empleado.cedula
                          ? `C.I: ${empleado.cedula}`
                          : 'Sin cédula'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>
        </Campo>

        {/* FECHAS (PERSONALIZADO) */}
        {esPersonalizado && (
          <>
            <Campo etiqueta="Desde">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">
                  {iconoCalendario}
                </span>
                <input
                  type="date"
                  value={filtros.desde}
                  max={hoy()}
                  onChange={cambiar('desde')}
                  className={claseCampo}
                />
              </div>
            </Campo>

            <Campo etiqueta="Hasta">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">
                  {iconoCalendario}
                </span>
                <input
                  type="date"
                  value={filtros.hasta}
                  min={filtros.desde || undefined}
                  max={hoy()}
                  onChange={cambiar('hasta')}
                  className={claseCampo}
                />
              </div>
            </Campo>
          </>
        )}

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            disabled={cargando}
            className="rounded-xl bg-corporativo-principal px-6 py-2.5 text-sm font-semibold text-white hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{cargando ? 'Consultando...' : 'Filtrar'}</span>
          </button>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="rounded-xl border border-corporativo-borde/60 bg-white px-4 py-2.5 text-sm font-semibold text-corporativo-boton hover:bg-corporativo-fondo transition-colors shadow-sm cursor-pointer"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}