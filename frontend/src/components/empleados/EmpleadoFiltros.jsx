import SelectPersonalizado from '../comunes/SelectPersonalizado.jsx';

const iconoDepto = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const iconoEstado = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const opcionesEstados = [
  { id: 'Activo', nombre: 'Activos' },
  { id: 'Inactivo', nombre: 'Inactivos' }
];

const opcionesLimite = [
  { id: '10', nombre: '10' },
  { id: '20', nombre: '20' },
  { id: '50', nombre: '50' }
];

export default function EmpleadoFiltros({
  busqueda,
  setBusqueda,
  filtroDepartamento,
  setFiltroDepartamento,
  filtroEstado,
  setFiltroEstado,
  departamentos,
  limit,
  setLimit,
  setPage,
  onSearchSubmit
}) {
  const handleBusquedaChange = (e) => {
    const capitalizado = e.target.value
      .split(' ')
      .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : ''))
      .join(' ');
    setBusqueda(capitalizado);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      
      {/* Formulario de búsqueda y filtros */}
      <form onSubmit={onSearchSubmit} className="flex flex-wrap sm:flex-nowrap items-center gap-3 flex-1 min-w-[280px]">
        
        {/* Input de Búsqueda */}
        <div className="relative w-full sm:w-72 lg:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          </span>
          <input
          type="text"
          inputMode="text"
          maxLength={50}
          value={busqueda}
          onChange={handleBusquedaChange}
          className="w-full rounded-xl border border-corporativo-borde/60 pl-10 pr-4 py-2.5 text-sm bg-white text-corporativo-oscuro outline-none focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde transition-all shadow-sm"
          placeholder="Cédula, nombre o apellido..."
          />
       </div>
        
        {/* Selectores */}
        <SelectPersonalizado
          value={filtroDepartamento}
          onChange={setFiltroDepartamento}
          options={departamentos}
          placeholder="Todos los deptos"
          iconSVG={iconoDepto}
          className="w-full sm:w-48"
        />

        <SelectPersonalizado
          value={filtroEstado}
          onChange={setFiltroEstado}
          options={opcionesEstados}
          placeholder="Todos los estados"
          iconSVG={iconoEstado}
          className="w-full sm:w-40"
        />

        {/* Botón Filtrar */}
        <button 
          type="submit" 
          className="w-full sm:w-auto rounded-xl bg-corporativo-principal px-6 py-2.5 text-sm font-semibold text-white hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <span>Filtrar</span>
        </button>
      </form>

      {/* Selector de límite de registros */}
      <div className="flex items-center gap-2.5 text-sm text-corporativo-oscuro font-medium shrink-0">
        <label htmlFor="limit-empleados" className="text-corporativo-boton text-xs font-bold uppercase tracking-wider">
          Mostrar:
        </label>
        <SelectPersonalizado
          value={String(limit)}
          onChange={(valor) => {
            setLimit(Number(valor));
            setPage(1);
          }}
          options={opcionesLimite}
          className="w-20"
          mostrarOpcionVacia={false}
        />
      </div>

    </div>
  );
}