import { useEffect, useState } from 'react';
import { getDepartamentos } from '../../services/departamentoService.js';
import { getCargos } from '../../services/cargoService.js';
import SelectPersonalizado from '../comunes/SelectPersonalizado.jsx';

const emptyForm = {
  cedula: '', nombre: '', apellido: '', fechaNacimiento: '',
  sexo: '', telefono: '', correo: '', direccion: '',
  departamentoId: '', cargoId: '', fechaIngreso: '',
};

// Capitaliza textos manteniendo espacios
const capitalizarTexto = (texto) => 
  texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').replace(/\s+/g, ' ').split(' ')
    .map(p => p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : '').join(' ');

// Capitaliza dirección permitiendo símbolos y números
const capitalizarDireccion = (texto) => 
  texto.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ#\-\.\s]/g, '').replace(/\s+/g, ' ').split(' ')
    .map(p => p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : '').join(' ');

const soloNumeros = (texto) => texto.replace(/\D/g, '');
const fechaHoy = () => new Date().toISOString().split('T')[0];

const calcularEdad = (fechaNacimiento) => {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const difMes = hoy.getMonth() - nacimiento.getMonth();
  if (difMes < 0 || (difMes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
};

export default function EmpleadoForm({ mode = 'create', empleado = null, loading = false, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);

  const opcionesSexo = [{ id: 'Masculino', nombre: 'Masculino' }, { id: 'Femenino', nombre: 'Femenino' }];

  // Cargar datos al editar
  useEffect(() => {
    if (mode === 'edit' && empleado) {
      setForm({
        cedula: empleado.cedula || '',
        nombre: empleado.nombre || '',
        apellido: empleado.apellido || '',
        fechaNacimiento: empleado.fechaNacimiento ? String(empleado.fechaNacimiento).slice(0, 10) : '',
        sexo: empleado.sexo || '',
        telefono: empleado.telefono || '',
        correo: empleado.correo || '',
        direccion: empleado.direccion || '',
        departamentoId: empleado.departamentoId ?? empleado.departamento?.id ?? empleado.departamento?._id ?? '',
        cargoId: empleado.cargoId ?? empleado.cargo?.id ?? empleado.cargo?._id ?? empleado.cargo ?? '',
        fechaIngreso: empleado.fechaIngreso ? String(empleado.fechaIngreso).slice(0, 10) : '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [empleado, mode]);

  // Cargar opciones de departamentos y cargos activos
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [deps, cgs] = await Promise.all([getDepartamentos(), getCargos()]);
        if (!mounted) return;
        setDepartamentos((deps || []).filter(d => d.estado === 'Activo'));
        setCargos((cgs || []).filter(c => c.estado === 'Activo'));
      } catch (e) {
        console.error('Error al cargar opciones:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Manejo de cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setError('');
    let nuevoValor = value;

    if (name === 'nombre' || name === 'apellido') nuevoValor = capitalizarTexto(value);
    if (name === 'direccion') nuevoValor = capitalizarDireccion(value);
    if (name === 'cedula') nuevoValor = soloNumeros(value).slice(0, 8);
    if (name === 'telefono') nuevoValor = soloNumeros(value).slice(0, 11);
    if (name === 'correo') nuevoValor = value.toLowerCase();

    setForm(current => ({ ...current, [name]: nuevoValor }));
  };

  const handleSelectChange = (name, value) => {
    setError('');
    setForm(current => ({ ...current, [name]: value }));
  };

  // Validaciones y envío
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.cedula || !form.nombre || !form.apellido || !form.sexo || !form.departamentoId || !form.cargoId) {
      return setError('Por favor complete todos los campos obligatorios.');
    }
    if (!/^\d{6,8}$/.test(form.cedula)) {
      return setError('La cédula debe contener entre 6 y 8 números exactos.');
    }
    if (form.telefono && (form.telefono.length < 10 || form.telefono.length > 11)) {
      return setError('El teléfono debe tener entre 10 y 11 números.');
    }
    if (form.fechaNacimiento) {
      if (form.fechaNacimiento > fechaHoy()) return setError('La fecha de nacimiento no puede ser posterior al día actual.');
      if (calcularEdad(form.fechaNacimiento) < 18) return setError('El empleado debe tener mínimo 18 años.');
    }
    if (form.fechaIngreso && form.fechaIngreso > fechaHoy()) {
      return setError('La fecha de ingreso no puede ser posterior al día actual.');
    }
    if (form.fechaNacimiento && form.fechaIngreso) {
      if (form.fechaIngreso <= form.fechaNacimiento) {
        return setError('La fecha de ingreso no puede ser anterior o igual a la fecha de nacimiento.');
      }
      const nacimiento = new Date(form.fechaNacimiento);
      const ingreso = new Date(form.fechaIngreso);
      let edadIngreso = ingreso.getFullYear() - nacimiento.getFullYear();
      const difM = ingreso.getMonth() - nacimiento.getMonth();
      if (difM < 0 || (difM === 0 && ingreso.getDate() < nacimiento.getDate())) edadIngreso--;
      if (edadIngreso < 18) return setError('El empleado debe tener al menos 18 años cumplidos en la fecha de ingreso.');
    }
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      return setError('El correo electrónico debe ser válido.');
    }

    const payload = {
      ...form,
      nombre: capitalizarTexto(form.nombre),
      apellido: capitalizarTexto(form.apellido),
      direccion: form.direccion ? capitalizarDireccion(form.direccion) : undefined,
      departamentoId: String(form.departamentoId),
      cargoId: String(form.cargoId),
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === '') payload[key] = undefined;
    });

    setError('');
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err?.response?.data?.mensaje || 'Ocurrió un error al guardar');
    }
  };

  const deptoInactivo = mode === 'edit' && empleado?.departamento && empleado.departamento.estado !== 'Activo';
  const cargoInactivo = mode === 'edit' && empleado?.cargo && empleado.cargo.estado !== 'Activo';

  return (
    <section className="bg-slate-900 rounded-2xl p-6 shadow-2xl max-w-2xl mx-auto border border-slate-700/50">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">{mode === 'edit' ? 'Editar empleado' : 'Crear empleado'}</h2>
          <p className="text-sm text-slate-400">{mode === 'edit' ? 'Actualiza los datos del expediente' : 'Registro para RRHH'}</p>
        </div>
        <button
          type="button" onClick={onCancel} disabled={loading}
          className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
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

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Cédula *</span>
            <input
              name="cedula" inputMode="numeric" value={form.cedula} onChange={handleChange} disabled={loading}
              placeholder="Ej. 12345678"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 text-white placeholder-slate-500 disabled:opacity-50 transition-all"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Nombre *</span>
            <input
              name="nombre" value={form.nombre} onChange={handleChange} disabled={loading}
              placeholder="Ej. Juan"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 text-white placeholder-slate-500 disabled:opacity-50 transition-all"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Apellido *</span>
            <input
              name="apellido" value={form.apellido} onChange={handleChange} disabled={loading}
              placeholder="Ej. Pérez"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 text-white placeholder-slate-500 disabled:opacity-50 transition-all"
            />
          </label>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Sexo *</label>
            <SelectPersonalizado
              value={form.sexo} onChange={(v) => handleSelectChange('sexo', v)}
              options={opcionesSexo} placeholder="Seleccione..." variant="dark" disabled={loading} className="w-full"
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Fecha de nacimiento</span>
            <input
              type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 text-white [color-scheme:dark] disabled:opacity-50 transition-all"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Fecha de ingreso</span>
            <input
              type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 text-white [color-scheme:dark] disabled:opacity-50 transition-all"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Teléfono</span>
            <input
              name="telefono" inputMode="numeric" value={form.telefono} onChange={handleChange} disabled={loading}
              placeholder="Ej. 04141234567"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 text-white placeholder-slate-500 disabled:opacity-50 transition-all"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Correo</span>
            <input
              type="email" name="correo" value={form.correo} onChange={handleChange} disabled={loading}
              placeholder="ejemplo@correo.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 text-white placeholder-slate-500 disabled:opacity-50 transition-all"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-200">Dirección</span>
            <input
              name="direccion" value={form.direccion} onChange={handleChange} disabled={loading}
              placeholder="Ej. Calle 10, Barrio..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 outline-none focus:border-corporativo-boton focus:ring-1 focus:ring-corporativo-boton/30 text-white placeholder-slate-500 disabled:opacity-50 transition-all"
            />
          </label>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Departamento *</label>
            <SelectPersonalizado
              value={form.departamentoId} onChange={(v) => handleSelectChange('departamentoId', v)}
              options={departamentos} placeholder={departamentos.length > 0 ? 'Seleccione...' : 'No hay departamentos activos'}
              variant="dark" disabled={loading || departamentos.length === 0} className="w-full"
            />
            {deptoInactivo && <p className="mt-1.5 text-xs text-amber-400">El departamento actual está inactivo.</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Cargo *</label>
            <SelectPersonalizado
              value={form.cargoId} onChange={(v) => handleSelectChange('cargoId', v)}
              options={cargos} placeholder={cargos.length > 0 ? 'Seleccione...' : 'No hay cargos activos'}
              variant="dark" disabled={loading || cargos.length === 0} className="w-full"
            />
            {cargoInactivo && <p className="mt-1.5 text-xs text-amber-400">El cargo actual está inactivo.</p>}
          </div>

        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button" onClick={onCancel} disabled={loading}
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white active:scale-95 transition-all cursor-pointer bg-transparent disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="submit" disabled={loading}
            className="rounded-xl bg-corporativo-boton border border-slate-700/80 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-corporativo-principal active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Guardando...' : mode === 'edit' ? 'Actualizar empleado' : 'Crear empleado'}
          </button>
        </div>

      </form>
    </section>
  );
}