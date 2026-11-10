import { useEffect, useMemo, useState } from 'react';
import { getEmpleados } from '../services/empleadoService.js';
import { getDepartamentos } from '../services/departamentoService.js';
import {
  getReporteAsistencia, getReporteHorarios, getReporteVacaciones,
  getReporteReposos, getReportePermisos, exportarReportePDF, exportarReporteExcel,
} from '../services/reportesService.js';

export function useReportes() {
  const [empleados, setEmpleados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [tipoReporte, setTipoReporte] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [empleadoId, setEmpleadoId] = useState('');
  const [empleadoBusqueda, setEmpleadoBusqueda] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [reporte, setReporte] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const obtenerFechaLocal = () => {
    const fecha = new Date();
    return [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'), String(fecha.getDate()).padStart(2, '0')].join('-');
  };

  const validarFechasReporte = () => {
    const hoy = obtenerFechaLocal();
    if (desde && desde > hoy) { setError('La fecha de inicio no puede ser posterior al día de hoy.'); return false; }
    if (hasta && hasta > hoy) { setError('La fecha final no puede ser posterior al día de hoy.'); return false; }
    if (desde && hasta && desde > hasta) { setError('La fecha de inicio no puede ser posterior a la fecha final.'); return false; }
    return true;
  };

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setLoadingCatalogos(true);
        setError('');
        const [empRes, depRes] = await Promise.all([getEmpleados({ page: 1, limit: 500 }), getDepartamentos()]);
        setEmpleados(Array.isArray(empRes) ? empRes : empRes?.items || []);
        setDepartamentos(Array.isArray(depRes) ? depRes : depRes?.data || []);
      } catch (err) {
        console.error('Error cargando catálogos:', err);
        setError(err?.response?.data?.mensaje || err?.message || 'No se pudieron cargar los datos para los filtros.');
      } finally {
        setLoadingCatalogos(false);
      }
    };
    cargarCatalogos();
  }, []);

  const empleadosFiltrados = useMemo(() => {
    if (!departamentoId) return empleados;
    return empleados.filter((e) => String(e.departamentoId || e.departamento?.id || e.departamento?._id) === String(departamentoId));
  }, [empleados, departamentoId]);

  const handleDepartamentoChange = (e) => {
    setDepartamentoId(e.target.value);
    setEmpleadoId('');
    setEmpleadoBusqueda('');
  };

  const handleTipoReporteChange = (nuevoTipo) => {
    setTipoReporte(nuevoTipo);
    setReporte([]);
    setResumen(null);
    setError('');
    setSuccessMessage('');
    if (nuevoTipo === 'horarios') { setDesde(''); setHasta(''); }
  };

  const obtenerNombreEmpleado = (e) => (e ? [e.nombre, e.apellido].filter(Boolean).join(' ') : '');
  const obtenerId = (obj) => obj?.id || obj?._id || null;

  const resolverEmpleadoBusqueda = () => {
    const texto = empleadoBusqueda?.trim().toLowerCase();
    if (!texto) return null;
    const coincidencias = empleadosFiltrados.filter((e) => {
      const nombre = obtenerNombreEmpleado(e).toLowerCase();
      const cedula = String(e.cedula || '').toLowerCase();
      return nombre.includes(texto) || cedula.includes(texto);
    });
    if (coincidencias.length === 1) return obtenerId(coincidencias[0]);
    if (coincidencias.length > 1) return 'MULTIPLES';
    return 'NINGUNO';
  };

  const hayFiltroValido = useMemo(() => {
    const filtroEmpleado = Boolean(empleadoId) || Boolean(empleadoBusqueda?.trim());
    const filtroDepartamento = Boolean(departamentoId);
    if (tipoReporte === 'asistencia') return Boolean(desde && hasta);
    const filtroFechas = tipoReporte !== 'horarios' && Boolean(desde || hasta);
    return filtroEmpleado || filtroDepartamento || filtroFechas;
  }, [tipoReporte, departamentoId, empleadoId, empleadoBusqueda, desde, hasta]);

  const puedeGenerarReporte = Boolean(tipoReporte) && hayFiltroValido;

  const obtenerFiltros = (idForzado = empleadoId) => ({
    tipo: tipoReporte,
    departamentoId: departamentoId || undefined,
    empleadoId: idForzado || undefined,
    desde: desde || undefined,
    hasta: hasta || undefined,
  });

  const limpiarFiltros = () => {
    setTipoReporte(''); setDepartamentoId(''); setEmpleadoId(''); setEmpleadoBusqueda('');
    setDesde(''); setHasta(''); setReporte([]); setResumen(null); setError(''); setSuccessMessage('');
  };

  const generarReporte = async () => {
    if (!tipoReporte) { setError('Debe seleccionar un tipo de reporte.'); return; }
    if (tipoReporte === 'asistencia' && (!desde || !hasta)) {
      setError('Para generar el reporte de asistencia debe seleccionar una fecha de inicio y una fecha de finalización.');
      return;
    }
    if (!validarFechasReporte()) return;

    let empleadoIdParaReporte = empleadoId;
    if (!empleadoId && empleadoBusqueda?.trim()) {
      const resEmp = resolverEmpleadoBusqueda();
      if (resEmp === 'MULTIPLES') { setError('Se encontraron varios empleados con ese nombre. Seleccione uno de la lista.'); return; }
      if (resEmp === 'NINGUNO') { setError('No se encontró ningún empleado que coincida con la búsqueda.'); return; }
      empleadoIdParaReporte = resEmp;
    }

    const tieneFiltro = tipoReporte === 'asistencia'
      ? Boolean(desde && hasta)
      : Boolean(empleadoIdParaReporte) || Boolean(departamentoId) || (tipoReporte !== 'horarios' && Boolean(desde || hasta));

    if (!tieneFiltro) {
      setError(tipoReporte === 'asistencia' ? 'Para generar el reporte de asistencia debe seleccionar una fecha de inicio y una fecha de finalización.' : 'Debe definir al menos un filtro para generar el reporte.');
      return;
    }

    try {
      setLoadingReporte(true); setError(''); setSuccessMessage('');
      const filtros = obtenerFiltros(empleadoIdParaReporte);
      let response;

      switch (tipoReporte) {
        case 'asistencia': response = await getReporteAsistencia(filtros); break;
        case 'horarios': response = await getReporteHorarios(filtros); break;
        case 'vacaciones': response = await getReporteVacaciones(filtros); break;
        case 'reposos': response = await getReporteReposos(filtros); break;
        case 'permisos': response = await getReportePermisos(filtros); break;
        default: throw new Error('Tipo de reporte no válido.');
      }

      const datos = response?.data;
      let filas = [];
      if (Array.isArray(datos)) filas = datos;
      else if (Array.isArray(datos?.rows)) filas = datos.rows;
      else if (Array.isArray(datos?.items)) filas = datos.items;
      else if (Array.isArray(response?.rows)) filas = response.rows;
      else if (Array.isArray(response?.items)) filas = response.items;

      setReporte(filas);
      setResumen(response?.resumen ?? datos?.resumen ?? null);
      setSuccessMessage(filas.length > 0 ? 'Reporte generado correctamente.' : 'El reporte se generó, pero no existen registros para los filtros seleccionados.');
    } catch (err) {
      console.error('Error generando reporte:', err);
      setError(err?.response?.data?.mensaje || err?.message || 'No se pudo generar el reporte.');
      setReporte([]); setResumen(null);
    } finally {
      setLoadingReporte(false);
    }
  };

  const descargarArchivo = (response, nombreArchivo) => {
    const url = window.URL.createObjectURL(response.data);
    const enlace = document.createElement('a');
    enlace.href = url; enlace.download = nombreArchivo;
    document.body.appendChild(enlace); enlace.click(); enlace.remove();
    window.URL.revokeObjectURL(url);
  };

  const procesarExportacion = async (tipoExp) => {
    if (!puedeGenerarReporte) {
      setError(tipoReporte === 'asistencia' ? 'Para exportar el reporte de asistencia debe seleccionar una fecha de inicio y una fecha de finalización.' : 'Seleccione el tipo de reporte y defina al menos un filtro.');
      return;
    }
    if (!validarFechasReporte()) return;

    const setExportando = tipoExp === 'PDF' ? setExportandoPDF : setExportandoExcel;
    const exportarFunc = tipoExp === 'PDF' ? exportarReportePDF : exportarReporteExcel;
    const extension = tipoExp === 'PDF' ? 'pdf' : 'xlsx';

    try {
      setExportando(true); setError(''); setSuccessMessage('');
      let empleadoIdParaReporte = empleadoId;
      if (!empleadoId && empleadoBusqueda?.trim()) {
        const resEmp = resolverEmpleadoBusqueda();
        if (resEmp === 'MULTIPLES') { setError('Se encontraron varios empleados con ese nombre. Seleccione uno de la lista.'); return; }
        if (resEmp === 'NINGUNO') { setError('No se encontró ningún empleado que coincida con la búsqueda.'); return; }
        empleadoIdParaReporte = resEmp;
      }

      const response = await exportarFunc(obtenerFiltros(empleadoIdParaReporte));
      descargarArchivo(response, `reporte-${tipoReporte}.${extension}`);
      setSuccessMessage(`El reporte ${tipoExp} se generó correctamente.`);
    } catch (err) {
      console.error(`Error exportando ${tipoExp}:`, err);
      setError(err?.response?.data?.mensaje || err?.message || `No se pudo exportar el reporte en ${tipoExp}.`);
    } finally {
      setExportando(false);
    }
  };

  const columnas = useMemo(() => (reporte.length ? Object.keys(reporte[0]) : []), [reporte]);

  const formatearValor = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  const obtenerTituloReporte = () => {
    switch (tipoReporte) {
      case 'asistencia': return 'Reporte de Asistencia';
      case 'horarios': return 'Reporte de Horarios';
      case 'vacaciones': return 'Reporte de Vacaciones';
      case 'reposos': return 'Reporte de Reposos Médicos';
      case 'permisos': return 'Reporte de Permisos';
      default: return 'Vista previa del reporte';
    }
  };

  return {
    empleados, departamentos, empleadosFiltrados, tipoReporte, departamentoId, empleadoId,
    empleadoBusqueda, desde, hasta, reporte, resumen, columnas, loadingCatalogos, loadingReporte,
    exportandoPDF, exportandoExcel, error, successMessage, hayFiltroValido, puedeGenerarReporte,
    setTipoReporte, setEmpleadoId, setEmpleadoBusqueda, setDesde, setHasta, handleTipoReporteChange,
    handleDepartamentoChange, limpiarFiltros, generarReporte,
    handleExportarPDF: () => procesarExportacion('PDF'),
    handleExportarExcel: () => procesarExportacion('Excel'),
    obtenerNombreEmpleado, obtenerId, formatearValor, obtenerTituloReporte,
  };
}