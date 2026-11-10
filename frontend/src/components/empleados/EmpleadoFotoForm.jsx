import { useState } from 'react';

export default function EmpleadoFotoForm({ empleadoId, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Por favor selecciona una imagen para subir.');

    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('foto', file);
      await onUpload(empleadoId, formData);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.mensaje || err?.message || 'No se pudo subir la foto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-900 rounded-2xl p-6 shadow-2xl max-w-md mx-auto border border-slate-700/50 my-6">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Actualizar fotografía</h2>
          <p className="text-sm text-slate-400">Sube o cambia la imagen de perfil del empleado</p>
        </div>
        <button 
          type="button" onClick={onClose} 
          className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
          title="Cerrar"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 text-corporativo-claro1 font-medium flex items-center gap-2">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        
        {/* Selector de Archivo */}
        <div className="space-y-2">
          <span className="block text-sm font-semibold text-slate-200">Fotografía *</span>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-2xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-all p-4 text-center group">
            <div className="flex flex-col items-center justify-center pt-1 pb-1">
              <svg className="w-8 h-8 mb-2 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-xs font-medium text-slate-200">
                <span className="text-white font-semibold underline underline-offset-2">Haz clic para seleccionar</span> o arrastra la imagen
              </p>
              <p className="text-[11px] text-slate-300 mt-1.5 font-medium truncate max-w-[280px]">
                {file ? file.name : 'SVG, PNG, JPG o WEBP'}
              </p>
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {/* Vista Previa */}
        {preview && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <span className="mb-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">Vista previa</span>
            <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-slate-700 shadow-md">
              <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
            </div>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button 
            type="button" onClick={onClose}
            className="rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all cursor-pointer" 
          >
            Cancelar
          </button>
          <button 
            type="submit" disabled={loading} 
            className="rounded-xl bg-corporativo-boton border border-slate-700/80 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-corporativo-principal active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Subiendo...' : 'Guardar foto'}
          </button>
        </div>

      </form>
    </section>
  );
}