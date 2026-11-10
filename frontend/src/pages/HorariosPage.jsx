import LayoutRRHH from '../layouts/LayoutRRHH.jsx';
import logoInstitucion from '../assets/IVSS.svg';
import AsignarHorarioDepartamento from '../components/horarios/AsignarHorarioDepartamento.jsx';
import ListaHorarios from '../components/horarios/ListaHorarios.jsx';
import HorarioForm from '../components/horarios/HorarioForm.jsx';
import useHorarios from '../hooks/useHorarios.js';

export default function HorariosPage() {
  const {
    empleados,
    departamentos,
    cargos,
    horarios,
    userName,
    loading,
    submitting,
    page,
    limit,
    busqueda,
    filtroDepartamento,
    showEditar,
    showAsignar,
    empleadoSeleccionado,
    horarioEmpleado,
    setBusqueda,
    setFiltroDepartamento,
    setHorarioEmpleado,
    setShowAsignar,
    handleSearchSubmit,
    ejecutarAsignarDepartamento,
    abrirEditar,
    guardarHorarioEmpleado,
    cambiarLimit,
    irPaginaAnterior,
    irPaginaSiguiente,
    cerrarAsignar,
    cerrarEditar,
    canPrevious,
    canNext,
    totalEmpleados,
  } = useHorarios();

  return (
    <LayoutRRHH>
      <section className="w-full px-3 sm:px-6 pt-3 pb-6">

        {/* CABECERA */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-corporativo-borde shadow-sm">
          
          <div className="flex items-center gap-4">
            <img
              src={logoInstitucion}
              alt="Logo"
              className="h-14 w-auto object-contain"
            />

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-corporativo-oscuro tracking-tight">
                Horarios
              </h1>

              <p className="mt-1 text-sm text-corporativo-boton">
                Gestión de jornadas laborales del personal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAsignar(true)}
              className="
                rounded-xl
                bg-corporativo-principal
                px-5 py-2.5
                text-sm font-semibold text-white
                shadow-sm
                hover:opacity-90
                transition-opacity
                cursor-pointer
                flex items-center gap-2
              "
            >
              <span>+ Asignar horario</span>
            </button>

            <div className="rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3.5 py-2 text-xs font-bold text-corporativo-oscuro">
              {userName}
            </div>
          </div>
        </div>

        {/*  LISTA DE HORARIOS */}
        <ListaHorarios
          empleados={empleados}
          departamentos={departamentos}
          cargos={cargos}
          horarios={horarios}
          loading={loading}
          onEditar={abrirEditar}
          onSearchSubmit={handleSearchSubmit}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          filtroDepartamento={filtroDepartamento}
          setFiltroDepartamento={setFiltroDepartamento}
          limit={limit}
          setLimit={cambiarLimit}
          page={page}
          canPrevious={canPrevious}
          canNext={canNext}
          onPrevPage={irPaginaAnterior}
          onNextPage={irPaginaSiguiente}
          totalEmpleados={totalEmpleados}
        />

        {/*  MODAL: ASIGNAR HORARIO MASIVO */}
        {showAsignar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-700/50 space-y-5 my-auto">

              {/* Encabezado del modal */}
              <div className="flex justify-between items-center mb-2">
                
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Asignar horario masivo
                  </h2>

                  <p className="text-sm text-slate-400">
                    Aplicar jornada por departamento
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cerrarAsignar}
                  className="
                    h-8 w-8
                    rounded-xl
                    bg-slate-800
                    border border-slate-700
                    flex items-center justify-center
                    text-slate-400
                    hover:text-white
                    hover:bg-slate-700
                    transition-all
                    cursor-pointer
                  "
                >
                  ✕
                </button>
              </div>

              {/* Formulario de asignación */}
              <AsignarHorarioDepartamento
                departamentos={departamentos}
                onAsignarMasivo={ejecutarAsignarDepartamento}
                submitting={submitting}
              />
            </div>
          </div>
        )}

        {/*  MODAL: EDITAR HORARIO */}
        {showEditar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-700/50 space-y-5 my-auto">

              {/* Encabezado del modal */}
              <div className="flex justify-between items-center mb-2">
                
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Editar Horario
                  </h2>

                  <p className="text-sm text-slate-400">
                    {empleadoSeleccionado?.nombre}{' '}
                    {empleadoSeleccionado?.apellido}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cerrarEditar}
                  className="
                    h-8 w-8
                    rounded-xl
                    bg-slate-800
                    border border-slate-700
                    flex items-center justify-center
                    text-slate-400
                    hover:text-white
                    hover:bg-slate-700
                    transition-all
                    cursor-pointer
                  "
                >
                  ✕
                </button>
              </div>

              {/* Formulario de edición */}
              <HorarioForm
                empleadoSeleccionado={empleadoSeleccionado}
                horarioEmpleado={horarioEmpleado}
                setHorarioEmpleado={setHorarioEmpleado}
                onGuardar={guardarHorarioEmpleado}
                onCerrar={cerrarEditar}
                submitting={submitting}
              />

            </div>
          </div>
        )}
      </section>
    </LayoutRRHH>
  );
}