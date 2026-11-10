const prisma = require('../../../infrastructure/database/prismaClient');

const ESTADOS_CONTABILIZABLES = [
  'Puntual',
  'Retardo',
  'Tarde',
  'Ausente',
];

const normalizarTexto = (texto) =>
  String(texto || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const formatearFecha = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};

const parsearFecha = (valor, campo) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(valor || ''))) {
    throw new Error(`El campo ${campo} debe tener formato YYYY-MM-DD`);
  }

  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);

  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    throw new Error(`La fecha ${campo} no es válida`);
  }

  return fecha;
};

const sumarDias = (fecha, cantidad) => {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + cantidad);
  return resultado;
};

const obtenerRango = ({ periodo = 'mes', desde, hasta }) => {
  if (desde || hasta || periodo === 'personalizado') {
    if (!desde || !hasta) {
      throw new Error('Debes indicar las fechas desde y hasta');
    }

    const fechaDesde = parsearFecha(desde, 'desde');
    const fechaHasta = parsearFecha(hasta, 'hasta');

    if (fechaDesde > fechaHasta) {
      throw new Error('La fecha desde no puede ser posterior a hasta');
    }

    return { desde: fechaDesde, hasta: fechaHasta };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (periodo === 'dia') {
    return { desde: hoy, hasta: hoy };
  }

  if (periodo === 'semana') {
    const inicio = new Date(hoy);
    const diaSemana = inicio.getDay();

    inicio.setDate(
      inicio.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1)
    );

    return { desde: inicio, hasta: hoy };
  }

  if (periodo === 'mes') {
    return {
      desde: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
      hasta: hoy,
    };
  }

  if (periodo === 'anio') {
    return {
      desde: new Date(hoy.getFullYear(), 0, 1),
      hasta: hoy,
    };
  }

  throw new Error('Período no válido');
};

const normalizarHora = (valor) => {
  if (!valor) return null;

  const coincidencia = String(valor).match(/^(\d{1,2}):(\d{2})/);

  if (!coincidencia) return null;

  return `${coincidencia[1].padStart(2, '0')}:${coincidencia[2]}`;
};

const crearFechaHora = (fecha, hora) => {
  const horaNormalizada = normalizarHora(hora);

  if (!horaNormalizada) return null;

  const [horas, minutos] = horaNormalizada.split(':').map(Number);
  const resultado = new Date(fecha);

  resultado.setHours(horas, minutos, 0, 0);

  return resultado;
};

const obtenerEstadoSinEntrada = (fecha, horario, ahora) => {
  const inicio = crearFechaHora(fecha, horario.horaEntrada);
  let fin = crearFechaHora(fecha, horario.horaSalida);

  if (!inicio || !fin) return 'Pendiente';

  if (fin <= inicio) {
    fin = sumarDias(fin, 1);
  }

  if (ahora < inicio) return 'Programado';
  if (ahora < fin) return 'Pendiente';

  return 'Ausente';
};

const obtenerNombreDia = (fecha) => {
  const dias = [
    'domingo',
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
  ];

  return dias[fecha.getDay()];
};

const esDiaLaboral = (horario, fecha) => {
  const dia = obtenerNombreDia(fecha);
  const diasLaborales = (horario.diasLaborales || []).map(normalizarTexto);

  return diasLaborales.includes(dia);
};

const esNovedadActiva = (novedad) => {
  const estado = normalizarTexto(novedad.estado);

  return ['pendiente', 'aprobada', 'aprobado'].includes(estado);
};

const crearContadores = () => ({
  puntuales: 0,
  retardos: 0,
  tardes: 0,
  ausencias: 0,
});

const acumularEstado = (contadores, estado) => {
  if (estado === 'Puntual') contadores.puntuales++;
  if (estado === 'Retardo') contadores.retardos++;
  if (estado === 'Tarde') contadores.tardes++;
  if (estado === 'Ausente') contadores.ausencias++;
};

const esEstadoContabilizable = (estado) =>
  ESTADOS_CONTABILIZABLES.includes(estado);

const obtenerClavePeriodo = (fecha, periodo) => {
  if (periodo === 'anio') {
    return `${fecha.getFullYear()}-${String(
      fecha.getMonth() + 1
    ).padStart(2, '0')}`;
  }

  return formatearFecha(fecha);
};

