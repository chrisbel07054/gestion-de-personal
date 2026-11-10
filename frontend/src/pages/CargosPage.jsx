import LayoutAdministrador from '../layouts/LayoutAdministrador.jsx';
import logoInstitucion from '../assets/IVSS.svg';
import useCargos from '../hooks/useCargos.js';
import { useAuthStore } from '../store/authStore.js';

export default function Cargos() {
  const {
    cargos,
    loading,
    errorForm,
    setErrorForm,
    showModal,
    modalMode,
    formNombre,
    formDescripcion,
    submitting,
    setFormNombre,
    setFormDescripcion,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleSubmit,
    handleInactivar,
    handleActivar,
  } = useCargos();

  const { usuario } = useAuthStore();

  const handleCapitalizeChange = (setter) => (e) => {
    const val = e.target.value;
    setter(val.charAt(0).toUpperCase() + val.slice(1));
    if (errorForm) setErrorForm('');
  };

  return (
    <LayoutAdministrador>
      <section className="w-full px-3 sm:px-6 pt-3 pb-6">
        {/* Cabecera Principal */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-corporativo-borde shadow-sm">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 min-w-0">
              <img src={logoInstitucion} alt="Logo Institución" className="h-14 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-corporativo-oscuro tracking-tight leading-tight">
                  Gestión de Cargos
                </h1>
                <div className="hidden sm:flex mt-1 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-corporativo-boton">
                  <span>Administre los puestos y cargos institucionales de la organización.</span>
                </div>
              </div>
            </div>
            <div className="sm:hidden mt-1 text-sm text-corporativo-boton leading-relaxed">
              Administre los puestos y cargos institucionales de la organización.
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={submitting}
              className="rounded-xl bg-corporativo-principal px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center gap-2"
            >
              <span>+ Nuevo Cargo</span>
            </button>
            <div className="rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3.5 py-2 text-xs font-bold text-corporativo-oscuro whitespace-nowrap">
              {usuario?.usuario || usuario?.nombre || 'Administrador'}
            </div>
          </div>
        </div>

        {/* Listado de Cargos */}
        <section className="bg-white rounded-3xl border border-corporativo-borde/40 p-6 shadow-sm space-y-6">
          <div className="border-b border-corporativo-borde/40 pb-4">
            <h2 className="text-lg font-bold text-corporativo-oscuro">Listado de Cargos</h2>
            <p className="text-xs text-corporativo-boton mt-0.5">Visualice, edite o controle el estado operativo de cada cargo institucional.</p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm font-semibold text-corporativo-oscuro">Cargando cargos...</div>
          ) : (
            <>
              {/* Tarjetas Móviles */}
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {cargos.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-corporativo-borde p-8 text-center text-sm text-corporativo-oscuro">
                    No hay cargos registrados.
                  </div>
                ) : (
                  cargos.map((item) => {
                    const esInactivo = item.estado === 'Inactivo';
                    return (
                      <div key={item.id} className="rounded-2xl border border-corporativo-borde p-4 bg-white shadow-xs space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-corporativo-oscuro text-base leading-snug">{item.nombre}</h3>
                            <p className="text-xs text-corporativo-boton mt-1.5 leading-relaxed">{item.descripcion || 'Sin descripción'}</p>
                          </div>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold border shrink-0 ${esInactivo ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {item.estado || 'Activo'}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-corporativo-borde/60">
                          <button
                            type="button"
                            title="Editar Cargo"
                            disabled={submitting}
                            onClick={() => handleOpenEdit(item)}
                            className="p-2.5 rounded-xl border border-corporativo-boton/40 text-corporativo-boton bg-corporativo-fondo hover:bg-corporativo-principal hover:text-white disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {esInactivo ? (
                            <button
                              type="button"
                              title="Reactivar Cargo"
                              disabled={submitting}
                              onClick={() => handleActivar(item)}
                              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Inactivar Cargo"
                              disabled={submitting}
                              onClick={() => handleInactivar(item)}
                              className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.7 5.7l12.6 12.6" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Tabla de Escritorio */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full border-collapse text-center text-sm">
                  <thead>
                    <tr className="bg-corporativo-fondo text-xs font-bold uppercase tracking-wider text-corporativo-principal">
                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40">Nombre</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40">Descripción</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40">Estado</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-corporativo-borde/40">
                    {cargos.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-12 text-center text-sm text-corporativo-boton">
                          No hay cargos registrados.
                        </td>
                      </tr>
                    ) : (
                      cargos.map((item) => {
                        const esInactivo = item.estado === 'Inactivo';
                        return (
                          <tr key={item.id} className="hover:bg-corporativo-fondo/50 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-corporativo-oscuro">{item.nombre}</td>
                            <td className="px-4 py-3.5">
                              {item.descripcion ? (
                                <span className="text-corporativo-boton">{item.descripcion}</span>
                              ) : (
                                <span className="text-slate-400 italic text-xs">Sin descripción registrada</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold border ${esInactivo ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                {item.estado || 'Activo'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  title="Editar Cargo"
                                  disabled={submitting}
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-2 rounded-xl border border-corporativo-boton/40 text-corporativo-boton bg-corporativo-fondo hover:bg-corporativo-principal hover:text-white disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>

                                {esInactivo ? (
                                  <button
                                    type="button"
                                    title="Reactivar Cargo"
                                    disabled={submitting}
                                    onClick={() => handleActivar(item)}
                                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    title="Inactivar Cargo"
                                    disabled={submitting}
                                    onClick={() => handleInactivar(item)}
                                    className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <circle cx="12" cy="12" r="9" strokeWidth="2" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.7 5.7l12.6 12.6" />
                                    </svg>
                                  </button>
                                )}
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
          )}
        </section>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {modalMode === 'create' ? 'Nuevo Cargo' : 'Editar Cargo'}
                </h3>
                <button
                  type="button"
                  disabled={submitting}
                  className="h-9 w-9 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center font-bold"
                  onClick={handleCloseModal}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errorForm && (
                  <div className="mb-4 text-corporativo-claro1 font-medium flex items-center gap-2">
                    <p>{errorForm}</p>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Nombre del Cargo *</label>
                  <input
                    type="text"
                    value={formNombre}
                    onChange={handleCapitalizeChange(setFormNombre)}
                    disabled={submitting}
                    placeholder="Ej. Analista de Sistemas"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 text-white placeholder-slate-500 disabled:opacity-50 transition-all"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Descripción</label>
                  <textarea
                    value={formDescripcion}
                    onChange={handleCapitalizeChange(setFormDescripcion)}
                    rows="3"
                    disabled={submitting}
                    placeholder="Breve descripción del cargo..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 text-white placeholder-slate-500 disabled:opacity-50 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-corporativo-boton border border-slate-700/80 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-corporativo-principal active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </LayoutAdministrador>
  );
}