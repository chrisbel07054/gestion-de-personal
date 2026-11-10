import SelectPersonalizado from '../comunes/SelectPersonalizado.jsx';

const SVGIcon = ({ d, className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const iconoReporte = <SVGIcon d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0118 8.414V19a2 2 0 01-2 2z" />;
const iconoDepto = <SVGIcon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />;
const iconoCalendario = <SVGIcon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />;
const iconoBusqueda = <SVGIcon d="M21 21l-4.35-4.35m2.35-5.15a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />;
const iconoAlerta = <SVGIcon d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-3.5 h-3.5 shrink-0 opacity-70" />;

const opcionesTiposReporte = [
  { id: 'asistencia', nombre: 'Asistencia' },
  { id: 'horarios', nombre: 'Horarios' },
  { id: 'vacaciones', nombre: 'Vacaciones' },
  { id: 'reposos', nombre: 'Reposos Médicos' },
  { id: 'permisos', nombre: 'Permisos' },
];

const inputFechaClass = 'w-full rounded-xl border border-corporativo-borde/60 pl-10 pr-3 py-2.5 text-sm bg-white text-corporativo-oscuro outline-none focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde transition-all shadow-sm';

export default function ReporteFiltros({
  tipoReporte, departamentoId, empleadoId, desde, hasta, departamentos, empleadosFiltrados,
  loadingCatalogos, loadingReporte, puedeGenerarReporte, obtenerId, obtenerNombreEmpleado,
  onTipoReporteChange, onDepartamentoChange, onEmpleadoChange, onDesdeChange, onHastaChange,
  onLimpiar, onGenerar, hayFiltroValido, empleadoBusqueda, onEmpleadoBusquedaChange,
}) {
  const mostrarFechas = tipoReporte !== 'horarios';
  const fechaActual = new Date();
  const fechaMaxima = [fechaActual.getFullYear(), String(fechaActual.getMonth() + 1).padStart(2, '0'), String(fechaActual.getDate()).padStart(2, '0')].join('-');
  
  const empleadoSeleccionado = empleadosFiltrados.find((e) => String(obtenerId(e)) === String(empleadoId));
  const textoBusqueda = empleadoBusqueda?.trim().toLowerCase() || '';

  const empleadosEncontrados = textoBusqueda ? empleadosFiltrados.filter((e) => {
    const nombre = obtenerNombreEmpleado(e).toLowerCase();
    const cedula = String(e.cedula || '').toLowerCase();
    return nombre.includes(textoBusqueda) || cedula.includes(textoBusqueda);
  }) : [];

  const opcionesDepartamentos = departamentos.map((d) => ({
    id: obtenerId(d),
    nombre: d.nombre || d.descripcion || 'Sin nombre',
  }));

  return (
    <div className="space-y-3">
      <form onSubmit={(e) => { e.preventDefault(); onGenerar(); }} className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* BLOQUE IZQUIERDO */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <SelectPersonalizado value={tipoReporte} onChange={onTipoReporteChange} options={opcionesTiposReporte} placeholder="Seleccione tipo de reporte..." iconSVG={iconoReporte} className="w-full sm:w-[240px] shrink-0" />
          <SelectPersonalizado value={departamentoId} onChange={(val) => onDepartamentoChange({ target: { value: val } })} options={opcionesDepartamentos} placeholder="Todos los deptos" iconSVG={iconoDepto} disabled={loadingCatalogos} className="w-full sm:w-[190px] shrink-0" />
        </div>

        {/* BLOQUE CENTRAL/DERECHO */}
        <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
          
          {/* EMPLEADO */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-[280px]">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">{iconoBusqueda}</span>
            <input
              type="text"
              value={empleadoSeleccionado ? `${obtenerNombreEmpleado(empleadoSeleccionado)}${empleadoSeleccionado.cedula ? ` — ${empleadoSeleccionado.cedula}` : ''}` : empleadoBusqueda}
              onChange={(e) => { onEmpleadoBusquedaChange(e.target.value); if (empleadoId) onEmpleadoChange(''); }}
              disabled={loadingCatalogos}
              placeholder="Empleado: cédula o nombre..."
              className="w-full rounded-xl border border-corporativo-borde/60 pl-10 pr-4 py-2.5 text-sm bg-white text-corporativo-oscuro outline-none placeholder:text-slate-400 focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde transition-all shadow-sm disabled:bg-gray-100"
            />
            {!empleadoId && textoBusqueda && (
              <div className="absolute z-30 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-corporativo-borde bg-white shadow-lg">
                {empleadosEncontrados.length > 0 ? empleadosEncontrados.map((empleado) => {
                  const id = obtenerId(empleado);
                  return (
                    <button key={id} type="button" onClick={() => { onEmpleadoChange(String(id)); onEmpleadoBusquedaChange(`${obtenerNombreEmpleado(empleado)}${empleado.cedula ? ` — ${empleado.cedula}` : ''}`); }} className="w-full px-4 py-2.5 text-left hover:bg-corporativo-fondo transition-colors">
                      <div className="text-sm font-semibold text-corporativo-oscuro">{obtenerNombreEmpleado(empleado)}</div>
                      <div className="text-xs text-corporativo-boton mt-0.5">{empleado.cedula ? `C.I: ${empleado.cedula}` : 'Sin cédula'}</div>
                    </button>
                  );
                }) : <div className="px-4 py-3 text-sm text-corporativo-boton">No se encontraron empleados.</div>}
              </div>
            )}
            {empleadoId && (
              <button type="button" onClick={() => { onEmpleadoChange(''); onEmpleadoBusquedaChange(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-corporativo-boton hover:text-corporativo-principal">
                Quitar
              </button>
            )}
          </div>

          {/* FECHA DESDE */}
          {mostrarFechas && (
            <div className="relative w-full sm:w-[145px] shrink-0">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">{iconoCalendario}</span>
              <input type="date" value={desde} max={fechaMaxima} onChange={(e) => onDesdeChange(e.target.value)} aria-label="Fecha desde" className={inputFechaClass} />
            </div>
          )}

          {/* FECHA HASTA */}
          {mostrarFechas && (
            <div className="relative w-full sm:w-[145px] shrink-0">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">{iconoCalendario}</span>
              <input type="date" value={hasta} min={desde || undefined} max={fechaMaxima} onChange={(e) => onHastaChange(e.target.value)} aria-label="Fecha hasta" className={inputFechaClass} />
            </div>
          )}

          {/* BOTONES */}
          <div className="flex items-center gap-2 shrink-0">
            <button type="submit" disabled={!puedeGenerarReporte || loadingReporte} className="rounded-xl bg-corporativo-principal px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <span>{loadingReporte ? 'Generando...' : 'Filtrar'}</span>
            </button>
            <button type="button" onClick={onLimpiar} className="rounded-xl border border-corporativo-borde/60 bg-white px-4 py-2.5 text-sm font-semibold text-corporativo-boton hover:bg-corporativo-fondo transition-colors shadow-sm">
              Limpiar
            </button>
          </div>
        </div>
      </form>

      {/* MENSAJE DE ADVERTENCIA */}
      {(!tipoReporte || !hayFiltroValido) && (
        <div className="flex items-center gap-1.5 px-1 text-xs font-medium text-corporativo-boton/80">
          {iconoAlerta}
          <span>{!tipoReporte ? 'Seleccione un tipo de reporte para habilitar las opciones de filtrado.' : 'Seleccione al menos un criterio adicional (departamento, empleado o rango de fechas) para consultar.'}</span>
        </div>
      )}
    </div>
  );
}