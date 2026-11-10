import { useState } from 'react';
import SelectPersonalizado from '../comunes/SelectPersonalizado';

export default function AsignarHorarioDepartamento({ departamentos, onAsignarMasivo, submitting }) {
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [horarioDepartamento, setHorarioDepartamento] = useState({
    horaEntrada: '',
    horaSalida: '',
    diasLaborales: [],
    diasLibres: [],
  });
  const [errorLocal, setErrorLocal] = useState('');

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const cambiarDiasDepartamento = (dia) => {
    setHorarioDepartamento((prev) => {
      const existe = prev.diasLaborales.includes(dia);
      return {
        ...prev,
        diasLaborales: existe ? prev.diasLaborales.filter((d) => d !== dia) : [...prev.diasLaborales, dia],
      };
    });
  };

  const handleSubmit = async () => {
    if (!departamentoSeleccionado) {
      setErrorLocal('Seleccione un departamento');
      return;
    }
    if (!horarioDepartamento.horaEntrada || !horarioDepartamento.horaSalida) {
      setErrorLocal('Debe especificar la hora de entrada y salida');
      return;
    }

    setErrorLocal('');
    await onAsignarMasivo(departamentoSeleccionado, horarioDepartamento);
  };

  return (
    <div className="space-y-6">
      {/* ERROR LOCAL */}
      {errorLocal && (
        <div className="text-corporativo-claro1 font-medium flex items-center gap-2">
          <p>{errorLocal}</p>
        </div>
      )}

      {/* DEPARTAMENTO */}
      <div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-200">Departamento *</span>
          <SelectPersonalizado
            value={departamentoSeleccionado}
            onChange={(valor) => { setDepartamentoSeleccionado(valor); setErrorLocal(''); }}
            options={departamentos}
            placeholder="Seleccione..."
            variant="dark"
            disabled={submitting}
            className="w-full"
          />
        </label>
      </div>

      {/* HORAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-200">Hora de entrada *</span>
          <SelectPersonalizado
            value={horarioDepartamento.horaEntrada}
            onChange={(valor) => { setHorarioDepartamento((prev) => ({ ...prev, horaEntrada: valor })); setErrorLocal(''); }}
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
            value={horarioDepartamento.horaSalida}
            onChange={(valor) => { setHorarioDepartamento((prev) => ({ ...prev, horaSalida: valor })); setErrorLocal(''); }}
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
            const isSelected = horarioDepartamento.diasLaborales.includes(dia);
            return (
              <button
                key={dia}
                type="button"
                disabled={submitting}
                onClick={() => cambiarDiasDepartamento(dia)}
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

      {/* BOTÓN DE ACCIÓN */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="w-full sm:w-auto rounded-xl bg-corporativo-boton border border-slate-700/80 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-corporativo-principal active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          {submitting ? 'Procesando...' : 'Asignar horario a departamento'}
        </button>
      </div>
    </div>
  );
}