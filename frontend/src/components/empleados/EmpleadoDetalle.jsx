import { useState } from 'react';

import ExpedienteGeneral from './expediente/ExpedienteGeneral.jsx';
import ExpedienteHorario from './expediente/ExpedienteHorario.jsx';
import ExpedienteAsistencia from './expediente/ExpedienteAsistencia.jsx';
import ExpedienteVacaciones from './expediente/ExpedienteVacaciones.jsx';
import ExpedienteReposos from './expediente/ExpedienteReposos.jsx';
import ExpedientePermisos from './expediente/ExpedientePermisos.jsx';
import ExpedienteObservaciones from './expediente/ExpedienteObservaciones.jsx';

export default function EmpleadoDetalle({ empleado }) {
  const [tabActiva, setTabActiva] = useState('general');

  if (!empleado) return null;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'horario', label: 'Horario' },
    { id: 'asistencia', label: 'Asistencia' },
    { id: 'vacaciones', label: 'Vacaciones' },
    { id: 'reposos', label: 'Reposos' },
    { id: 'permisos', label: 'Permisos' },
    { id: 'observaciones', label: 'Observaciones' },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-200 px-4 pt-4 sm:px-6 sm:pt-5">

        {/* Distribución equitativa con grid para llenar todo el ancho */}
        <div className="grid grid-flow-col auto-cols-fr overflow-x-auto scrollbar-thin text-center">

          {tabs.map((tab) => {
            const isActive = tabActiva === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabActiva(tab.id)}
                className={`relative px-2 sm:px-4 py-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-corporativo-principal'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}

                {isActive && (
                  <span className="absolute bottom-0 left-1 right-1 sm:left-2 sm:right-2 h-0.5 rounded-full bg-corporativo-principal" />
                )}
              </button>
            );
          })}

        </div>
      </div>

      <div className="p-5 sm:p-7">

        {tabActiva === 'general' && (
          <ExpedienteGeneral empleado={empleado} />
        )}

        {tabActiva === 'horario' && (
          <ExpedienteHorario empleadoId={empleado.id} />
        )}

        {tabActiva === 'asistencia' && (
          <ExpedienteAsistencia empleadoId={empleado.id} />
        )}

        {tabActiva === 'vacaciones' && (
          <ExpedienteVacaciones empleadoId={empleado.id} />
        )}

        {tabActiva === 'reposos' && (
          <ExpedienteReposos empleadoId={empleado.id} />
        )}

        {tabActiva === 'permisos' && (
          <ExpedientePermisos empleadoId={empleado.id} />
        )}

        {tabActiva === 'observaciones' && (
          <ExpedienteObservaciones empleadoId={empleado.id} />
        )}

      </div>

    </section>
  );
}