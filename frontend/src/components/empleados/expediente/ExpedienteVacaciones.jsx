import { useEffect, useState } from 'react';
import { getHistorialVacaciones, crearVacacion, editarVacacion, eliminarVacacion } from '../../../services/vacacionesService';
import { mostrarAlerta, confirmarAccion } from '../../../utils/alertas';

const capitalizarTexto = (texto) => (
  texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s+/g, ' ').split(' ')
    .map(p => p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : '').join(' ')
);

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
};

export default function ExpedienteVacaciones({ empleadoId }) {
  const [vacaciones, setVacaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [vacacionActualId, setVacacionActualId] = useState(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const obtenerEmpleadoId = () => {
    if (!empleadoId) return null;
    if (typeof empleadoId === 'object') return (empleadoId.id || empleadoId._id) ? String(empleadoId.id || empleadoId._id) : null;
    return String(empleadoId);
  };

  const cargarVacaciones = async () => {
    const id = obtenerEmpleadoId();
    if (!id) {
      setError('No se pudo identificar al empleado.');
      setVacaciones([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const data = await getHistorialVacaciones(id);
      setVacaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.mensaje || err?.message || 'No se pudo obtener el historial de vacaciones.');
      setVacaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (empleadoId) cargarVacaciones(); }, [empleadoId]);

  const limpiarFormulario = () => {
    setDesde(''); setHasta(''); setMotivo(''); setVacacionActualId(null); setModoEdicion(false); setError('');
  };

  const abrirModalCrear = () => { limpiarFormulario(); setShowModal(true); };

  const abrirModalEditar = (item) => {
    const id = item.id || item._id;
    if (!id) return mostrarAlerta('error', 'Error', 'No se pudo identificar el registro de vacaciones.');
    
    setModoEdicion(true);
    setVacacionActualId(id);
    setDesde((item.desde || item.fechaInicio || '').substring(0, 10));
    setHasta((item.hasta || item.fechaFin || '').substring(0, 10));
    setMotivo(item.motivo || '');
    setError('');
    setShowModal(true);
  };

  const cerrarModal = () => { if (!submitting) { setShowModal(false); limpiarFormulario(); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const idEmpleado = obtenerEmpleadoId();

    if (!idEmpleado || !desde || !hasta) return setError('Por favor, complete todos los campos obligatorios.');
    if (!modoEdicion && desde < obtenerFechaHoy()) return setError('La fecha de inicio de las vacaciones no puede ser anterior a hoy.');
    if (desde > hasta) return setError('La fecha de inicio no puede ser posterior a la fecha de finalización.');
    if (modoEdicion && !vacacionActualId) return setError('No se pudo identificar la vacación que desea editar.');

    try {
      setSubmitting(true);
      setError('');
      const motivoLimpio = motivo ? capitalizarTexto(motivo.trim()) : '';

      if (modoEdicion) {
        const payloadEdicion = { desde, hasta };
        if (motivoLimpio) payloadEdicion.motivo = motivoLimpio;
        await editarVacacion(vacacionActualId, payloadEdicion);
        mostrarAlerta('success', '¡Actualizado!', 'El registro de vacaciones se ha actualizado correctamente.');
      } else {
        const payloadCreacion = { empleadoId: idEmpleado, desde, hasta };
        if (motivoLimpio) payloadCreacion.motivo = motivoLimpio;
        await crearVacacion(payloadCreacion);
        mostrarAlerta('success', '¡Registrado!', 'El período vacacional se ha guardado correctamente.');
      }

      setShowModal(false);
      limpiarFormulario();
      await cargarVacaciones();
    } catch (err) {
      const mensajeBackend = err?.response?.data?.mensaje || err?.message || '';
      if (mensajeBackend.toLowerCase().includes('solap') || mensajeBackend.toLowerCase().includes('overlap')) {
        mostrarAlerta('error', 'Conflicto de fechas', 'Ya existen vacaciones registradas que se solapan con las fechas seleccionadas.');
      } else {
        mostrarAlerta('error', 'Error', mensajeBackend || 'Error al procesar la solicitud de vacaciones.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!id) return mostrarAlerta('error', 'Error', 'No se pudo identificar el registro de vacaciones.');
    const resultado = await confirmarAccion({ title: '¿Está seguro?', text: 'Esta acción eliminará el registro de vacaciones de forma permanente.', confirmButtonText: 'Sí, eliminar' });
    if (!resultado.isConfirmed) return;

    try {
      setSubmitting(true);
      setError('');
      await eliminarVacacion(id);
      mostrarAlerta('success', '¡Eliminado!', 'El registro de vacaciones ha sido eliminado.');
      await cargarVacaciones();
    } catch (err) {
      mostrarAlerta('error', 'Error', err?.response?.data?.mensaje || err?.message || 'No se pudo eliminar el registro.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && vacaciones.length === 0) {
    return <div className="text-center text-xs text-corporativo-oscuro font-medium py-6">Cargando historial de vacaciones...</div>;
  }

  return (
    <div className="w-full space-y-4">
      {error && !showModal && (
        <div className="text-xs sm:text-sm text-corporativo-boton font-medium flex items-center gap-1.5 animate-fadeIn">
          <span>{error}</span>
        </div>
      )}

      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-corporativo-borde/60 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-corporativo-principal" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xs sm:text-sm font-bold text-corporativo-oscuro uppercase tracking-wider">Vacaciones</h3>
          </div>
          <p className="text-xs text-corporativo-boton mt-0.5">Administre el historial de períodos vacacionales registrados del empleado.</p>
        </div>
        <button type="button" onClick={abrirModalCrear} disabled={submitting} className="self-start sm:self-center rounded-xl bg-corporativo-principal px-4 py-2 text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:shadow-md cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-60">
          <span>+</span> Agregar vacaciones
        </button>
      </div>

      {/* TABLA DE VACACIONES */}
      <div className="w-full overflow-hidden pt-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-corporativo-fondo text-center text-[11px] font-bold uppercase tracking-wider text-corporativo-principal border-b border-corporativo-borde">
                <th className="px-4 py-2.5">Desde</th>
                <th className="px-4 py-2.5">Hasta</th>
                <th className="px-4 py-2.5">Motivo</th>
                <th className="px-4 py-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-corporativo-borde text-sm">
              {vacaciones.length === 0 ? (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-corporativo-oscuro text-xs">No hay registros de vacaciones para este empleado.</td></tr>
              ) : (
                vacaciones.map((item) => {
                  const id = item.id || item._id;
                  const fechaDesde = item.desde || item.fechaInicio;
                  const fechaHasta = item.hasta || item.fechaFin;
                  return (
                    <tr key={id} className="hover:bg-corporativo-fondo/40 transition-colors">
                      <td className="px-4 py-2.5 text-center text-xs font-mono font-semibold text-corporativo-oscuro">{fechaDesde ? String(fechaDesde).substring(0, 10) : '—'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-mono font-semibold text-corporativo-oscuro">{fechaHasta ? String(fechaHasta).substring(0, 10) : '—'}</td>
                      
                      {/* MOTIVO MODIFICADO */}
                      <td className="px-4 py-2.5 text-center text-xs font-medium">
                        {item.motivo ? (
                          <span className="text-corporativo-oscuro">{item.motivo}</span>
                        ) : (
                          <span className="text-slate-400 italic">Sin motivo</span>
                        )}
                      </td>

                      <td className="px-4 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button type="button" onClick={() => abrirModalEditar(item)} disabled={submitting} title="Editar" className="p-2.5 rounded-xl border border-corporativo-boton/40 text-corporativo-boton bg-corporativo-fondo hover:bg-corporativo-principal hover:text-white transition-all shadow-2xs cursor-pointer disabled:opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button type="button" onClick={() => handleEliminar(id)} disabled={submitting} title="Eliminar" className="h-9 w-9 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-60 shadow-2xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl max-w-lg w-full border border-slate-700 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{modoEdicion ? 'Editar vacaciones' : 'Registrar vacaciones'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Complete la información del período vacacional.</p>
              </div>
              <button type="button" onClick={cerrarModal} disabled={submitting} className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer disabled:opacity-60 text-sm font-bold" title="Cerrar">✕</button>
            </div>

            {error && <div className="text-corporativo-claro1 text-sm font-medium text-left animate-fadeIn py-0.5">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Fecha de inicio *</span>
                  <input type="date" value={desde} min={!modoEdicion ? obtenerFechaHoy() : undefined} onChange={(e) => { setDesde(e.target.value); if (hasta && e.target.value > hasta) setHasta(''); if (error) setError(''); }} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 [color-scheme:dark]" required />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Fecha de finalización *</span>
                  <input type="date" value={hasta} min={desde || (!modoEdicion ? obtenerFechaHoy() : undefined)} onChange={(e) => { setHasta(e.target.value); if (error) setError(''); }} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 [color-scheme:dark]" required />
                </label>
              </div>

              <label className="block">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-200">Motivo <span className="font-normal text-slate-400 text-xs">(opcional)</span></span>
                  <span className="text-xs text-slate-500">{motivo.length}/500</span>
                </div>
                <textarea value={motivo} onChange={(e) => { setMotivo(capitalizarTexto(e.target.value)); if (error) setError(''); }} maxLength={500} rows={3} placeholder="Observación o motivo..." className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 placeholder:text-slate-500" />
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={cerrarModal} disabled={submitting} className="rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-60">Cancelar</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-corporativo-boton border border-slate-700/80 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-corporativo-principal active:scale-95 transition-all disabled:opacity-60 cursor-pointer">{submitting ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}