const inicializarEvolucion = (desde, hasta, periodo) => {
  const evolucion = new Map();

  if (periodo === 'anio') {
    const cursor = new Date(desde.getFullYear(), desde.getMonth(), 1);
    const limite = new Date(hasta.getFullYear(), hasta.getMonth(), 1);

    while (cursor <= limite) {
      const clave = obtenerClavePeriodo(cursor, periodo);

      evolucion.set(clave, {
        periodo: clave,
        ...crearContadores(),
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return evolucion;
  }

  for (
    let fecha = new Date(desde);
    fecha <= hasta;
    fecha = sumarDias(fecha, 1)
  ) {
    const clave = obtenerClavePeriodo(fecha, periodo);

    evolucion.set(clave, {
      periodo: clave,
      ...crearContadores(),
    });
  }

  return evolucion;
};

const obtenerEstadisticas = async ({
  periodo = 'mes',
  desde,
  hasta,
  departamentoId,
  empleadoId,
  estado: estadoFiltro,
} = {}) => {
  if (
    estadoFiltro &&
    estadoFiltro !== 'Todos' &&
    !ESTADOS_CONTABILIZABLES.includes(estadoFiltro)
  ) {
    throw new Error('El estado seleccionado no es válido');
  }

  const rango = obtenerRango({ periodo, desde, hasta });
  const fechaDesde = formatearFecha(rango.desde);
  const fechaHasta = formatearFecha(rango.hasta);

  const filtroEmpleado = { estado: 'Activo' };

  if (departamentoId !== undefined && departamentoId !== '') {
    const id = Number(departamentoId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(
        'departamentoId debe ser un identificador numérico válido'
      );
    }

    filtroEmpleado.departamentoId = id;
  }

  if (empleadoId !== undefined && empleadoId !== '') {
    const id = Number(empleadoId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(
        'empleadoId debe ser un identificador numérico válido'
      );
    }

    filtroEmpleado.id = id;
  }

  const empleados = await prisma.empleado.findMany({
    where: filtroEmpleado,
    include: {
      departamento: true,
      horario: true,
    },
  });

  const ids = empleados.map((empleado) => empleado.id);

  if (ids.length === 0) {
    return {
      filtros: {
        periodo,
        desde: fechaDesde,
        hasta: fechaHasta,
        departamentoId: departamentoId || null,
        empleadoId: empleadoId || null,
        estado: estadoFiltro || null,
      },
      resumen: crearContadores(),
      evolucion: [],
      distribucion: crearContadores(),
      historial: [],
    };
  }

  const [asistencias, vacaciones, reposos, permisos] = await Promise.all([
    prisma.asistencia.findMany({
      where: {
        empleadoId: { in: ids },
        fecha: { gte: fechaDesde, lte: fechaHasta },
      },
    }),

    prisma.vacacion.findMany({
      where: {
        empleadoId: { in: ids },
        desde: { lte: fechaHasta },
        hasta: { gte: fechaDesde },
      },
    }),

    prisma.reposoMedico.findMany({
      where: {
        empleadoId: { in: ids },
        fechaInicio: { lte: fechaHasta },
        fechaFin: { gte: fechaDesde },
      },
    }),

    prisma.permiso.findMany({
      where: {
        empleadoId: { in: ids },
        fecha: { gte: fechaDesde, lte: fechaHasta },
      },
    }),
  ]);

  const claveAsistencia = new Map(
    asistencias.map((registro) => [
      `${registro.empleadoId}|${registro.fecha}`,
      registro,
    ])
  );

  const resumen = crearContadores();
  const distribucion = crearContadores();

  const evolucion = inicializarEvolucion(
    rango.desde,
    rango.hasta,
    periodo
  );

  const historial = [];
  const ahora = new Date();

  const vacacionesPorEmpleado = new Map();
  const repososPorEmpleado = new Map();
  const permisosPorEmpleado = new Map();

  for (const item of vacaciones) {
    if (!esNovedadActiva(item)) continue;

    if (!vacacionesPorEmpleado.has(item.empleadoId)) {
      vacacionesPorEmpleado.set(item.empleadoId, []);
    }

    vacacionesPorEmpleado.get(item.empleadoId).push(item);
  }

  for (const item of reposos) {
    if (!esNovedadActiva(item)) continue;

    if (!repososPorEmpleado.has(item.empleadoId)) {
      repososPorEmpleado.set(item.empleadoId, []);
    }

    repososPorEmpleado.get(item.empleadoId).push(item);
  }

  for (const item of permisos) {
    if (!esNovedadActiva(item)) continue;

    if (!permisosPorEmpleado.has(item.empleadoId)) {
      permisosPorEmpleado.set(item.empleadoId, []);
    }

    permisosPorEmpleado.get(item.empleadoId).push(item);
  }

  const fechaCreacionTexto = (horario) => {
    if (!horario?.createdAt) return null;

    const fecha = horario.createdAt;

    return `${fecha.getFullYear()}-${String(
      fecha.getMonth() + 1
    ).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  };

  const tieneNovedad = (empleadoId, fecha) => {
    const tieneVacacion = (
      vacacionesPorEmpleado.get(empleadoId) || []
    ).some((item) => item.desde <= fecha && item.hasta >= fecha);

    const tieneReposo = (
      repososPorEmpleado.get(empleadoId) || []
    ).some(
      (item) => item.fechaInicio <= fecha && item.fechaFin >= fecha
    );

    const tienePermiso = (
      permisosPorEmpleado.get(empleadoId) || []
    ).some((item) => item.fecha === fecha);

    return tieneVacacion || tieneReposo || tienePermiso;
  };

  for (const empleado of empleados) {
    const horario = empleado.horario;

    // Sin horario vigente no se generan registros de ausencia.
    if (!horario || horario.vigente !== true) {
      continue;
    }

    const fechaCreacionHorario = fechaCreacionTexto(horario);

    for (
      let fecha = new Date(rango.desde);
      fecha <= rango.hasta;
      fecha = sumarDias(fecha, 1)
    ) {
      const fechaTexto = formatearFecha(fecha);
      const registro = claveAsistencia.get(
        `${empleado.id}|${fechaTexto}`
      );

      // No contabilizar días cubiertos por novedades activas.
      if (tieneNovedad(empleado.id, fechaTexto)) {
        continue;
      }

      let estado;
      let debeIncluirse = false;

      if (registro?.horaEntrada) {
        // Conservar los registros de asistencia existentes.
        estado = registro.estado || 'Pendiente';
        debeIncluirse = true;
      } else {
        // Para generar una ausencia debe existir una fecha de creación.
        // No generar ausencias anteriores a la creación del horario.
        if (
          !fechaCreacionHorario ||
          fechaTexto < fechaCreacionHorario
        ) {
          continue;
        }

        // Solo evaluar los días definidos como laborales.
        if (!esDiaLaboral(horario, fecha)) {
          continue;
        }

        estado = obtenerEstadoSinEntrada(fecha, horario, ahora);
        debeIncluirse = true;
      }

      if (!debeIncluirse || !esEstadoContabilizable(estado)) {
        continue;
      }

      if (
        estadoFiltro &&
        estadoFiltro !== 'Todos' &&
        estado !== estadoFiltro
      ) {
        continue;
      }

      acumularEstado(resumen, estado);
      acumularEstado(distribucion, estado);

      const clave = obtenerClavePeriodo(fecha, periodo);
      const contadorPeriodo = evolucion.get(clave);

      if (contadorPeriodo) {
        acumularEstado(contadorPeriodo, estado);
      }

      historial.push({
        empleadoId: empleado.id,
        empleado: [empleado.nombre, empleado.apellido]
          .filter(Boolean)
          .join(' '),
        departamento: empleado.departamento?.nombre || 'Sin departamento',
        fecha: fechaTexto,
        horario: {
          entrada: normalizarHora(horario.horaEntrada),
          salida: normalizarHora(horario.horaSalida),
        },
        entrada: registro?.horaEntrada || null,
        salida: registro?.horaSalida || null,
        estado,
      });
    }
  }

  historial.sort(
    (a, b) =>
      b.fecha.localeCompare(a.fecha) ||
      a.empleado.localeCompare(b.empleado)
  );

  return {
    filtros: {
      periodo,
      desde: fechaDesde,
      hasta: fechaHasta,
      departamentoId: departamentoId || null,
      empleadoId: empleadoId || null,
      estado: estadoFiltro || null,
    },
    resumen,
    evolucion: Array.from(evolucion.values()).sort((a, b) =>
      a.periodo.localeCompare(b.periodo)
    ),
    distribucion,
    historial,
  };
};

module.exports = { obtenerEstadisticas };
