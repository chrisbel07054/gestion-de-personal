import { useCallback, useEffect, useState } from 'react';
import { getAsistenciasDia } from '../services/asistenciaService.js';
import { getDepartamentos } from '../services/departamentoService.js';
import { mostrarAlerta } from '../utils/alertas.js';

function fechaLocalISO() {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export default function useAsistencia() {
  const [asistencias, setAsistencias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  const [fecha, setFecha] = useState(fechaLocalISO());
  const [departamentoId, setDepartamentoId] = useState('');

  const [textoBusquedaInput, setTextoBusquedaInput] = useState('');
  const [busquedaAplicada, setBusquedaAplicada] = useState('');

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('RRHH');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const totalPaginas = Math.max(1, Math.ceil(total / limit));

  const cargarDatos = useCallback(
    async (p, l) => {
      try {
        setLoading(true);

        const [resAsistencia, resDepartamentos] = await Promise.all([
          getAsistenciasDia({
            fecha,
            departamentoId,
            busqueda: busquedaAplicada,
            page: p,
            limit: l,
          }),
          getDepartamentos().catch(() => []),
        ]);

        const asistenciasList = Array.isArray(resAsistencia)
          ? resAsistencia
          : resAsistencia?.data || resAsistencia?.items || [];

        const totalRegistros =
          resAsistencia?.meta?.total ?? asistenciasList.length;

        setAsistencias(asistenciasList);
        setTotal(totalRegistros);

        setDepartamentos(
          Array.isArray(resDepartamentos) ? resDepartamentos : []
        );
      } catch (err) {
        const mensajeServidor =
          err?.response?.data?.mensaje || err?.message;

        await mostrarAlerta(
          'error',
          'Error de carga',
          mensajeServidor ||
            'No se pudieron cargar los registros de asistencia.'
        );
      } finally {
        setLoading(false);
      }
    },
    [fecha, departamentoId, busquedaAplicada]
  );

  useEffect(() => {
    cargarDatos(page, limit);

    try {
      const usuarioStorage = JSON.parse(
        localStorage.getItem('usuario') ||
          localStorage.getItem('user')
      );

      if (usuarioStorage?.nombre || usuarioStorage?.name) {
        setUserName(usuarioStorage.nombre || usuarioStorage.name);
      }
    } catch {
      // Mantiene el valor por defecto.
    }
  }, [page, limit, cargarDatos]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    setBusquedaAplicada(textoBusquedaInput);
    setPage(1);
  };

  const handleFechaChange = (valor) => {
    setFecha(valor);
    setPage(1);
  };

  const handleDepartamentoChange = (valor) => {
    setDepartamentoId(valor);
    setPage(1);
  };

  const handleLimitChange = (valor) => {
    setLimit(Number(valor));
    setPage(1);
  };

  const obtenerDepartamento = (asistencia) => {
    return (
      asistencia.empleado?.departamento?.nombre ||
      asistencia.departamento ||
      '—'
    );
  };

  const siguientePagina = () => {
    setPage((p) => Math.min(p + 1, totalPaginas));
  };

  const paginaAnterior = () => {
    setPage((p) => Math.max(p - 1, 1));
  };

  return {
    asistencias,
    departamentos,
    fecha,
    departamentoId,
    textoBusquedaInput,
    setTextoBusquedaInput,
    loading,
    userName,
    page,
    limit,
    total,
    totalPaginas,
    handleSearchSubmit,
    handleFechaChange,
    handleDepartamentoChange,
    handleLimitChange,
    obtenerDepartamento,
    siguientePagina,
    paginaAnterior,
  };
}