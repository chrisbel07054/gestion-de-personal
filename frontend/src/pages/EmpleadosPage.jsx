import LayoutRRHH from '../layouts/LayoutRRHH.jsx';
import EmpleadoForm from '../components/empleados/EmpleadoForm.jsx';
import EmpleadoFotoForm from '../components/empleados/EmpleadoFotoForm.jsx';
import EmpleadoFiltros from '../components/empleados/EmpleadoFiltros.jsx';
import EmpleadoTabla from '../components/empleados/EmpleadoTabla.jsx';
import logoInstitucion from '../assets/IVSS.svg';
import useEmpleados from '../hooks/useEmpleados.js';

export default function EmpleadosPage() {
  const {
    empleados,
    departamentos,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    busqueda,
    setBusqueda,
    filtroDepartamento,
    setFiltroDepartamento,
    filtroEstado,
    setFiltroEstado,
    totalPaginas,
    totalEmpleados,
    canPrevious,
    canNext,
    showCreate,
    showEdit,
    showFoto,
    selectedEmpleado,
    submitting,
    loadData,
    obtenerUrlFoto,
    obtenerNombreDepartamento,
    obtenerNombreCargo,
    handleSearchSubmit,
    handleCreate,
    handleEdit,
    handleOpenEdit,
    handleOpenDetail,
    handleUploadFoto,
    handleCambiarEstado,
    abrirCrear,
    cerrarCrear,
    cerrarEditar,
    abrirFoto,
    cerrarFoto,
    handlePreviousPage,
    handleNextPage,
  } = useEmpleados();

  return (
    <LayoutRRHH>
      <section className="w-full px-3 sm:px-6 pt-3 pb-6">
        {/* Cabecera principal */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-corporativo-borde shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={logoInstitucion}
              alt="Logo Institución"
              className="h-14 w-auto object-contain"
            />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-corporativo-oscuro tracking-tight">
                Empleados
              </h1>
              <p className="mt-1 text-sm text-corporativo-boton">
                Gestión integral del personal de Recursos Humanos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              className="rounded-xl bg-corporativo-principal px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              onClick={abrirCrear}
            >
              + Nuevo empleado
            </button>
            <div className="rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3.5 py-2 text-xs font-bold text-corporativo-oscuro">
              RRHH
            </div>
          </div>
        </div>

        {/* Modal crear */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-corporativo-oscuro/50 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
            <div className="w-full max-w-3xl my-auto">
              <EmpleadoForm
                mode="create"
                loading={submitting}
                onSubmit={handleCreate}
                onCancel={cerrarCrear}
              />
            </div>
          </div>
        )}

        {/* Modal editar */}
        {showEdit && selectedEmpleado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-corporativo-oscuro/50 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
            <div className="w-full max-w-3xl my-auto">
              <EmpleadoForm
                mode="edit"
                empleado={selectedEmpleado}
                loading={submitting}
                onSubmit={handleEdit}
                onCancel={cerrarEditar}
              />
            </div>
          </div>
        )}

        {/* Modal fotografía */}
        {showFoto && selectedEmpleado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-corporativo-oscuro/50 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
            <div className="w-full max-w-xl my-auto">
              <EmpleadoFotoForm
                empleadoId={selectedEmpleado.id}
                onClose={cerrarFoto}
                onUpload={handleUploadFoto}
              />
            </div>
          </div>
        )}

        {/* Filtros y tabla */}
        <section className="rounded-3xl border border-corporativo-borde bg-white p-4 sm:p-6 shadow-sm">
          <EmpleadoFiltros
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            filtroDepartamento={filtroDepartamento}
            setFiltroDepartamento={setFiltroDepartamento}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            departamentos={departamentos}
            limit={limit}
            setLimit={setLimit}
            setPage={setPage}
            onSearchSubmit={handleSearchSubmit}
          />

          <EmpleadoTabla
            empleados={empleados}
            loading={loading}
            obtenerUrlFoto={obtenerUrlFoto}
            obtenerNombreDepartamento={obtenerNombreDepartamento}
            obtenerNombreCargo={obtenerNombreCargo}
            handleOpenDetail={handleOpenDetail}
            handleOpenEdit={handleOpenEdit}
            handleCambiarEstado={handleCambiarEstado}
            handleOpenFoto={abrirFoto}
          />

          {/* Paginación */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-corporativo-borde">
            <div className="text-sm font-medium text-corporativo-boton">
              Total de empleados: {totalEmpleados}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-corporativo-borde px-4 py-2 text-sm font-semibold text-corporativo-oscuro hover:bg-corporativo-fondo disabled:opacity-40 transition-colors cursor-pointer"
                disabled={!canPrevious || loading}
                onClick={handlePreviousPage}
              >
                Anterior
              </button>

              <span className="text-sm font-semibold text-corporativo-oscuro">
                Página {page} de {totalPaginas}
              </span>

              <button
                type="button"
                className="rounded-xl border border-corporativo-borde px-4 py-2 text-sm font-semibold text-corporativo-oscuro hover:bg-corporativo-fondo disabled:opacity-40 transition-colors cursor-pointer"
                disabled={!canNext || loading}
                onClick={handleNextPage}
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