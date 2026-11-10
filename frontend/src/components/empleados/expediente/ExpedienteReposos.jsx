import { useEffect, useState } from 'react';
import { mostrarAlerta, confirmarAccion } from '../../../utils/alertas';
import { API_BASE_URL } from '../../../services/config';

const capitalizarTexto = (texto) => (
  texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s+/g, ' ').split(' ')
    .map(p => p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : '').join(' ')
);

const obtenerFechaHoy = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
};

const calcularFechaFin = (fechaStr, totalDias) => {
  if (!fechaStr || !totalDias || Number(totalDias) < 1) return '';
  const [year, month, day] = fechaStr.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  fecha.setDate(fecha.getDate() + Number(totalDias) - 1);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
};

const calcularDiasEntreFechas = (fInicio, fFin) => {
  if (!fInicio || !fFin) return '';
  const [ai, mi, di] = fInicio.split('-').map(Number);
  const [af, mf, df] = fFin.split('-').map(Number);
  const diff = Math.round((new Date(af, mf - 1, df) - new Date(ai, mi - 1, di)) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? String(diff) : '';
};

export default function ExpedienteReposos({ empleadoId }) {
  const [reposos, setReposos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [reposoActualId, setReposoActualId] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [dias, setDias] = useState('');
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_URL = `${API_BASE_URL}/reposos-medicos`;
  const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

  const obtenerEmpleadoId = () => {
    if (!empleadoId) return null;
    if (typeof empleadoId === 'object') return (empleadoId.id || empleadoId._id) ? String(empleadoId.id || empleadoId._id) : null;
    return String(empleadoId);
  };

  const cargarReposos = async () => {
    const id = obtenerEmpleadoId();
    if (!id) {
      setError('No se pudo identificar al empleado.');
      setReposos([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/empleado/${id}`, { method: 'GET', headers: getHeaders() });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.mensaje || 'No se pudo obtener el historial de reposos.');
      setReposos(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
      setReposos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (empleadoId) cargarReposos(); }, [empleadoId]);

  const limpiarFormulario = () => {
    setFechaInicio(''); setDias(''); setMotivo(''); setReposoActualId(null); setModoEdicion(false); setError('');
  };

  const abrirModalCrear = () => { limpiarFormulario(); setShowModal(true); };

  const abrirModalEditar = (item) => {
    const id = item.id || item._id;
    if (!id) return mostrarAlerta('error', 'Error', 'No se pudo identificar el registro de reposo.');
    const fInicio = item.fechaInicio ? String(item.fechaInicio).substring(0, 10) : '';
    const fFin = item.fechaFin ? String(item.fechaFin).substring(0, 10) : '';
    setModoEdicion(true);
    setReposoActualId(id);
    setFechaInicio(fInicio);
    setDias(calcularDiasEntreFechas(fInicio, fFin));
    setMotivo(item.diagnostico || item.motivo || '');
    setError('');
    setShowModal(true);
  };

  const cerrarModal = () => { if (!submitting) { setShowModal(false); limpiarFormulario(); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const idEmpleado = obtenerEmpleadoId();
    const diasNum = Number(dias);

    if (!idEmpleado || !fechaInicio || !dias || !motivo.trim()) return setError('Por favor, complete todos los campos obligatorios.');
    if (!Number.isInteger(diasNum) || diasNum < 1) return setError('La cantidad de días debe ser un número entero mayor o igual a 1.');
    if (!modoEdicion && fechaInicio < obtenerFechaHoy()) return setError('La fecha de inicio del reposo no puede ser anterior a hoy.');
    if (modoEdicion && !reposoActualId) return setError('No se pudo identificar el reposo que desea editar.');

    try {
      setSubmitting(true);
      setError('');
      const url = modoEdicion ? `${API_URL}/${reposoActualId}` : API_URL;
      const body = { fechaInicio, fechaFin: calcularFechaFin(fechaInicio, diasNum), diagnostico: capitalizarTexto(motivo.trim()) };
      if (!modoEdicion) body.empleadoId = idEmpleado;

      const res = await fetch(url, { method: modoEdicion ? 'PATCH' : 'POST', headers: getHeaders(), body: JSON.stringify(body) });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.mensaje || result.message || result.error || 'No se pudo procesar el reposo.');

      setShowModal(false);
      limpiarFormulario();
      mostrarAlerta('success', modoEdicion ? '¡Actualizado!' : '¡Registrado!', `El reposo médico se ha ${modoEdicion ? 'actualizado' : 'registrado'} correctamente.`);
      await cargarReposos();
    } catch (err) {
      mostrarAlerta('error', 'Error', err.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!id) return;
    const resultado = await confirmarAccion({ title: '¿Está seguro?', text: 'Esta acción eliminará el registro de reposo médico de forma permanente.', confirmButtonText: 'Sí, eliminar' });
    if (!resultado.isConfirmed) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getHeaders() });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.mensaje || 'No se pudo eliminar el reposo.');
      mostrarAlerta('success', '¡Eliminado!', 'El registro de reposo ha sido eliminado.');
      await cargarReposos();
    } catch (err) {
      mostrarAlerta('error', 'Error', err.message || 'Error al eliminar el registro.');
    } finally {
      setSubmitting(false);
    }
  };

  const fechaFinCalculada = calcularFechaFin(fechaInicio, dias);

  if (loading && reposos.length === 0) {
    return <div className="text-center text-xs text-corporativo-oscuro font-medium py-6">Cargando registros de reposos médicos...</div>;
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h3 className="text-xs sm:text-sm font-bold text-corporativo-oscuro uppercase tracking-wider">Reposos Médicos</h3>
          </div>
          <p className="text-xs text-corporativo-boton mt-0.5">Consulte y gestione los reposos médicos y diagnósticos registrados del empleado.</p>
        </div>
        <button type="button" onClick={abrirModalCrear} className="self-start sm:self-center rounded-xl bg-corporativo-principal px-4 py-2 text-xs sm:text-sm font-bold text-white hover:opacity-90 hover:shadow-md cursor-pointer shadow-sm flex items-center gap-1.5 transition-all">
          <span>+</span> Agregar reposo
        </button>
      </div>

      {/* TABLA */}
      <div className="w-full overflow-hidden pt-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-corporativo-fondo text-center text-[11px] font-bold uppercase tracking-wider text-corporativo-principal border-b border-corporativo-borde">
                <th className="px-4 py-2.5">Desde</th>
                <th className="px-4 py-2.5">Hasta</th>
                <th className="px-4 py-2.5">Diagnóstico</th>
                <th className="px-4 py-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-corporativo-borde text-sm">
              {reposos.length === 0 ? (
                <tr><td colSpan="4" className="px-4 py-8 text-center text-corporativo-oscuro text-xs">No hay reposos médicos registrados para este empleado.</td></tr>
              ) : (
                reposos.map((item, index) => {
                  const id = item.id || item._id;
                  return (
                    <tr key={id || index} className="hover:bg-corporativo-fondo/40 transition-colors">
                      <td className="px-4 py-2.5 text-center text-xs font-mono font-semibold text-corporativo-oscuro">{item.fechaInicio ? String(item.fechaInicio).substring(0, 10) : '—'}</td>
                      <td className="px-4 py-2.5 text-center text-xs font-mono font-semibold text-corporativo-oscuro">{item.fechaFin ? String(item.fechaFin).substring(0, 10) : '—'}</td>
                      <td className="px-4 py-2.5 text-center text-xs text-corporativo-oscuro font-medium">{item.diagnostico || item.motivo || '—'}</td>
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
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{modoEdicion ? 'Editar reposo médico' : 'Registrar reposo médico'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Complete la información del reposo médico.</p>
              </div>
              <button type="button" onClick={cerrarModal} disabled={submitting} className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer disabled:opacity-60 text-sm font-bold" title="Cerrar">✕</button>
            </div>

            {error && <div className="text-corporativo-claro1 text-sm font-medium text-left animate-fadeIn py-0.5">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Fecha de inicio *</span>
                  <input type="date" value={fechaInicio} min={!modoEdicion ? obtenerFechaHoy() : undefined} onChange={(e) => { setFechaInicio(e.target.value); if (error) setError(''); }} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 [color-scheme:dark]" required />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-200">Días de reposo *</span>
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-700 bg-slate-800 focus-within:border-corporativo-boton focus-within:ring-1 focus-within:ring-corporativo-boton/30">
                    <button type="button" onClick={() => { setDias(String(Math.max(1, Number(dias || 1) - 1))); if (error) setError(''); }} disabled={submitting || Number(dias) <= 1} className="flex h-11 w-11 shrink-0 items-center justify-center border-r border-slate-700 text-lg font-semibold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 transition-colors cursor-pointer">−</button>
                    <div className="flex flex-1 items-center justify-center gap-2 px-4">
                      <input type="number" min="1" value={dias} onChange={(e) => { const v = e.target.value; if (v === '' || (/^\d+$/.test(v) && Number(v) >= 1)) { setDias(v); if (error) setError(''); } }} className="w-16 bg-transparent text-center text-base font-bold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" required />
                      <span className="text-xs font-medium text-slate-400">días</span>
                    </div>
                    <button type="button" onClick={() => { setDias(String(Number(dias || 0) + 1)); if (error) setError(''); }} disabled={submitting} className="flex h-11 w-11 shrink-0 items-center justify-center border-l border-slate-700 text-lg font-semibold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 transition-colors cursor-pointer">+</button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">Indique la duración del reposo médico.</p>
                </label>
              </div>

              {fechaInicio && dias && Number(dias) >= 1 && fechaFinCalculada && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Duración</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-200">{dias} {Number(dias) === 1 ? 'día' : 'días'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fecha de culminación</p>
                      <p className="mt-0.5 text-sm font-semibold text-corporativo-boton">{fechaFinCalculada}</p>
                    </div>
                  </div>
                </div>
              )}

              <label className="block">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-200">Motivo / Diagnóstico *</span>
                  <span className="text-xs text-slate-500">{motivo.length}/500</span>
                </div>
                <textarea value={motivo} onChange={(e) => { setMotivo(capitalizarTexto(e.target.value)); if (error) setError(''); }} maxLength={500} rows={3} placeholder="Indique el diagnóstico o motivo del reposo..." className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 placeholder:text-slate-500" required />
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={cerrarModal} disabled={submitting} className="rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer disabled:opacity-60">Cancelar</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-corporativo-boton border border-slate-700/80 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-corporativo-principal transition-all disabled:opacity-60 cursor-pointer">{submitting ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}