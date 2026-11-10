import LayoutAdministrador from '../layouts/LayoutAdministrador.jsx';
import logoInstitucion from '../assets/IVSS.svg';
import { useAuthStore } from '../store/authStore.js';
import SelectPersonalizado from '../components/comunes/SelectPersonalizado.jsx';
import useAuditoria from '../hooks/useAuditoria.js';

export default function AuditoriaPage() {
  const {
    auditoriaList,
    fecha,
    loading,
    page,
    limit,
    total,
    totalPaginas,
    handleFechaChange,
    handleLimitChange,
    setPage,
    obtenerDetalleTexto,
  } = useAuditoria();

  const { usuario } = useAuthStore();

  const nombreUsuario =
    usuario?.usuario ||
    usuario?.nombre ||
    'Administrador';

  return (
    <LayoutAdministrador>
      <section className="w-full px-3 sm:px-6 pt-3 pb-6 space-y-4">

        {/* Cabecera Principal */}
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
                  Bitácora de Auditoría
                </h1>

                <div className="mt-1 text-sm text-corporativo-boton">
                  Registro de eventos, acciones y transacciones realizadas en el sistema.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3.5 py-2 text-xs font-bold text-corporativo-oscuro whitespace-nowrap">
              {nombreUsuario}
            </div>
          </div>
        </div>

        {/* Listado */}
        <section className="bg-white rounded-3xl border border-corporativo-borde/40 p-4 sm:p-6 shadow-sm space-y-6">

          {/* Encabezado + filtros */}
          <div className="border-b border-corporativo-borde/40 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>
                <h2 className="text-lg font-bold text-corporativo-oscuro">
                  Historial de Actividad
                </h2>

                <p className="text-xs text-corporativo-boton mt-0.5">
                  Monitoreo detallado de las operaciones de los usuarios.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                {/* Fecha */}
                <div className="relative w-full sm:w-44">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-corporativo-boton/60">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        width="18"
                        height="18"
                        x="3"
                        y="4"
                        rx="2"
                      />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </span>

                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) =>
                      handleFechaChange(e.target.value)
                    }
                    className="w-full rounded-xl border border-corporativo-borde/60 pl-10 pr-3 py-2.5 text-sm bg-white text-corporativo-oscuro outline-none focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde transition-all shadow-sm"
                  />
                </div>

                {/* Cantidad por página */}
                <div className="flex items-center gap-2.5 text-sm text-corporativo-oscuro font-medium">
                  <label className="text-corporativo-boton text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Mostrar:
                  </label>

                  <SelectPersonalizado
                    value={String(limit)}
                    onChange={(valor) =>
                      valor && handleLimitChange(valor)
                    }
                    options={[
                      { id: '10', nombre: '10' },
                      { id: '20', nombre: '20' },
                      { id: '50', nombre: '50' },
                    ]}
                    className="w-16"
                    mostrarOpcionVacia={false}
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Contenido */}
          {loading ? (
            <div className="p-12 text-center text-sm font-semibold text-corporativo-oscuro">
              Cargando bitácora...
            </div>
          ) : auditoriaList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-corporativo-borde bg-corporativo-fondo/30 p-12 text-center text-sm text-corporativo-boton">
              No hay registros de auditoría disponibles para esta fecha.
            </div>
          ) : (
            <>
              {/* Tabla escritorio */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-corporativo-fondo text-xs font-bold uppercase tracking-wider text-corporativo-principal">
                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40 text-center">
                        Fecha
                      </th>

                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40 text-center">
                        Usuario
                      </th>

                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40 text-center">
                        Acción
                      </th>

                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40 text-center">
                        Entidad
                      </th>

                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40 text-center">
                        Detalle
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-corporativo-borde/40">
                    {auditoriaList.map((item, index) => {
                      const detalleTexto =
                        obtenerDetalleTexto(item.detalle);

                      return (
                        <tr
                          key={`${item.id || item._id || 'auditoria'}-${index}`}
                          className="hover:bg-corporativo-fondo/50 transition-colors"
                        >
                          <td className="px-4 py-3.5 text-xs text-corporativo-boton whitespace-nowrap text-center">
                            {item.fecha
                              ? new Date(item.fecha).toLocaleString()
                              : '—'}
                          </td>

                          <td className="px-4 py-3.5 font-semibold text-corporativo-oscuro whitespace-nowrap text-center">
                            {item.usuario?.usuario ||
                              item.usuario ||
                              'Sistema'}
                          </td>

                          <td className="px-4 py-3.5 whitespace-nowrap text-center">
                            <span className="inline-block rounded-full bg-corporativo-fondo px-3 py-1 text-xs font-semibold text-corporativo-principal border border-corporativo-borde/40">
                              {item.accion}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-corporativo-oscuro font-medium whitespace-nowrap text-center">
                            {item.entidad}
                          </td>

                          <td className="px-4 py-3.5 text-corporativo-boton text-xs text-center align-top"
                          title={detalleTexto}>
                            <div className="max-w-xl mx-auto whitespace-normal break-words leading-relaxed">
                              {detalleTexto}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tarjetas móvil */}
              <div className="grid grid-cols-1 gap-3 lg:hidden">
                {auditoriaList.map((item, index) => {
                  const detalleTexto =
                    obtenerDetalleTexto(item.detalle);

                  return (
                    <article
                      key={`${item.id || item._id || 'auditoria'}-${index}`}
                      className="rounded-2xl border border-corporativo-borde bg-white p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-corporativo-oscuro">
                            {item.usuario?.usuario ||
                              item.usuario ||
                              'Sistema'}
                          </h3>

                          <p className="mt-1 text-xs text-corporativo-boton">
                            {item.fecha
                              ? new Date(item.fecha).toLocaleString()
                              : '—'}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-corporativo-fondo px-2.5 py-1 text-[10px] font-semibold text-corporativo-principal border border-corporativo-borde/40">
                          {item.accion}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-corporativo-borde/40">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-corporativo-boton">
                          Entidad
                        </p>

                        <p className="mt-1 text-sm font-semibold text-corporativo-oscuro">
                          {item.entidad}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-corporativo-borde/40">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-corporativo-boton">
                          Detalle
                        </p>

                        <p
                          className="mt-1 text-xs text-corporativo-boton break-words"
                          title={detalleTexto}
                        >
                          {detalleTexto}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Paginación */}
              <div className="pt-4 border-t border-corporativo-borde flex flex-col sm:flex-row items-center justify-between gap-4">

                <div className="text-sm font-medium text-corporativo-boton">
                  Total de registros: {total}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-corporativo-borde px-4 py-2 text-sm font-semibold text-corporativo-oscuro hover:bg-corporativo-fondo disabled:opacity-40 transition-colors cursor-pointer"
                    disabled={page === 1 || loading}
                    onClick={() =>
                      setPage((p) => p - 1)
                    }
                  >
                    Anterior
                  </button>

                  <span className="text-sm font-semibold text-corporativo-oscuro whitespace-nowrap">
                    Página {page} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    className="rounded-xl border border-corporativo-borde px-4 py-2 text-sm font-semibold text-corporativo-oscuro hover:bg-corporativo-fondo disabled:opacity-40 transition-colors cursor-pointer"
                    disabled={page >= totalPaginas || loading}
                    onClick={() =>
                      setPage((p) => p + 1)
                    }
                  >
                    Siguiente
                  </button>
                </div>

              </div>
            </>
          )}
        </section>
      </section>
    </LayoutAdministrador>
  );
}