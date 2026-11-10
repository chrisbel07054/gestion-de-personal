import { useEffect, useState } from 'react';
import { getHorarioEmpleado } from '../../../services/horarioService';

export default function ExpedienteHorario({ empleadoId }) {
  const [horario, setHorario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarHorario = async () => {
    if (!empleadoId) return;

    try {
      setLoading(true);
      setError('');

      const horarioData = await getHorarioEmpleado(empleadoId);

      setHorario(horarioData || null);
    } catch (err) {
      console.error('Error cargando horario:', err);

      setError(
        err?.response?.data?.mensaje ||
          err?.message ||
          'No se pudo obtener el horario del empleado.'
      );

      setHorario(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHorario();
  }, [empleadoId]);

  if (loading) {
    return (
      <div className="text-center text-xs text-corporativo-oscuro font-medium py-4">
        Cargando horario...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">

      {/* ERROR */}
      {error && (
        <div className="text-xs sm:text-sm text-corporativo-boton font-medium flex items-center gap-1.5 animate-fadeIn">
          <span>{error}</span>
        </div>
      )}

      {/* CABECERA */}
      <div className="pb-3 border-b border-corporativo-borde/60">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-corporativo-principal shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <h3 className="text-xs sm:text-sm font-bold text-corporativo-oscuro uppercase tracking-wider">
                Horario laboral
              </h3>
            </div>

            <p className="hidden sm:block text-xs text-corporativo-boton mt-1 leading-relaxed">
              Visualice el turno de entrada, salida y días laborables asignados al empleado.
            </p>
          </div>

          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-corporativo-borde bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-corporativo-oscuro shadow-2xs">
            <svg
              className="w-3 h-3 text-corporativo-principal"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>

            Solo lectura
          </span>
        </div>

        {/* Descripción independiente en móvil */}
        <p className="sm:hidden mt-1 text-xs text-corporativo-boton leading-relaxed">
          Visualice el turno de entrada, salida y días laborables asignados al empleado.
        </p>
      </div>

      {/* AVISO SIN HORARIO */}
      {!horario && !error && (
        <div className="text-xs sm:text-sm text-corporativo-boton font-medium flex items-center gap-1.5 animate-fadeIn">
          <span>
            Este empleado no tiene un horario asignado.
          </span>
        </div>
      )}

      {/* INFORMACIÓN DEL HORARIO */}
      {horario && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6 pt-1">

          {/* ENTRADA */}
          <div className="space-y-1 text-left">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-corporativo-claro2">
              Entrada
            </p>

            <p className="text-xs sm:text-sm font-bold text-corporativo-oscuro font-mono">
              {horario.horaEntrada || '—'}
            </p>
          </div>

          {/* SALIDA */}
          <div className="space-y-1 border-l border-corporativo-borde/60 pl-5 sm:pl-6 text-left">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-corporativo-claro2">
              Salida
            </p>

            <p className="text-xs sm:text-sm font-bold text-corporativo-oscuro font-mono">
              {horario.horaSalida || '—'}
            </p>
          </div>

          {/* DÍAS LABORABLES */}
          <div className="col-span-2 space-y-1 sm:col-span-2 sm:border-l sm:border-corporativo-borde/60 sm:pl-6">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-corporativo-claro2">
              Días laborables
            </p>

            <p className="text-xs sm:text-sm font-semibold text-corporativo-oscuro leading-relaxed">
              {Array.isArray(horario.diasLaborales) &&
              horario.diasLaborales.length > 0
                ? horario.diasLaborales.join(', ')
                : 'Sin días asignados'}
            </p>
          </div>

        </div>
      )}

    </div>
  );
}