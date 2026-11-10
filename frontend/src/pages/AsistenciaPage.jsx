import LayoutRRHH from '../layouts/LayoutRRHH.jsx';
import logoInstitucion from '../assets/IVSS.svg';
import EstadoBadge from '../components/comunes/EstadoBadge.jsx';
import SelectPersonalizado from '../components/comunes/SelectPersonalizado.jsx';
import useAsistencia from '../hooks/useAsistencia.js';

const iconoDepto = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default function AsistenciaPage() {
  const {
    asistencias, departamentos, fecha, departamentoId, textoBusquedaInput, setTextoBusquedaInput,
    loading, userName, page, limit, total, totalPaginas, handleSearchSubmit, handleFechaChange,
    handleDepartamentoChange, handleLimitChange, obtenerDepartamento, siguientePagina, paginaAnterior,
  } = useAsistencia();

  const opcionesLimite = [
    { id: '10', nombre: '10' },
    { id: '20', nombre: '20' },
    { id: '50', nombre: '50' },
  ];

  return (
    <LayoutRRHH>
      <section className="w-full px-3 sm:px-6 pt-3 pb-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-corporativo-borde shadow-sm">
          <div className="flex items-center gap-4">
            <img src={logoInstitucion} alt="Logo Institución" className="h-14 w-auto object-contain" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-corporativo-oscuro tracking-tight">Asistencia</h1>
              <p className="mt-1 text-sm text-corporativo-boton">Consulta del control diario de asistencia del personal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3.5 py-2 text-xs font-bold text-corporativo-oscuro">
              {userName}
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-corporativo-borde bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative flex-1 sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-2a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Buscar por cédula o nombre..."
                  value={textoBusquedaInput}
                  onChange={(e) => setTextoBusquedaInput(e.target.value)}
                  className="w-full rounded-xl border border-corporativo-borde/60 pl-10 pr-4 py-2.5 text-sm bg-white text-corporativo-oscuro outline-none placeholder:text-slate-400 focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde transition-all shadow-sm"
                />
              </div>

              <div className="relative w-full sm:w-44 shrink-0">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => handleFechaChange(e.target.value)}
                  className="w-full rounded-xl border border-corporativo-borde/60 pl-10 pr-3 py-2.5 text-sm bg-white text-corporativo-oscuro outline-none focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde transition-all shadow-sm"
                />
              </div>

              <SelectPersonalizado
                value={departamentoId}
                onChange={handleDepartamentoChange}
                options={departamentos}
                placeholder="Todos los deptos"
                iconSVG={iconoDepto}
                className="w-full sm:w-48"
              />

              <button
                type="submit"
                className="rounded-xl bg-corporativo-principal px-6 py-2.5 text-sm font-semibold text-white hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-md text-center flex items-center justify-center gap-2 shrink-0"
              >
                <span>Filtrar</span>
              </button>
            </form>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 text-sm text-corporativo-oscuro font-medium">
              <label className="text-corporativo-boton text-xs font-bold uppercase tracking-wider">Mostrar:</label>
              <SelectPersonalizado
                value={String(limit)}
                onChange={(valor) => { if (valor) handleLimitChange(valor); }}
                options={opcionesLimite}
                className="w-16"
                mostrarOpcionVacia={false}
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-corporativo-fondo px-6 py-12 text-center text-corporativo-oscuro font-medium">
              Cargando registros de asistencia...
            </div>
          ) : (
            <>
              {/* Tarjetas Móviles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {asistencias.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-corporativo-borde p-8 text-center text-sm text-corporativo-oscuro">
                    No se encontraron registros de asistencia para los filtros seleccionados.
                  </div>
                ) : (
                  asistencias.map((item, index) => {
                    const estadoLower = item.estado?.toLowerCase() || '';
                    const esAusente = estadoLower === 'ausente';
                    const esEspecial = ['ausente', 'vacaciones', 'reposo', 'permiso'].includes(estadoLower);

                    return (
                      <div key={item.id || index} className="rounded-2xl border border-corporativo-borde p-5 bg-white shadow-xs space-y-3.5 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <h3 className="font-bold text-corporativo-oscuro text-base leading-snug">
                              {item.empleado?.nombre ? `${item.empleado.nombre} ${item.empleado.apellido || ''}` : '—'}
                            </h3>
                            <p className="text-xs text-corporativo-boton font-medium">C.I: {item.empleado?.cedula || '—'}</p>
                          </div>
                          <div className="shrink-0">
                            <EstadoBadge estado={item.estado} />
                          </div>
                        </div>

                        <hr className="border-corporativo-borde/60" />

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-corporativo-boton font-medium">Departamento:</span>
                          <span className="font-semibold text-corporativo-oscuro text-right truncate max-w-[180px]">
                            {obtenerDepartamento(item)}
                          </span>
                        </div>

                        <hr className="border-corporativo-borde/60" />

                        <div className="grid grid-cols-2 gap-2 text-xs text-center">
                          <div className="border-r border-corporativo-borde/60 pr-2">
                            <span className="text-corporativo-boton font-medium block text-[11px] uppercase tracking-wider">Entrada</span>
                            {item.horaEntrada ? (
                              <span className="font-medium text-corporativo-oscuro text-sm">{item.horaEntrada}</span>
                            ) : esEspecial ? (
                              <span className="text-corporativo-boton font-medium text-xs">{item.estado}</span>
                            ) : (
                              <span className="text-corporativo-boton/60 font-medium text-xs">Pendiente</span>
                            )}
                          </div>
                          <div>
                            <span className="text-corporativo-boton font-medium block text-[11px] uppercase tracking-wider">Salida</span>
                            {item.horaSalida || item.estadoSalida ? (
                              <span className="font-medium text-corporativo-oscuro text-sm">{item.horaSalida || item.estadoSalida}</span>
                            ) : esEspecial ? (
                              <span className="text-corporativo-boton font-medium text-xs">{item.estado}</span>
                            ) : (
                              <span className="text-corporativo-boton/60 font-medium text-xs">Pendiente</span>
                            )}
                          </div>
                        </div>

                        <hr className="border-corporativo-borde/60" />
                        <div className="text-xs text-slate-600">
                          <strong className="not-italic text-corporativo-boton">Obs: </strong>
                          {item.observacion ? (
                            <span>{item.observacion}</span>
                          ) : esAusente ? (
                            <span className="text-corporativo-boton/70">Sin registro de asistencia al finalizar la jornada</span>
                          ) : (
                            <span className="text-corporativo-boton/60">Sin observación</span>
                          )}
                        </div>

                        <hr className="border-corporativo-borde/60" />

                        <div className="flex items-center justify-between text-xs gap-3">
                          <span className="text-corporativo-boton font-medium">Registrado por:</span>
                          <div className="text-right">
                            {item.registradoPor ? (
                              <>
                                <span className="font-semibold text-corporativo-oscuro block">{item.registradoPor.nombre || '—'}</span>
                                {item.registradoPor.usuario && <span className="text-[10px] text-corporativo-boton">@{item.registradoPor.usuario}</span>}
                              </>
                            ) : (
                              <span className="text-corporativo-boton/60 font-medium">No asignado</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Tabla de Escritorio */}
              <div className="hidden lg:block w-full overflow-x-auto">
                <table className="w-full border-collapse table-auto">
                  <thead>
                    <tr className="bg-corporativo-fondo text-center text-xs font-bold uppercase tracking-wider text-corporativo-principal">
                      <th className="px-4 py-3.5 border-b border-corporativo-borde">Nombre</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde">Apellido</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde">Cédula</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde">Departamento</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde">Hora entrada</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde">Hora salida</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde">Estado</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde">Observación</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde">Registrado por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-corporativo-borde text-sm">
                    {asistencias.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-4 py-12 text-center text-corporativo-oscuro">
                          No se encontraron registros de asistencia para los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      asistencias.map((item, index) => {
                        const estadoLower = item.estado?.toLowerCase() || '';
                        const esAusente = estadoLower === 'ausente';
                        const esEspecial = ['ausente', 'vacaciones', 'reposo', 'permiso'].includes(estadoLower);

                        return (
                          <tr key={item.id || index} className="hover:bg-corporativo-fondo/50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-corporativo-oscuro text-center whitespace-nowrap">{item.empleado?.nombre || '—'}</td>
                            <td className="px-4 py-3 font-semibold text-corporativo-oscuro text-center whitespace-nowrap">{item.empleado?.apellido || '—'}</td>
                            <td className="px-4 py-3 text-corporativo-oscuro font-medium text-center whitespace-nowrap">{item.empleado?.cedula || '—'}</td>
                            <td className="px-4 py-3 text-corporativo-oscuro font-medium text-center whitespace-nowrap">{obtenerDepartamento(item)}</td>
                            
                            {/* Hora Entrada */}
                            <td className="px-4 py-3 font-medium text-sm text-center whitespace-nowrap">
                              {item.horaEntrada ? (
                                <span className="text-corporativo-oscuro">{item.horaEntrada}</span>
                              ) : esEspecial ? (
                                <span className="text-corporativo-boton font-medium text-xs">{item.estado}</span>
                              ) : (
                                <span className="text-corporativo-boton/60 font-medium text-xs">Pendiente</span>
                              )}
                            </td>

                            {/* Hora Salida */}
                            <td className="px-4 py-3 font-medium text-sm text-center whitespace-nowrap">
                              {item.horaSalida || item.estadoSalida ? (
                                <span className="text-corporativo-oscuro">{item.horaSalida || item.estadoSalida}</span>
                              ) : esEspecial ? (
                                <span className="text-corporativo-boton font-medium text-xs">{item.estado}</span>
                              ) : (
                                <span className="text-corporativo-boton/60 font-medium text-xs">Pendiente</span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <div className="flex justify-center"><EstadoBadge estado={item.estado} /></div>
                            </td>

                            {/* Observación Condicional Coherente */}
                            <td className="px-4 py-3 text-center truncate max-w-xs text-xs">
                              {item.observacion ? (
                                <span className="text-corporativo-oscuro font-medium">{item.observacion}</span>
                              ) : esAusente ? (
                                <span className="text-corporativo-boton/70 font-medium">Sin registro de asistencia al finalizar la jornada</span>
                              ) : (
                                <span className="text-corporativo-boton/60 font-medium">Sin observación</span>
                              )}
                            </td>

                            {/* Registrado por */}
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              {item.registradoPor ? (
                                <div className="flex flex-col items-center">
                                  <span className="font-semibold text-corporativo-oscuro text-xs">{item.registradoPor.nombre || '—'}</span>
                                  {item.registradoPor.usuario && <span className="text-[10px] font-medium text-corporativo-boton">@{item.registradoPor.usuario}</span>}
                                </div>
                              ) : (
                                <span className="text-corporativo-boton/60 font-medium text-xs">No asignado</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-corporativo-borde flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-corporativo-boton">Total de registros: {total}</div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-corporativo-borde px-4 py-2 text-sm font-semibold text-corporativo-oscuro hover:bg-corporativo-fondo disabled:opacity-40 transition-colors cursor-pointer"
                disabled={page === 1 || loading}
                onClick={paginaAnterior}
              >
                Anterior
              </button>
              <span className="text-sm font-semibold text-corporativo-oscuro">Página {page} de {totalPaginas}</span>
              <button
                type="button"
                className="rounded-xl border border-corporativo-borde px-4 py-2 text-sm font-semibold text-corporativo-oscuro hover:bg-corporativo-fondo disabled:opacity-40 transition-colors cursor-pointer"
                disabled={page >= totalPaginas || loading}
                onClick={siguientePagina}
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </section>
    </LayoutRRHH>
  );
}