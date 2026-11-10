import SelectPersonalizado from '../comunes/SelectPersonalizado.jsx';

const iconoDepto = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ordenSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function ListaHorarios({
  empleados = [], departamentos = [], cargos = [], horarios = {}, loading = false,
  onEditar, onSearchSubmit, busqueda = '', setBusqueda,
  filtroDepartamento = '', setFiltroDepartamento, limit = 20, setLimit,
  page = 1, canPrevious = false, canNext = false, onPrevPage, onNextPage, totalEmpleados = 0,
}) {
  const obtenerNombre = (item, lista, idKey) => {
    if (item?.nombre) return item.nombre;
    if (typeof item === 'string') return item;
    const id = item?.[idKey] || item;
    const encontrado = lista.find(el => String(el.id) === String(id));
    return encontrado ? encontrado.nombre : id || '—';
  };

  const renderizarDias = (dias) => {
    if (!Array.isArray(dias) || dias.length === 0) return <span className="text-xs text-slate-400 italic">No especificado</span>;
    const diasOrdenados = ordenSemana.filter(dia => dias.includes(dia));
    if (diasOrdenados.length === 0) return <span className="text-xs text-slate-400 italic">No especificado</span>;
    if (diasOrdenados.length === 7) return 'Lunes a Domingo';

    const esContinuo = diasOrdenados.every((dia, i) => ordenSemana.indexOf(dia) === ordenSemana.indexOf(diasOrdenados[0]) + i);
    if (esContinuo && diasOrdenados.length > 2) return `${diasOrdenados[0]} a ${diasOrdenados[diasOrdenados.length - 1]}`;
    return diasOrdenados.join(', ');
  };

  const opcionesLimite = [{ id: '10', nombre: '10' }, { id: '20', nombre: '20' }, { id: '50', nombre: '50' }];

  return (
    <section className="rounded-3xl border border-corporativo-borde bg-white p-4 sm:p-6 shadow-sm">
      {/* Filtros */}
      <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="w-full rounded-xl border border-corporativo-borde/60 pl-10 pr-4 py-2.5 text-sm bg-white text-corporativo-oscuro outline-none focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde transition-all shadow-sm"
              placeholder="Buscar por nombre o apellido..."
            />
          </div>

          <SelectPersonalizado value={filtroDepartamento} onChange={setFiltroDepartamento} options={departamentos} placeholder="Todos los deptos" iconSVG={iconoDepto} className="w-full sm:w-48" />

          <button type="submit" className="rounded-xl bg-corporativo-principal px-6 py-2.5 text-sm font-semibold text-white hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 shrink-0">
            <span>Filtrar</span>
          </button>
        </form>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 text-sm text-corporativo-oscuro font-medium">
          <label className="text-corporativo-boton text-xs font-bold uppercase tracking-wider">Mostrar:</label>
          <SelectPersonalizado value={String(limit)} onChange={v => v && setLimit(Number(v))} options={opcionesLimite} className="w-16" mostrarOpcionVacia={false} />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-corporativo-fondo px-6 py-12 text-center text-corporativo-oscuro font-medium">Cargando listado de horarios...</div>
      ) : (
        <>
          {/* Tarjetas Móviles */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {empleados.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-corporativo-borde p-8 text-center text-sm text-corporativo-oscuro">No se encontraron empleados registrados.</div>
            ) : (
              empleados.map(emp => {
                const horario = horarios[emp.id];
                return (
                  <div key={emp.id} className="rounded-2xl border border-corporativo-borde p-4 bg-white shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-corporativo-oscuro text-base leading-snug">{emp.nombre} {emp.apellido || ''}</h3>
                        <p className="text-xs text-corporativo-boton font-mono mt-0.5">
                          Horas: {horario ? `${horario.horaEntrada} - ${horario.horaSalida}` : 'Sin horario'}
                        </p>
                      </div>
                      <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold border bg-corporativo-fondo text-corporativo-principal border-corporativo-borde shrink-0">
                        {horario ? 'Asignado' : 'Sin asignar'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-corporativo-borde/60 text-center">
                      <div>
                        <span className="block text-corporativo-boton font-medium">Departamento</span>
                        <span className="font-semibold text-corporativo-oscuro truncate block mt-0.5">{obtenerNombre(emp.departamento, departamentos, 'id')}</span>
                      </div>
                      <div>
                        <span className="block text-corporativo-boton font-medium">Cargo</span>
                        <span className="font-semibold text-corporativo-oscuro truncate block mt-0.5">{obtenerNombre(emp.cargo, cargos, 'id')}</span>
                      </div>
                    </div>

                    <div className="text-xs text-corporativo-oscuro space-y-1">
                      <span className="block text-corporativo-boton font-medium">Días Laborales:</span>
                      <span className="font-semibold text-corporativo-oscuro block">{renderizarDias(horario?.diasLaborales)}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button" title="Editar Horario" onClick={() => onEditar(emp)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-corporativo-boton/40 text-xs font-semibold text-corporativo-boton bg-corporativo-fondo hover:bg-corporativo-principal hover:text-white transition-all shadow-2xs cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editar Horario</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Tabla Escritorio */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-corporativo-fondo text-center text-xs font-bold uppercase tracking-wider text-corporativo-principal">
                  <th className="px-4 py-3.5 border-b border-corporativo-borde">Nombre</th>
                  <th className="px-4 py-3.5 border-b border-corporativo-borde">Apellido</th>
                  <th className="px-4 py-3.5 border-b border-corporativo-borde">Cargo</th>
                  <th className="px-4 py-3.5 border-b border-corporativo-borde">Departamento</th>
                  <th className="px-4 py-3.5 border-b border-corporativo-borde">Horas</th>
                  <th className="px-4 py-3.5 border-b border-corporativo-borde">Días Laborales</th>
                  <th className="px-4 py-3.5 border-b border-corporativo-borde text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-corporativo-borde">
                {empleados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-sm text-corporativo-oscuro">No se encontraron empleados registrados.</td>
                  </tr>
                ) : (
                  empleados.map(emp => {
                    const horario = horarios[emp.id];
                    return (
                      <tr key={emp.id} className="hover:bg-corporativo-fondo/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-corporativo-oscuro text-center">{emp.nombre || '—'}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-corporativo-oscuro text-center">{emp.apellido || '—'}</td>
                        <td className="px-4 py-3 text-sm text-corporativo-oscuro font-medium text-center">{obtenerNombre(emp.cargo, cargos, 'id')}</td>
                        <td className="px-4 py-3 text-sm text-corporativo-oscuro font-medium text-center">{obtenerNombre(emp.departamento, departamentos, 'id')}</td>
                        <td className="px-4 py-3 text-sm text-center font-medium text-corporativo-oscuro">
                          {horario ? <span>{horario.horaEntrada} - {horario.horaSalida}</span> : <span className="text-xs text-slate-400 italic">Sin asignar</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-corporativo-oscuro text-center max-w-xs truncate">{renderizarDias(horario?.diasLaborales)}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button" title="Editar Horario" onClick={() => onEditar(emp)}
                            className="p-2 rounded-xl border border-corporativo-boton/40 text-corporativo-boton bg-corporativo-fondo hover:bg-corporativo-principal hover:text-white transition-all cursor-pointer shadow-2xs"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
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

      {/* Paginación */}
      <div className="mt-6 pt-4 border-t border-corporativo-borde flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm font-medium text-corporativo-boton">Total de empleados: {totalEmpleados}</div>
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-xl border border-corporativo-borde px-4 py-2 text-sm font-semibold text-corporativo-oscuro hover:bg-corporativo-fondo disabled:opacity-40 transition-colors cursor-pointer" disabled={!canPrevious || loading} onClick={onPrevPage}>Anterior</button>
          <span className="text-sm font-semibold text-corporativo-oscuro">Página {page}</span>
          <button type="button" className="rounded-xl border border-corporativo-borde px-4 py-2 text-sm font-semibold text-corporativo-oscuro hover:bg-corporativo-fondo disabled:opacity-40 transition-colors cursor-pointer" disabled={!canNext || loading} onClick={onNextPage}>Siguiente</button>
        </div>
      </div>
    </section>
  );
}