import { useEffect, useState } from 'react';
import { getEmpleadoByCedula } from '../services/empleadoService.js';
import { registrarEntrada, registrarSalida } from '../services/asistenciaService.js';
import { getDepartamentos } from '../services/departamentoService.js';
import { getCargos } from '../services/cargoService.js';
import { mostrarAlerta } from '../utils/alertas.js';
import { SERVER_URL } from '../services/config';

export default function useOperador() {
  const [cedula, setCedula] = useState('');
  const [empleado, setEmpleado] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [userName, setUserName] = useState('Operador');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resDeps, resCargos] = await Promise.all([
          getDepartamentos().catch(() => []),
          getCargos().catch(() => []),
        ]);
        setDepartamentos(Array.isArray(resDeps) ? resDeps : []);
        setCargos(Array.isArray(resCargos) ? resCargos : []);
      } catch {
        // Mantiene los valores iniciales.
      }

      try {
        const usuarioStorage = JSON.parse(
          localStorage.getItem('usuario') || localStorage.getItem('user') || 'null'
        );
        if (usuarioStorage?.nombre || usuarioStorage?.name) {
          setUserName(usuarioStorage.nombre || usuarioStorage.name);
        }
      } catch {
        // Mantiene "Operador".
      }
    };

    cargarDatos();
  }, []);

  const obtenerUrlFoto = (fotoPath) => {
    if (!fotoPath) return '';
    if (fotoPath.startsWith('http://') || fotoPath.startsWith('https://') || fotoPath.startsWith('blob:')) {
      return fotoPath;
    }
    const rutaLimpieza = fotoPath.startsWith('/') ? fotoPath.slice(1) : fotoPath;
    return `${SERVER_URL}/${rutaLimpieza}`;
  };

  const obtenerNombreDepartamento = (emp) => {
    if (emp?.departamento?.nombre) return emp.departamento.nombre;
    if (typeof emp?.departamento === 'string') return emp.departamento;

    const depId = emp?.departamentoId || emp?.departamento;
    const encontrado = departamentos.find((d) => String(d.id || d._id) === String(depId));
    return encontrado ? encontrado.nombre : depId || '—';
  };

  const obtenerNombreCargo = (emp) => {
    if (emp?.cargo?.nombre) return emp.cargo.nombre;
    if (typeof emp?.cargo === 'string') return emp.cargo;

    const cargoId = emp?.cargoId || emp?.cargo;
    const encontrado = cargos.find((c) => String(c.id || c._id) === String(cargoId));
    return encontrado ? encontrado.nombre : cargoId || '—';
  };

  const renderizarDias = (dias) => {
    if (!dias || !Array.isArray(dias) || dias.length === 0) return 'No especificado';

    const ordenSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const diasOrdenados = ordenSemana.filter((dia) => dias.includes(dia));

    if (diasOrdenados.length === 0) return 'No especificado';
    if (diasOrdenados.length === 7) return 'Lunes a Domingo';

    let esContinuo = true;
    const primerIndice = ordenSemana.indexOf(diasOrdenados[0]);

    for (let i = 0; i < diasOrdenados.length; i++) {
      if (ordenSemana.indexOf(diasOrdenados[i]) !== primerIndice + i) {
        esContinuo = false;
        break;
      }
    }

    if (esContinuo && diasOrdenados.length > 2) {
      return `${diasOrdenados[0]} a ${diasOrdenados[diasOrdenados.length - 1]}`;
    }

    return diasOrdenados.join(', ');
  };

  const buscarEmpleado = async (e) => {
    e.preventDefault();
    const cedulaTrim = cedula.trim();
    if (!cedulaTrim) {
      mostrarAlerta('error', 'Cédula requerida', 'Ingrese el número de cédula del trabajador para continuar.');
      return;
    }

    if (cedulaTrim.length < 7) {
      mostrarAlerta('error', 'Cédula incompleta', 'La cédula de identidad debe tener entre 7 y 8 dígitos.');
      return;
    }

    try {
      setLoading(true);
      setEmpleado(null);

      const data = await getEmpleadoByCedula(cedulaTrim);
      if (!data) {
        mostrarAlerta('error', 'No encontrado', 'No se encontró el trabajador con la cédula indicada.');
        return;
      }

      setEmpleado(data);
    } catch {
      mostrarAlerta('error', 'No encontrado', 'No se encontró el trabajador.');
      setEmpleado(null);
    } finally {
      setLoading(false);
    }
  };

  const registrarAsistencia = async (tipo) => {
    if (!empleado) return;

    const idEmpleadoReal = empleado.id || empleado._id || empleado.empleadoId;
    if (!idEmpleadoReal) {
      mostrarAlerta('error', 'Error', 'No se encontró el ID del empleado.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        empleadoId: String(idEmpleadoReal),
        ...(observacion.trim() && { observacion: observacion.trim() }),
      };

      if (tipo === 'entrada') {
        await registrarEntrada(payload);
      } else {
        await registrarSalida(payload);
      }

      mostrarAlerta('success', '¡Éxito!', `Registro de ${tipo} realizado correctamente.`);
      setCedula('');
      setEmpleado(null);
      setObservacion('');
    } catch (error) {
      const mensajeError = error?.response?.data?.mensaje || 'No se pudo registrar la asistencia';
      mostrarAlerta('error', 'Error de registro', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return {
    cedula,
    setCedula,
    empleado,
    setEmpleado,
    observacion,
    setObservacion,
    loading,
    departamentos,
    cargos,
    userName,
    obtenerUrlFoto,
    obtenerNombreDepartamento,
    obtenerNombreCargo,
    renderizarDias,
    buscarEmpleado,
    registrarAsistencia,
  };
}