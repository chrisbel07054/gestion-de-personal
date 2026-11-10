import { useEffect, useState, useCallback } from 'react';
import { getHistorialEmpleado } from '../../../services/asistenciaService';
import { getHorarioEmpleado } from '../../../services/horarioService';
import EstadoBadge from '../../../components/comunes/EstadoBadge.jsx';

const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const obtenerInicioSemana = (fecha) => {
  const d = new Date(fecha);
  const dia = d.getDay();
  d.setDate(d.getDate() + (dia === 0 ? -6 : 1 - dia));
  d.setHours(0, 0, 0, 0);
  return d;
};

const obtenerFinSemana = (inicio) => {
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  fin.setHours(0, 0, 0, 0);
  return fin;
};

const formatearFechaAPI = (fecha) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
const formatearFechaVisual = (fecha) => `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;

const parsearFechaLocal = (str) => {
  const [año, mes, dia] = str.split('-').map(Number);
  return new Date(año, mes - 1, dia);
};

const normalizarDia = (dia) => (dia || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

const obtenerFinJornada = (fecha, horaEntrada, horaSalida) => {
  if (!fecha || !horaEntrada || !horaSalida) return null;
  const fechaLocal = parsearFechaLocal(fecha);
  const [horaInicio, minutoInicio] = String(horaEntrada).split(':').map(Number);
  const [horaFin, minutoFin] = String(horaSalida).split(':').map(Number);

  if (Number.isNaN(fechaLocal.getTime()) || [horaInicio, minutoInicio, horaFin, minutoFin].some(Number.isNaN)) {
    return null;
  }

  const inicio = new Date(fechaLocal);
  inicio.setHours(horaInicio, minutoInicio, 0, 0);
  const fin = new Date(fechaLocal);
  fin.setHours(horaFin, minutoFin, 0, 0);

  if (fin <= inicio) {
    fin.setDate(fin.getDate() + 1);
  }
  return fin;
};

const obtenerEstadoSalida = (asistencia, horario, ahora = new Date()) => {
  if (!asistencia?.horaEntrada || asistencia.horaSalida) return null;
  const finJornada = obtenerFinJornada(asistencia.fecha, horario?.horaEntrada, horario?.horaSalida);
  if (!finJornada || ahora < finJornada) return null;
  return 'No registrada';
};

export default function ExpedienteAsistencia({ empleadoId }) {
  const [asistencias, setAsistencias] = useState([]);
  const [horario, setHorario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [semanaActual, setSemanaActual] = useState(() => obtenerInicioSemana(new Date()));

  const fechaInicio = semanaActual;
  const fechaFin = obtenerFinSemana(semanaActual);

  const construirSemanaLaboral = (asistenciasData, horarioData) => {
    const diasLaboralesNorm = (horarioData?.diasLaborales || []).map(normalizarDia);
    const asistenciasMap = new Map(asistenciasData.map((item) => [item.fecha, item]));
    const registros = [];
    const ahora = new Date();

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fechaInicio.getDate() + i);
      const fechaAPI = formatearFechaAPI(fecha);

      if (asistenciasMap.has(fechaAPI)) {
        const asistencia = asistenciasMap.get(fechaAPI);
        const estadoSalida = obtenerEstadoSalida({ ...asistencia, fecha: fechaAPI }, horarioData, ahora);
        registros.push({ ...asistencia, fecha: fechaAPI, estadoSalida });
        continue;
      }

      if (!diasLaboralesNorm.includes(DIAS[fecha.getDay()])) continue;

      registros.push({
        id: `sin-registro-${fechaAPI}`,
        fecha: fechaAPI,
        horaEntrada: null,
        horaSalida: null,
        estado: 'Sin registro',
        observacion: null, // Sin observación por defecto
      });
    }
    return registros;
  };

  const cargarAsistencia = useCallback(async (isInitial = false) => {
    if (!empleadoId) return;
    try {
      if (isInitial) setLoading(true);
      setError('');
      const [horarioData, asistenciasData] = await Promise.all([
        getHorarioEmpleado(empleadoId),
        getHistorialEmpleado(empleadoId, { desde: formatearFechaAPI(fechaInicio), hasta: formatearFechaAPI(fechaFin) }),
      ]);
      setHorario(horarioData);
      setAsistencias(construirSemanaLaboral(Array.isArray(asistenciasData) ? asistenciasData : [], horarioData));
    } catch (err) {
      console.error('Error cargando asistencia:', err);
      setError(err?.response?.data?.mensaje || err?.message || 'No se pudo obtener el historial de asistencia.');
      setAsistencias([]);
      setHorario(null);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [empleadoId, semanaActual]);

  useEffect(() => {
    if (empleadoId) cargarAsistencia(true);
  }, [empleadoId, cargarAsistencia]);

  const cambiarSemana = (offset) => {
    const nueva = new Date(semanaActual);
    nueva.setDate(nueva.getDate() + offset);
    setSemanaActual(obtenerInicioSemana(nueva));
  };

  if (loading) {
    return <div className="text-center text-xs text-corporativo-oscuro font-medium py-6">Cargando registros de asistencia...</div>;
  }

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="text-xs sm:text-sm text-corporativo-boton font-medium flex items-center gap-1.5 animate-fadeIn">
          <span>{error}</span>
        </div>
      )}

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-corporativo-borde/60 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-corporativo-principal" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-xs sm:text-sm font-bold text-corporativo-oscuro uppercase tracking-wider">Historial de asistencia</h3>
          </div>
          <p className="text-xs text-corporativo-boton mt-0.5">Consulte el registro diario de entradas, salidas y el estado de asistencia por semana.</p>
        </div>
        <span className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-full border border-corporativo-borde bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-corporativo-oscuro shadow-2xs">
          Solo lectura
        </span>
      </div>

      {/* AVISO SIN HORARIO */}
      {!horario && (
        <div className="text-xs sm:text-sm text-corporativo-boton font-medium flex items-center gap-1.5 animate-fadeIn">
          <span>Este empleado no tiene un horario asignado.</span>
        </div>
      )}

      {/* NAVEGACIÓN SEMANAL */}
      <div className="pt-1">
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-corporativo-principal">Semana activa</p>
            <p className="text-sm font-extrabold text-corporativo-claro2 mt-0.5 tracking-wide">
              {formatearFechaVisual(fechaInicio)} — {formatearFechaVisual(fechaFin)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => cambiarSemana(-7)} className="w-full rounded-xl bg-corporativo-principal px-3 py-2 text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5">
              <span>←</span> <span>Semana anterior</span>
            </button>
            <button type="button" onClick={() => cambiarSemana(7)} className="w-full rounded-xl bg-corporativo-principal px-3 py-2 text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-1.5">
              <span>Semana siguiente</span> <span>→</span>
            </button>
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-between gap-3">
          <button type="button" onClick={() => cambiarSemana(-7)} className="rounded-xl bg-corporativo-principal px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 cursor-pointer flex items-center gap-2">
            ← Semana anterior
          </button>
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-corporativo-principal">Semana activa</p>
            <p className="text-base font-extrabold text-corporativo-claro2 mt-0.5 tracking-wide">
              {formatearFechaVisual(fechaInicio)} — {formatearFechaVisual(fechaFin)}
            </p>
          </div>
          <button type="button" onClick={() => cambiarSemana(7)} className="rounded-xl bg-corporativo-principal px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 cursor-pointer flex items-center gap-2">
            Semana siguiente →
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="w-full overflow-hidden pt-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-corporativo-fondo text-center text-[11px] font-bold uppercase tracking-wider text-corporativo-principal border-b border-corporativo-borde">
                <th className="px-4 py-2.5">Día</th>
                <th className="px-4 py-2.5">Entrada</th>
                <th className="px-4 py-2.5">Salida</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5">Registrado por</th>
                <th className="px-4 py-2.5 text-left">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-corporativo-borde text-sm">
              {asistencias.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-corporativo-oscuro text-xs">
                    No hay días laborales configurados para esta semana.
                  </td>
                </tr>
              ) : (
                asistencias.map((item, index) => {
                  const fechaObj = item.fecha ? parsearFechaLocal(item.fecha) : null;
                  return (
                    <tr key={item.id || index} className="hover:bg-corporativo-fondo/40 transition-colors">
                      {/* DÍA Y FECHA */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="font-bold capitalize text-corporativo-oscuro text-xs sm:text-sm">
                          {fechaObj ? DIAS[fechaObj.getDay()] : '—'}
                        </div>
                        <div className="text-[10px] text-corporativo-claro2 font-mono">
                          {fechaObj ? formatearFechaVisual(fechaObj) : '—'}
                        </div>
                      </td>

                      {/* HORA DE ENTRADA */}
                      <td className="px-4 py-2.5 text-center">
                        {item.horaEntrada ? (
                          <span className="font-mono text-xs font-semibold text-corporativo-oscuro">{item.horaEntrada}</span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Pendiente</span>
                        )}
                      </td>

                      {/* HORA DE SALIDA */}
                      <td className="px-4 py-2.5 text-center">
                        {item.horaSalida ? (
                          <span className="font-mono text-xs font-semibold text-corporativo-oscuro">{item.horaSalida}</span>
                        ) : item.estadoSalida === 'No registrada' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-0.5 font-semibold text-rose-700 text-xs border border-rose-200">
                            No registrada
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Pendiente</span>
                        )}
                      </td>

                      {/* ESTADO BADGE */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex justify-center">
                          <EstadoBadge estado={item.estado || 'Sin registro'} />
                        </div>
                      </td>

                      {/* REGISTRADO POR */}
                      <td className="px-4 py-2.5 text-center">
                        {item.registradoPor ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-semibold text-corporativo-oscuro">{item.registradoPor.nombre || '—'}</span>
                            {item.registradoPor.usuario && <span className="text-[10px] font-medium text-corporativo-boton">@{item.registradoPor.usuario}</span>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">No asignado</span>
                        )}
                      </td>

                      {/* OBSERVACIÓN CORREGIDA */}
                      <td className="px-4 py-2.5 text-left text-xs font-medium">
                        {item.observacion || item.texto ? (
                          <span className="text-corporativo-oscuro">{item.observacion || item.texto}</span>
                        ) : (
                          <span className="text-slate-400 italic">Sin observación</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}