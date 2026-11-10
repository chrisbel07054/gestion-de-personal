import { mostrarAlerta } from '../../utils/alertas.js';
import SelectPersonalizado from '../comunes/SelectPersonalizado.jsx';

export default function HorarioForm({
  empleadoSeleccionado,
  horarioEmpleado,
  setHorarioEmpleado,
  onGuardar,
  onCerrar,
  submitting,
}) {
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const cambiarDiasLaborales = (dia) => {
    setHorarioEmpleado((prev) => {
      const diasActuales = prev.diasLaborales || [];
      const existe = diasActuales.includes(dia);
      return {
        ...prev,
        diasLaborales: existe ? diasActuales.filter((d) => d !== dia) : [...diasActuales, dia],
      };
    });
  };

  const handleValidarYGuardar = async () => {
    if (!horarioEmpleado.horaEntrada || !horarioEmpleado.horaSalida) {
      await mostrarAlerta('error', 'Campos incompletos', 'Debe especificar la hora de entrada y de salida.');
      return;
    }
    onGuardar();
  };

  return (
    <div className="space-y-6">
      {/* HORAS DE ENTRADA Y SALIDA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-200">Hora de entrada *</span>
          <SelectPersonalizado
            value={horarioEmpleado.horaEntrada}
            onChange={(valor) => setHorarioEmpleado((prev) => ({ ...prev, horaEntrada: valor }))}
            placeholder="Seleccione hora..."
            variant="dark"
            tipo="hora"
            disabled={submitting}
            className="w-full"
            mostrarOpcionVacia={true}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-200">Hora de salida *</span>
          <SelectPersonalizado
            value={horarioEmpleado.horaSalida}
            onChange={(valor) => setHorarioEmpleado((prev) => ({ ...prev, horaSalida: valor }))}
            placeholder="Seleccione hora..."
            variant="dark"
            tipo="hora"
            disabled={submitting}
            className="w-full"
            mostrarOpcionVacia={true}
          />
        </label>
      </div>

      {/* DÍAS LABORALES */}
      <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
        <span className="mb-3 block text-sm font-semibold text-slate-200">Días laborales</span>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {diasSemana.map((dia) => {
            const isSelected = (horarioEmpleado.diasLaborales || []).includes(dia);
            return (
              <button
                key={dia}
                type="button"
                disabled={submitting}
                onClick={() => cambiarDiasLaborales(dia)}
                className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-corporativo-boton text-white border-slate-600 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {dia}
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onCerrar}
          disabled={submitting}
          className="rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={handleValidarYGuardar}
          className="rounded-xl bg-corporativo-boton border border-slate-700/80 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-corporativo-principal active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}