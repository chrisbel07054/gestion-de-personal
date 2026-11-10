import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../../services/config';

const capitalizarTexto = (texto) => {
  return texto
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((palabra) =>
      palabra ? palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase() : ''
    )
    .join(' ');
};

export default function ExpedienteObservaciones({ empleadoId }) {
  const [observaciones, setObservaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [texto, setTexto] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_URL = `${API_BASE_URL}/observaciones`;

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const obtenerEmpleadoId = () => {
    if (!empleadoId) return null;
    if (typeof empleadoId === 'object') {
      const id = empleadoId.id || empleadoId._id;
      return id ? String(id) : null;
    }
    return String(empleadoId);
  };

  const cargarObservaciones = async () => {
    const id = obtenerEmpleadoId();
    if (!id) {
      setError('No se pudo identificar al empleado.');
      setObservaciones([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo obtener el historial de observaciones.');
      setObservaciones(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.');
      setObservaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (empleadoId) {
      cargarObservaciones();
    }
  }, [empleadoId]);

  const limpiarFormulario = () => {
    setTexto('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const idEmpleado = obtenerEmpleadoId();

    if (!idEmpleado || !texto.trim()) {
      setError('Por favor, escriba una observación antes de guardar.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const textoLimpio = capitalizarTexto(texto.trim());

      const response = await fetch(`${API_URL}/${idEmpleado}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ texto: textoLimpio }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.mensaje || 'No se pudo guardar.');

      limpiarFormulario();
      await cargarObservaciones();
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && observaciones.length === 0) {
    return (
      <div className="text-center text-xs text-corporativo-oscuro font-medium py-8 animate-pulse">
        Cargando observaciones...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      
      {/* 1. HISTORIAL DE OBSERVACIONES */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-corporativo-borde/60 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-corporativo-principal" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M12 11h4M12 15h4" />
              </svg>
              <h3 className="text-xs sm:text-sm font-bold text-corporativo-oscuro uppercase tracking-wider">
                Historial de observaciones
              </h3>
            </div>
            <p className="text-xs text-corporativo-boton mt-0.5">
              Revise las notas y observaciones registradas en el expediente del empleado.
            </p>
          </div>

          <span className="self-start sm:self-center text-xs font-semibold px-3 py-1.5 bg-corporativo-fondo text-corporativo-oscuro rounded-xl border border-corporativo-borde/20 shadow-2xs">
            {observaciones.length} {observaciones.length === 1 ? 'observación' : 'observaciones'}
          </span>
        </div>

        {observaciones.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-8 bg-corporativo-fondo/40 rounded-xl border border-dashed border-corporativo-borde/20">
            No hay observaciones registradas para este empleado.
          </div>
        ) : (
          <div className="max-h-[440px] overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {observaciones.map((obs, index) => (
              <div 
                key={obs.id || index} 
                className="bg-corporativo-fondo border border-corporativo-borde/15 rounded-xl p-4 space-y-3 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-xs font-bold text-corporativo-oscuro font-mono">
                      {obs.fecha ? new Date(obs.fecha).toLocaleDateString() : '—'}
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {obs.esDeAsistencia && (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Asistencia
                        </span>
                      )}
                      <span className="rounded-full border border-corporativo-borde/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-corporativo-oscuro bg-white shadow-2xs">
                        Autor: {obs.autor?.nombre || obs.autor?.nombres || obs.autor?.usuario || 'RRHH'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-corporativo-oscuro font-normal leading-relaxed pt-2.5 mt-2.5 border-t border-corporativo-borde/10">
                    {obs.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. FORMULARIO DE NUEVA OBSERVACIÓN */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t border-corporativo-borde/60">
        <div className="flex items-center justify-between text-xs text-corporativo-oscuro font-bold uppercase tracking-wider">
          <span>Nueva observación</span>
          <span className="text-[11px] text-slate-400 font-mono font-normal">
            {texto.length}/500
          </span>
        </div>

        <textarea
          value={texto}
          onChange={(e) => {
            setTexto(capitalizarTexto(e.target.value));
            if (error) setError('');
          }}
          maxLength={500}
          rows={3}
          placeholder="Escriba aquí la nota u observación para el expediente..."
          className="w-full resize-none rounded-xl border border-corporativo-borde bg-white p-3.5 text-xs sm:text-sm text-corporativo-oscuro outline-none focus:border-corporativo-boton focus:ring-2 focus:ring-corporativo-borde placeholder:text-slate-400 transition-all shadow-2xs"
        />

        {error && (
          <div className="text-xs sm:text-sm text-corporativo-boton font-medium flex items-center gap-1.5 animate-fadeIn">
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-corporativo-principal px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:shadow-md cursor-pointer shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {submitting ? 'Guardando...' : 'Guardar observación'}
          </button>
        </div>
      </form>

    </div>
  );
}