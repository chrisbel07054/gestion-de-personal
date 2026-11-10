import { useCallback, useEffect, useState, useRef } from 'react';
import { getEmpleados } from '../services/empleadoService.js';
import { getDepartamentos } from '../services/departamentoService.js';
import { getCargos } from '../services/cargoService.js';
import {
  getHorarioEmpleado,
  asignarHorarioEmpleado,
  editarHorarioEmpleado,
  asignarHorarioDepartamento,
} from '../services/horarioService.js';
import { mostrarAlerta } from '../utils/alertas.js';

export default function useHorarios() {
  const [empleados, setEmpleados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [horarios, setHorarios] = useState({});
  const [userName, setUserName] = useState('RRHH');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const hasLoadedRef = useRef(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [busqueda, setBusqueda] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [meta, setMeta] = useState(null);

  const [showEditar, setShowEditar] = useState(false);
  const [showAsignar, setShowAsignar] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const [horarioEmpleado, setHorarioEmpleado] = useState({
    horaEntrada: '',
    horaSalida: '',
    diasLaborales: [],
    diasLibres: [],
  });

  const cargarDatos = useCallback(async (
    nextPage = page,
    nextLimit = limit,
    nextBusqueda = busqueda,
    nextDepto = filtroDepartamento
  ) => {
    try {
      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      const [resEmpleados, listaDepartamentos, listaCargos] = await Promise.all([
        getEmpleados({
          page: nextPage,
          limit: nextLimit,
          busqueda: nextBusqueda,
          departamentoId: nextDepto,
          estado: 'Activo', // traer solo empleados activos
        }),
        getDepartamentos().catch(() => []),
        getCargos().catch(() => []),
      ]);

      const empleadosLista = Array.isArray(resEmpleados) ? resEmpleados : resEmpleados?.items || [];

      setEmpleados(empleadosLista);
      setMeta(resEmpleados?.meta || null);
      setDepartamentos(Array.isArray(listaDepartamentos) ? listaDepartamentos : []);
      setCargos(Array.isArray(listaCargos) ? listaCargos : []);

      const horariosTemp = {};
      await Promise.all(
        empleadosLista.map(async (empleado) => {
          try {
            horariosTemp[empleado.id] = await getHorarioEmpleado(empleado.id);
          } catch {
            horariosTemp[empleado.id] = null;
          }
        })
      );

      setHorarios(horariosTemp);
      hasLoadedRef.current = true;
    } catch (err) {
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'Error de carga', mensajeServidor || 'No se pudieron cargar los horarios.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, busqueda, filtroDepartamento]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    try {
      const usuarioStorage = JSON.parse(localStorage.getItem('usuario') || localStorage.getItem('user'));
      if (usuarioStorage?.nombre || usuarioStorage?.name) {
        setUserName(usuarioStorage.nombre || usuarioStorage.name);
      }
    } catch {
      // Mantiene el valor por defecto.
    }
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    cargarDatos(1, limit, busqueda, filtroDepartamento);
  };

  const ejecutarAsignarDepartamento = async (departamentoId, horarioDepartamento) => {
    try {
      setSubmitting(true);
      const response = await asignarHorarioDepartamento(departamentoId, horarioDepartamento);
      const totalActualizados = response?.data?.actualizados || response?.actualizados;
      const mensajeExito = totalActualizados
        ? `¡Horario aplicado a ${totalActualizados} empleados!`
        : '¡Horario asignado correctamente!';

      setShowAsignar(false);
      await mostrarAlerta('success', '¡Éxito!', mensajeExito);
      await cargarDatos(page, limit, busqueda, filtroDepartamento);
    } catch (err) {
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'No se pudo asignar', mensajeServidor || 'No se pudo asignar el horario al departamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const abrirEditar = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    const horario = horarios[empleado.id];

    setHorarioEmpleado({
      horaEntrada: horario?.horaEntrada || '',
      horaSalida: horario?.horaSalida || '',
      diasLaborales: horario?.diasLaborales || [],
      diasLibres: horario?.diasLibres || [],
    });
    setShowEditar(true);
  };

  const guardarHorarioEmpleado = async () => {
    if (!empleadoSeleccionado) return;

    try {
      setSubmitting(true);
      if (horarios[empleadoSeleccionado.id]) {
        await editarHorarioEmpleado(empleadoSeleccionado.id, horarioEmpleado);
      } else {
        await asignarHorarioEmpleado(empleadoSeleccionado.id, horarioEmpleado);
      }

      setShowEditar(false);
      await mostrarAlerta('success', '¡Actualizado!', '¡Horario del empleado actualizado con éxito!');
      await cargarDatos(page, limit, busqueda, filtroDepartamento);
    } catch (err) {
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'Error al actualizar', mensajeServidor || 'No se pudo actualizar el horario.');
    } finally {
      setSubmitting(false);
    }
  };

  const cambiarLimit = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    cargarDatos(1, newLimit, busqueda, filtroDepartamento);
  };

  const irPaginaAnterior = () => {
    const prev = page - 1;
    if (prev < 1) return;
    setPage(prev);
    cargarDatos(prev, limit, busqueda, filtroDepartamento);
  };

  const irPaginaSiguiente = () => {
    const next = page + 1;
    if (next > totalPaginas) return;
    setPage(next);
    cargarDatos(next, limit, busqueda, filtroDepartamento);
  };

  const cerrarAsignar = () => setShowAsignar(false);
  const cerrarEditar = () => {
    setShowEditar(false);
    setEmpleadoSeleccionado(null);
  };

  const canPrevious = page > 1;
  const totalPaginas = meta?.totalPages ?? meta?.lastPage ?? (meta?.total ? Math.ceil(meta.total / limit) : 1);
  const canNext = page < totalPaginas;
  const totalEmpleados = meta?.total ?? empleados.length;

  return {
    empleados,
    departamentos,
    cargos,
    horarios,
    userName,
    loading,
    submitting,
    page,
    limit,
    busqueda,
    filtroDepartamento,
    meta,
    showEditar,
    showAsignar,
    empleadoSeleccionado,
    horarioEmpleado,
    setBusqueda,
    setFiltroDepartamento,
    setHorarioEmpleado,
    setShowAsignar,
    handleSearchSubmit,
    ejecutarAsignarDepartamento,
    abrirEditar,
    guardarHorarioEmpleado,
    cambiarLimit,
    irPaginaAnterior,
    irPaginaSiguiente,
    cerrarAsignar,
    cerrarEditar,
    canPrevious,
    canNext,
    totalPaginas,
    totalEmpleados,
  };
}