import { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createEmpleado,
  getEmpleadoById,
  getEmpleados,
  inactivarEmpleado,
  updateEmpleado,
  uploadEmpleadoFoto,
} from '../services/empleadoService.js';
import { getDepartamentos } from '../services/departamentoService.js';
import { getCargos } from '../services/cargoService.js';
import { mostrarAlerta, confirmarAccion } from '../utils/alertas.js';
import { SERVER_URL } from '../services/config';

export default function useEmpleados() {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasLoadedRef = useRef(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [busqueda, setBusqueda] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Activo');

  const [meta, setMeta] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showFoto, setShowFoto] = useState(false);

  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const obtenerUrlFoto = useCallback((fotoPath) => {
    if (!fotoPath) return '';
    if (fotoPath.startsWith('http://') || fotoPath.startsWith('https://') || fotoPath.startsWith('blob:')) {
      return fotoPath;
    }

    const rutaLimpieza = fotoPath.startsWith('/') ? fotoPath.slice(1) : fotoPath;
    const partes = rutaLimpieza.split('/');
    const nombreArchivo = partes.pop();
    const rutaDirectorios = partes.join('/');
    const archivoCodificado = encodeURIComponent(nombreArchivo);

    return rutaDirectorios
      ? `${SERVER_URL}/${rutaDirectorios}/${archivoCodificado}`
      : `${SERVER_URL}/${archivoCodificado}`;
  }, []);

  const loadData = useCallback(async (
    nextPage = page,
    nextLimit = limit,
    nextBusqueda = busqueda,
    nextDepto = filtroDepartamento,
    nextEstado = filtroEstado
  ) => {
    try {
      if (!hasLoadedRef.current) {
        setLoading(true);
      }

      const [resEmpleados, resDeps, resCargos] = await Promise.all([
        getEmpleados({
          page: nextPage,
          limit: nextLimit,
          busqueda: nextBusqueda,
          departamentoId: nextDepto,
          estado: nextEstado,
        }),
        getDepartamentos().catch(() => []),
        getCargos().catch(() => []),
      ]);

      const empleadosList = Array.isArray(resEmpleados) ? resEmpleados : resEmpleados?.items || [];

      setEmpleados(empleadosList);
      setMeta(resEmpleados?.meta || null);
      setDepartamentos(Array.isArray(resDeps) ? resDeps : []);
      setCargos(Array.isArray(resCargos) ? resCargos : []);
      hasLoadedRef.current = true;
    } catch (err) {
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'Error de carga', mensajeServidor || 'No se pudieron cargar los registros de los empleados.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, busqueda, filtroDepartamento, filtroEstado]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const obtenerNombreDepartamento = useCallback((emp) => {
    if (emp.departamento?.nombre) return emp.departamento.nombre;
    if (typeof emp.departamento === 'string') return emp.departamento;

    const depId = emp.departamentoId || emp.departamento;
    const encontrado = departamentos.find((d) => String(d.id) === String(depId));
    return encontrado ? encontrado.nombre : (depId || '—');
  }, [departamentos]);

  const obtenerNombreCargo = useCallback((emp) => {
    if (emp.cargo?.nombre) return emp.cargo.nombre;
    if (typeof emp.cargo === 'string') return emp.cargo;

    const cargoId = emp.cargoId || emp.cargo;
    const encontrado = cargos.find((c) => String(c.id) === String(cargoId));
    return encontrado ? encontrado.nombre : (cargoId || '—');
  }, [cargos]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
  };

  const handleCreate = async (payload) => {
    try {
      setSubmitting(true);
      await createEmpleado(payload);
      setShowCreate(false);
      await mostrarAlerta('success', '¡Registrado!', 'El nuevo empleado ha sido creado exitosamente.');
      await loadData(page, limit, busqueda, filtroDepartamento, filtroEstado);
    } catch (err) {
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'No se pudo registrar', mensajeServidor || 'No se pudo registrar el nuevo empleado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (payload) => {
    if (!selectedEmpleado?.id) return;

    try {
      setSubmitting(true);
      await updateEmpleado(selectedEmpleado.id, payload);
      setShowEdit(false);
      setSelectedEmpleado(null);
      await mostrarAlerta('success', '¡Actualizado!', 'La información del empleado se actualizó correctamente.');
      await loadData(page, limit, busqueda, filtroDepartamento, filtroEstado);
    } catch (err) {
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'Error al actualizar', mensajeServidor || 'No se pudo actualizar la información del empleado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (empleado) => {
    setSelectedEmpleado(empleado);
    setShowEdit(true);
  };

  const handleOpenDetail = (empleado) => {
    navigate(`/dashboard/empleados/${empleado.id}`);
  };

  const handleUploadFoto = async (id, formData) => {
    try {
      await uploadEmpleadoFoto(id, formData);
      const refreshed = await getEmpleadoById(id);
      setSelectedEmpleado(refreshed);
      await mostrarAlerta('success', 'Fotografía actualizada');
      await loadData(page, limit, busqueda, filtroDepartamento, filtroEstado);
    } catch (err) {
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'Error', mensajeServidor || 'No se pudo actualizar la fotografía del empleado.');
    }
  };

  const handleCambiarEstado = async (empleado) => {
    const esInactivo = empleado.estado === 'Inactivo';

    const result = await confirmarAccion({
      title: esInactivo ? '¿Reactivar empleado?' : '¿Inactivar empleado?',
      text: `¿Está seguro de que desea ${esInactivo ? 'reactivar' : 'inactivar'} a ${empleado.nombre} ${empleado.apellido || ''}?`,
      confirmButtonText: esInactivo ? 'Sí, reactivar' : 'Sí, inactivar',
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      if (esInactivo) {
        await updateEmpleado(empleado.id, { estado: 'Activo' });
      } else {
        await inactivarEmpleado(empleado.id);
      }
      await mostrarAlerta('success', '¡Estado actualizado!');
      await loadData(page, limit, busqueda, filtroDepartamento, filtroEstado);
    } catch (err) {
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'Operación fallida', mensajeServidor || 'No se pudo cambiar el estado del empleado.');
    } finally {
      setSubmitting(false);
    }
  };

  const cerrarCrear = () => setShowCreate(false);
  const cerrarEditar = () => {
    setShowEdit(false);
    setSelectedEmpleado(null);
  };
  const abrirCrear = () => setShowCreate(true);
  const abrirFoto = (empleado) => {
    setSelectedEmpleado(empleado);
    setShowFoto(true);
  };
  const cerrarFoto = () => {
    setShowFoto(false);
    setSelectedEmpleado(null);
  };

  const canPrevious = page > 1;
  const totalPaginas = meta?.totalPages ?? meta?.lastPage ?? (meta?.total ? Math.ceil(meta.total / limit) : 1);
  const canNext = page < totalPaginas;
  const totalEmpleados = meta?.total ?? empleados.length;

  const handlePreviousPage = () => {
    if (!canPrevious || loading) return;
    setPage((currentPage) => currentPage - 1);
  };

  const handleNextPage = () => {
    if (!canNext || loading) return;
    setPage((currentPage) => currentPage + 1);
  };

  return {
    empleados,
    departamentos,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    busqueda,
    setBusqueda,
    filtroDepartamento,
    setFiltroDepartamento,
    filtroEstado,
    setFiltroEstado,
    totalPaginas,
    totalEmpleados,
    canPrevious,
    canNext,
    showCreate,
    showEdit,
    showFoto,
    selectedEmpleado,
    submitting,
    loadData,
    obtenerUrlFoto,
    obtenerNombreDepartamento,
    obtenerNombreCargo,
    handleSearchSubmit,
    handleCreate,
    handleEdit,
    handleOpenEdit,
    handleOpenDetail,
    handleUploadFoto,
    handleCambiarEstado,
    abrirCrear,
    cerrarCrear,
    cerrarEditar,
    abrirFoto,
    cerrarFoto,
    handlePreviousPage,
    handleNextPage,
  };
}