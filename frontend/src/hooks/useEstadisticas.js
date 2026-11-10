import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEstadisticas } from '../services/estadisticasService.js';
import { getEmpleados } from '../services/empleadoService.js';
import { getDepartamentos } from '../services/departamentoService.js';
import { mostrarAlerta } from '../utils/alertas.js';

export const hoy = () => {
  const fecha = new Date();

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};

export const primerDiaMes = () => {
  const fecha = new Date();

  return `${fecha.getFullYear()}-${String(
    fecha.getMonth() + 1
  ).padStart(2, '0')}-01`;
};

export const nombreEmpleado = (empleado) =>
  [empleado?.nombre, empleado?.apellido].filter(Boolean).join(' ') ||
  'Empleado sin nombre';

export const idDe = (objeto) => objeto?.id ?? objeto?._id ?? '';

const extraerLista = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const filtrosIniciales = () => ({
  periodo: 'semana',
  desde: primerDiaMes(),
  hasta: hoy(),
  departamentoId: '',
  empleadoId: '',
  empleadoBusqueda: '',
  estado: '',
});

export default function useEstadisticas() {
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [empleados, setEmpleados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [cargando, setCargando] = useState(false);

  const actualizarFiltro = useCallback((campo, valor) => {
    setFiltros((actuales) => {
      const nuevos = { ...actuales, [campo]: valor };
      if (campo === 'departamentoId') {
        nuevos.empleadoId = '';
        nuevos.empleadoBusqueda = '';
      }
      if (campo === 'empleadoBusqueda') {
        nuevos.empleadoId = '';
      }
      if (campo === 'empleadoId') {
        nuevos.empleadoBusqueda = valor?.busqueda ?? '';
        nuevos.empleadoId = valor?.id ?? '';
      }
      return nuevos;
    });
  }, []);

  useEffect(() => {
    let activo = true;

    Promise.all([
      getEmpleados({ page: 1, limit: 500, estado: 'Activo' }),
      getDepartamentos(),
    ])
      .then(([empleadosRes, departamentosRes]) => {
        if (!activo) return;

        setEmpleados(extraerLista(empleadosRes));
        setDepartamentos(extraerLista(departamentosRes));
      })
      .catch(() => {
        if (activo) {
          mostrarAlerta(
            'error',
            'Error al cargar filtros',
            'No se pudieron cargar los catálogos.'
          );
        }
      })
      .finally(() => {
        if (activo) setCargandoCatalogos(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const empleadosFiltrados = useMemo(() => {
    if (!filtros.departamentoId) return empleados;

    return empleados.filter((empleado) =>
      String(
        empleado.departamentoId ??
        empleado.departamento?.id ??
        empleado.departamento?._id ??
        ''
      ) === String(filtros.departamentoId)
    );
  }, [empleados, filtros.departamentoId]);

  useEffect(() => {
    if (
      filtros.empleadoId &&
      !empleadosFiltrados.some(
        (empleado) =>
          String(idDe(empleado)) === String(filtros.empleadoId)
      )
    ) {
      setFiltros((actuales) => ({
        ...actuales,
        empleadoId: '',
        empleadoBusqueda: '',
      }));
    }
  }, [filtros.empleadoId, empleadosFiltrados]);

  const empleadosEncontrados = useMemo(() => {
    const busqueda = filtros.empleadoBusqueda.trim().toLowerCase();

    if (!busqueda || filtros.empleadoId) return [];

    return empleadosFiltrados.filter((empleado) =>
      nombreEmpleado(empleado).toLowerCase().includes(busqueda) ||
      String(empleado.cedula || '').toLowerCase().includes(busqueda)
    );
  }, [
    empleadosFiltrados,
    filtros.empleadoBusqueda,
    filtros.empleadoId,
  ]);

  const empleadoSeleccionado = useMemo(
    () =>
      empleadosFiltrados.find(
        (empleado) =>
          String(idDe(empleado)) === String(filtros.empleadoId)
      ),
    [empleadosFiltrados, filtros.empleadoId]
  );

  const consultar = useCallback(async (evento) => {
    evento?.preventDefault();

    const {
      periodo,
      desde,
      hasta,
      departamentoId,
      empleadoId,
      estado,
    } = filtros;

    if (
      periodo === 'personalizado' &&
      (!desde || !hasta || desde > hasta)
    ) {
      mostrarAlerta(
        'warning',
        'Rango inválido',
        'Verifique las fechas seleccionadas.'
      );
      return;
    }

    setCargando(true);

    try {

  const resultado = await getEstadisticas({
    periodo,
    ...(periodo === 'personalizado' && { desde, hasta }),
    ...(departamentoId && { departamentoId }),
    ...(empleadoId && { empleadoId }),
    ...(estado && { estado }),
  });

setEstadisticas(resultado);
    } catch (err) {
      setEstadisticas(null);

      mostrarAlerta(
        'error',
        'Error de carga',
        err?.response?.data?.message ||
        'No se pudieron consultar las estadísticas.'
      );
    } finally {
      setCargando(false);
    }
  }, [
    filtros.periodo,
    filtros.desde,
    filtros.hasta,
    filtros.departamentoId,
    filtros.empleadoId,
    filtros.estado,
  ]);

  useEffect(() => {
    consultar();
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros(filtrosIniciales());
  }, []);

  const datosDepartamentos = useMemo(() => {
    const agrupado = {};

    (estadisticas?.historial || []).forEach((item) => {
      const departamento = item.departamento || 'Sin departamento';

      if (!agrupado[departamento]) {
        agrupado[departamento] = {
          departamento,
          puntuales: 0,
          retardos: 0,
          tardes: 0,
        };
      }

      if (item.estado === 'Puntual') {
        agrupado[departamento].puntuales++;
      }

      if (item.estado === 'Retardo') {
        agrupado[departamento].retardos++;
      }

      if (item.estado === 'Tarde') {
        agrupado[departamento].tardes++;
      }
    });

    return Object.values(agrupado);
  }, [estadisticas]);

  const datosDistribucion = useMemo(() => {
    const distribucion = estadisticas?.distribucion || {};

    return [
      {
        nombre: 'Puntuales',
        valor: Number(distribucion.puntuales ?? 0),
        clave: 'Puntual',
      },
      {
        nombre: 'Retardos',
        valor: Number(distribucion.retardos ?? 0),
        clave: 'Retardo',
      },
      {
        nombre: 'Tardes',
        valor: Number(distribucion.tardes ?? 0),
        clave: 'Tarde',
      },
      {
        nombre: 'Ausencias',
        valor: Number(distribucion.ausencias ?? 0),
        clave: 'Ausente',
      },
    ];
  }, [estadisticas]);

  const datosEvolucion = useMemo(
    () =>
      (estadisticas?.evolucion || []).map((item) => ({
        ...item,
        puntuales: Number(item.puntuales ?? 0),
        retardos: Number(item.retardos ?? 0),
        tardes: Number(item.tardes ?? 0),
        ausencias: Number(item.ausencias ?? 0),
      })),
    [estadisticas]
  );

  return {
    filtros,
    actualizarFiltro,
    aplicarFiltros: consultar,
    limpiarFiltros,
    empleados,
    empleadosFiltrados,
    empleadosEncontrados,
    empleadoSeleccionado,
    departamentos,
    estadisticas,
    resumen: estadisticas?.resumen || {},
    historial: estadisticas?.historial || [],
    datosDepartamentos,
    datosDistribucion,
    datosEvolucion,
    cargandoCatalogos,
    cargando,
  };
}