import { useState } from 'react';
import LayoutRRHH from '../layouts/LayoutRRHH.jsx';
import EmpleadoFotoForm from '../components/empleados/EmpleadoFotoForm.jsx';
import useEmpleado from '../hooks/useEmpleado.js';

import ExpedienteGeneral from '../components/empleados/expediente/ExpedienteGeneral.jsx';
import ExpedienteHorario from '../components/empleados/expediente/ExpedienteHorario.jsx';
import ExpedienteAsistencia from '../components/empleados/expediente/ExpedienteAsistencia.jsx';
import ExpedienteVacaciones from '../components/empleados/expediente/ExpedienteVacaciones.jsx';
import ExpedienteReposos from '../components/empleados/expediente/ExpedienteReposos.jsx';
import ExpedientePermisos from '../components/empleados/expediente/ExpedientePermisos.jsx';
import ExpedienteObservaciones from '../components/empleados/expediente/ExpedienteObservaciones.jsx';

export default function EmpleadoPage() {
  const {
    empleado,
    loading,
    error,
    showFoto,
    fotoUrl,
    esActivo,
    handleUploadFoto,
    volverAEmpleados,
    abrirFoto,
    cerrarFoto,
  } = useEmpleado();

  const [tabActiva, setTabActiva] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'horario', label: 'Horario' },
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'vacaciones', label: 'Vacaciones' },
    { id: 'reposos', label: 'Reposos' },
    { id: 'permisos', label: 'Permisos' },
    { id: 'observaciones', label: 'Observaciones' },
  ];

  if (loading) {
    return (
      <LayoutRRHH>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-corporativo-borde bg-white shadow-sm">
            <div className="text-center px-4">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-corporativo-borde border-t-corporativo-principal" />
              <p className="text-sm font-semibold text-corporativo-oscuro">
                Cargando expediente...
              </p>
              <p className="mt-1 text-xs text-corporativo-claro2">
                Obteniendo información del empleado
              </p>
            </div>
          </div>
        </section>
      </LayoutRRHH>
    );
  }

  if (error || !empleado) {
    return (
      <LayoutRRHH>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-3xl border border-corporativo-borde bg-white p-8 shadow-sm max-w-lg mx-auto text-center">
            
            {/* ERROR ESTILO TEXTO (IGUAL AL LOGIN) */}
            {error && (
              <div className="text-sm text-corporativo-boton font-medium flex items-center justify-center gap-1.5 mb-4 animate-fadeIn">
                <span>{error}</span>
              </div>
            )}

            {!error && !empleado && (
              <div className="text-sm text-corporativo-boton font-medium flex items-center justify-center gap-1.5 mb-4 animate-fadeIn">
                <span>Empleado no encontrado.</span>
              </div>
            )}

            <button
              type="button"
              onClick={volverAEmpleados}
              className="rounded-xl bg-corporativo-principal px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver a empleados</span>
            </button>
          </div>
        </section>
      </LayoutRRHH>
    );
  }

  return (
    <LayoutRRHH>
      <section className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        <div className="rounded-2xl sm:rounded-3xl border border-corporativo-borde bg-white shadow-sm overflow-hidden">
          
          {/* Cabecera del empleado */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-corporativo-borde bg-corporativo-fondo/20">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 min-w-0 w-full text-center sm:text-left">
                
                <div className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 shrink-0 overflow-hidden rounded-2xl border-2 border-corporativo-borde bg-corporativo-fondo shadow-xs flex items-center justify-center mx-auto sm:mx-0">
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt={`Foto de ${empleado.nombre}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold text-corporativo-principal">
                      {empleado.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>

                <div className="min-w-0 space-y-2 flex-1 w-full flex flex-col justify-center">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-corporativo-oscuro leading-tight break-words">
                      {empleado.nombre} {empleado.apellido || ''}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wide ${
                        esActivo
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${
                          esActivo ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {esActivo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-bold text-corporativo-claro2 tracking-wider uppercase">
                      Cédula:{' '}
                      <span className="font-semibold text-corporativo-oscuro">
                        {empleado.cedula}
                      </span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-corporativo-borde/60 space-y-1.5 text-xs sm:text-sm max-w-lg mx-auto sm:mx-0 w-full">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="font-semibold text-corporativo-claro2 flex items-center gap-1 shrink-0">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-corporativo-principal" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Cargo:
                      </span>
                      <span className="font-bold text-corporativo-oscuro truncate text-right sm:text-left">
                        {empleado.cargo?.nombre || 'Sin cargo'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span className="font-semibold text-corporativo-claro2 flex items-center gap-1 shrink-0">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-corporativo-principal" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Departamento:
                      </span>
                      <span className="font-bold text-corporativo-oscuro truncate text-right sm:text-left">
                        {empleado.departamento?.nombre || 'Sin departamento'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0 self-stretch sm:self-center pt-3 lg:pt-0 border-t lg:border-t-0 border-corporativo-borde/60">
                <button
                  type="button"
                  onClick={volverAEmpleados}
                  className="flex-1 sm:flex-none rounded-xl border border-corporativo-borde px-4 py-2.5 text-xs sm:text-sm font-semibold text-corporativo-oscuro hover:bg-corporativo-fondo transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <svg className="w-4 h-4 text-corporativo-oscuro" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Volver</span>
                </button>

                <button
                  type="button"
                  onClick={abrirFoto}
                  className="flex-1 sm:flex-none rounded-xl bg-corporativo-principal px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{empleado.foto ? 'Cambiar foto' : 'Subir foto'}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Barra de Pestañas Responsive */}
          <div className="border-b border-corporativo-borde bg-corporativo-fondo/30 w-full overflow-x-auto scrollbar-none">
            <div className="flex sm:grid sm:grid-flow-col sm:auto-cols-fr text-center min-w-max sm:min-w-0 w-full">
              {tabs.map((tab) => {
                const isActive = tabActiva === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTabActiva(tab.id)}
                    className={`relative px-4 sm:px-3 py-3.5 text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-corporativo-oscuro bg-white shadow-xs'
                        : 'text-corporativo-claro2 hover:text-corporativo-oscuro hover:bg-white/50'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-corporativo-principal" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido dinámico de las pestañas */}
          <div className="p-4 sm:p-7 bg-white">
            {tabActiva === 'general' && <ExpedienteGeneral empleado={empleado} />}
            {tabActiva === 'horario' && <ExpedienteHorario empleadoId={empleado.id} />}
            {tabActiva === 'asistencia' && <ExpedienteAsistencia empleadoId={empleado.id} />}
            {tabActiva === 'vacaciones' && <ExpedienteVacaciones empleadoId={empleado.id} />}
            {tabActiva === 'reposos' && <ExpedienteReposos empleadoId={empleado.id} />}
            {tabActiva === 'permisos' && <ExpedientePermisos empleadoId={empleado.id} />}
            {tabActiva === 'observaciones' && <ExpedienteObservaciones empleadoId={empleado.id} />}
          </div>

        </div>

        {showFoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-corporativo-oscuro/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-md my-auto animate-fadeIn">
              <EmpleadoFotoForm
                empleadoId={empleado.id}
                onClose={cerrarFoto}
                onUpload={handleUploadFoto}
              />
            </div>
          </div>
        )}

      </section>
    </LayoutRRHH>
  );
}