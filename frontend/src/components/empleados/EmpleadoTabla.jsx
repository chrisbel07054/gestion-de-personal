export default function EmpleadoTabla({
  empleados,
  loading,
  obtenerUrlFoto,
  obtenerNombreDepartamento,
  obtenerNombreCargo,
  handleOpenDetail,
  handleOpenEdit,
  handleCambiarEstado
}) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-corporativo-fondo px-6 py-12 text-center text-corporativo-oscuro font-medium">
        Cargando listado de personal...
      </div>
    );
  }

  return (
    <>
      {/* Tarjetas Móviles */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {empleados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-corporativo-borde p-8 text-center text-sm text-corporativo-oscuro">
            No se encontraron empleados registrados.
          </div>
        ) : (
          empleados.map((empleado) => {
            const inicial = empleado.nombre ? empleado.nombre.charAt(0).toUpperCase() : '—';
            return (
              <div key={empleado.id} className="rounded-2xl border border-corporativo-borde p-4 bg-white shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {empleado.foto ? (
                      <img src={obtenerUrlFoto(empleado.foto)} alt="" className="h-12 w-12 rounded-full object-cover border border-corporativo-borde shadow-xs shrink-0" />
                    ) : (
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-corporativo-fondo font-bold text-sm text-corporativo-oscuro border border-corporativo-borde shrink-0 shadow-2xs">
                        {inicial}
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold text-corporativo-oscuro text-base leading-snug">{empleado.nombre} {empleado.apellido || ''}</h3>
                      <p className="text-xs text-corporativo-boton font-mono mt-0.5">C.I: {empleado.cedula || '—'}</p>
                    </div>
                  </div>

                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shrink-0 ${
                    empleado.estado === 'Inactivo' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {empleado.estado || 'Activo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-corporativo-borde/60 text-center">
                  <div>
                    <span className="block text-corporativo-boton font-medium">Departamento</span>
                    <span className="font-semibold text-corporativo-oscuro truncate block mt-0.5">{obtenerNombreDepartamento(empleado)}</span>
                  </div>
                  <div>
                    <span className="block text-corporativo-boton font-medium">Cargo</span>
                    <span className="font-semibold text-corporativo-oscuro truncate block mt-0.5">{obtenerNombreCargo(empleado)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button 
                    type="button" 
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-corporativo-claro2/40 text-xs font-semibold text-corporativo-principal bg-corporativo-claro1/30 hover:bg-corporativo-claro1/60 transition-all shadow-2xs cursor-pointer"
                    onClick={() => handleOpenDetail(empleado)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Expediente</span>
                  </button>

                  <button 
                    type="button" 
                    className="p-2.5 rounded-xl border border-corporativo-boton/40 text-corporativo-boton bg-corporativo-fondo hover:bg-corporativo-principal hover:text-white transition-all shadow-2xs cursor-pointer"
                    onClick={() => handleOpenEdit(empleado)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button 
                    type="button" 
                    className={`p-2.5 rounded-xl border transition-all shadow-2xs cursor-pointer ${
                      empleado.estado === 'Inactivo' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                    onClick={() => handleCambiarEstado(empleado)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {empleado.estado === 'Inactivo' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <>
                          <circle cx="12" cy="12" r="9" strokeWidth="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.7 5.7l12.6 12.6" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabla de Escritorio */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-corporativo-fondo text-xs font-bold uppercase tracking-wider text-corporativo-principal">
              <th className="px-4 py-3.5 border-b border-corporativo-borde text-center">Foto</th>
              <th className="px-4 py-3.5 border-b border-corporativo-borde text-center">Cédula</th>
              <th className="px-4 py-3.5 border-b border-corporativo-borde text-center">Nombre</th>
              <th className="px-4 py-3.5 border-b border-corporativo-borde text-center">Apellido</th>
              <th className="px-4 py-3.5 border-b border-corporativo-borde text-center">Departamento</th>
              <th className="px-4 py-3.5 border-b border-corporativo-borde text-center">Cargo</th>
              <th className="px-4 py-3.5 border-b border-corporativo-borde text-center">Estado</th>
              <th className="px-4 py-3.5 border-b border-corporativo-borde text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-corporativo-borde">
            {empleados.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center text-sm text-corporativo-oscuro">
                  No se encontraron empleados registrados.
                </td>
              </tr>
            ) : (
              empleados.map((empleado) => {
                const inicial = empleado.nombre ? empleado.nombre.charAt(0).toUpperCase() : '—';
                return (
                  <tr key={empleado.id} className="hover:bg-corporativo-fondo/50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        {empleado.foto ? (
                          <img src={obtenerUrlFoto(empleado.foto)} alt="" className="h-10 w-10 rounded-full object-cover border border-corporativo-borde shadow-xs" />
                        ) : (
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-corporativo-fondo font-bold text-xs text-corporativo-oscuro border border-corporativo-borde shadow-2xs">
                            {inicial}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-corporativo-oscuro text-center">{empleado.cedula || '—'}</td>
                    <td className="px-4 py-3 text-sm text-corporativo-oscuro text-center">{empleado.nombre || '—'}</td>
                    <td className="px-4 py-3 text-sm text-corporativo-oscuro text-center">{empleado.apellido || '—'}</td>
                    <td className="px-4 py-3 text-sm text-corporativo-oscuro font-medium text-center">{obtenerNombreDepartamento(empleado)}</td>
                    <td className="px-4 py-3 text-sm text-corporativo-oscuro font-medium text-center">{obtenerNombreCargo(empleado)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold border ${
                        empleado.estado === 'Inactivo' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {empleado.estado || 'Activo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          type="button" title="Ver Expediente"
                          className="p-2 rounded-xl border border-corporativo-claro2/40 bg-corporativo-claro1/30 text-corporativo-principal hover:bg-corporativo-claro1 transition-all cursor-pointer shadow-2xs" 
                          onClick={() => handleOpenDetail(empleado)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        <button 
                          type="button" title="Editar Empleado"
                          className="p-2 rounded-xl border border-corporativo-boton/40 text-corporativo-boton bg-corporativo-fondo hover:bg-corporativo-principal hover:text-white transition-all cursor-pointer shadow-2xs" 
                          onClick={() => handleOpenEdit(empleado)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button 
                          type="button" title={empleado.estado === 'Inactivo' ? 'Reactivar Empleado' : 'Inactivar Empleado'}
                          className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                            empleado.estado === 'Inactivo' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                          onClick={() => handleCambiarEstado(empleado)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {empleado.estado === 'Inactivo' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                              <>
                                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.7 5.7l12.6 12.6" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}