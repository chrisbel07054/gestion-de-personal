const reporteAsistencia = require('./asistencia');
const reporteHorarios = require('./horarios');
const reporteVacaciones = require('./vacaciones');
const reporteReposos = require('./reposos');
const reportePermisos = require('./permisos');

const {
  crearWorkbook,
  agregarEncabezadoReporte,
  agregarFiltros,
  agregarEncabezadosTabla,
  aplicarEstiloTabla,
  configurarTabla,
  configurarImpresion,
  agregarPieReporte,
} = require('./exportHelpers');

// Funciones auxiliares para formato y datos
function formatearFecha(fecha) {
  if (!fecha) return '';
  const partes = String(fecha).substring(0, 10).split('-');
  if (partes.length !== 3 || partes[0].length !== 4) return String(fecha);
  const [year, month, day] = partes;
  return `${day}/${month}/${year}`;
}

function formatearDias(dias) {
  if (!Array.isArray(dias) || dias.length === 0) return '';
  const abreviaturas = {
    lunes: 'Lun', martes: 'Mar', miércoles: 'Mié', miercoles: 'Mié',
    jueves: 'Jue', viernes: 'Vie', sábado: 'Sáb', sabado: 'Sáb', domingo: 'Dom',
  };
  return dias.map((dia) => abreviaturas[String(dia || '').trim().toLowerCase()] || dia).join(' · ');
}

function obtenerNombreEmpleado(empleado) {
  if (!empleado) return '';
  return [empleado.nombre, empleado.apellido].filter(Boolean).join(' ').trim();
}

function obtenerEstadoAsistencia(row) {
  if (!row) return '';
  if (row.estado) return String(row.estado);
  return row.horaEntrada || row.horaSalida ? 'Presente' : 'Ausente';
}

function obtenerHoraAsistencia(row, tipo) {
  if (!row) return '';
  const estadosEspeciales = ['Ausente', 'Vacaciones', 'Reposo', 'Permiso'];
  const estado = obtenerEstadoAsistencia(row);
  if (estadosEspeciales.includes(estado)) return estado;
  return tipo === 'entrada' ? row.horaEntrada || '' : row.horaSalida || '';
}

// Filtros y textos aplicados
function obtenerTextoDepartamento(filter, rows = []) {
  if (!filter) return 'Todos';
  if (filter.departamentoNombre) return filter.departamentoNombre;
  if (filter.departamento) return filter.departamento;
  if (filter.departamentoId) {
    const departamentos = [...new Set(rows.map((row) => row.empleado?.departamento?.nombre || row.departamento?.nombre || '').filter(Boolean))];
    if (departamentos.length === 1) return departamentos[0];
    return `ID ${filter.departamentoId}`;
  }
  return 'Todos';
}

function obtenerTextoEmpleado(filter, rows = []) {
  if (!filter) return 'Todos';
  if (filter.empleadoNombre) return filter.empleadoNombre;
  if (filter.empleado) return filter.empleado;
  if (filter.empleadoId) {
    const empleados = [...new Set(rows.map((row) => obtenerNombreEmpleado(row.empleado)).filter(Boolean))];
    if (empleados.length === 1) return empleados[0];
    return `ID ${filter.empleadoId}`;
  }
  return 'Todos';
}

function obtenerFiltrosReporte(filter = {}, rows = []) {
  return {
    departamento: obtenerTextoDepartamento(filter, rows),
    empleado: obtenerTextoEmpleado(filter, rows),
    desde: filter.desde ? formatearFecha(filter.desde) : 'No especificado',
    hasta: filter.hasta ? formatearFecha(filter.hasta) : 'No especificado',
  };
}

// Preparación y finalización del Excel
function prepararReporte({ nombreHoja, titulo, columnas, filter, rows }) {
  const { wb, ws } = crearWorkbook(nombreHoja, columnas);

  agregarEncabezadoReporte(ws, {
    titulo,
    subtitulo: 'Clínica Popular Tipo I "Nuestra Señora de la Paz"',
    totalColumnas: columnas.length,
  });

  agregarFiltros(ws, {
    ...obtenerFiltrosReporte(filter, rows),
    totalColumnas: columnas.length,
  });

  columnas.forEach((columna, index) => {
    ws.getCell(7, index + 1).value = columna.header;
  });

  agregarEncabezadosTabla(ws, 7);
  configurarImpresion(ws);

  return { wb, ws };
}

function finalizarReporte({ wb, ws, filaInicioDatos = 8, totalColumnas }) {
  const ultimaFila = ws.rowCount;

  if (ultimaFila >= filaInicioDatos) {
    aplicarEstiloTabla(ws, filaInicioDatos, ultimaFila);
  }

  configurarTabla(ws, { filaEncabezado: 7, ultimaFila });
  agregarPieReporte(ws, ultimaFila + 2, totalColumnas);

  return wb.xlsx.writeBuffer();
}

// Manejadores de reportes
const handlers = {
  asistencia: async (filter = {}) => {
    const rows = await reporteAsistencia(filter);
    const columnas = [
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Empleado', key: 'nombre', width: 30 },
      { header: 'Cédula', key: 'cedula', width: 16 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'Cargo', key: 'cargo', width: 25 },
      { header: 'Entrada', key: 'horaEntrada', width: 16 },
      { header: 'Salida', key: 'horaSalida', width: 16 },
    ];

    const { wb, ws } = prepararReporte({ nombreHoja: 'Asistencia', titulo: 'Reporte de asistencia', columnas, filter, rows });

    rows.forEach((r) => {
      ws.addRow({
        fecha: formatearFecha(r.fecha),
        nombre: obtenerNombreEmpleado(r.empleado),
        cedula: r.empleado?.cedula || '',
        departamento: r.empleado?.departamento?.nombre || r.departamento?.nombre || '',
        cargo: r.empleado?.cargo?.nombre || r.cargo?.nombre || '',
        horaEntrada: obtenerHoraAsistencia(r, 'entrada'),
        horaSalida: obtenerHoraAsistencia(r, 'salida'),
      });
    });

    return finalizarReporte({ wb, ws, totalColumnas: columnas.length });
  },

  horarios: async (filter = {}) => {
    const rows = await reporteHorarios(filter);
    const columnas = [
      { header: 'Empleado', key: 'nombre', width: 30 },
      { header: 'Cédula', key: 'cedula', width: 16 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'Cargo', key: 'cargo', width: 25 },
      { header: 'Entrada', key: 'horaEntrada', width: 14 },
      { header: 'Salida', key: 'horaSalida', width: 14 },
      { header: 'Días laborales', key: 'diasLaborales', width: 32 },
    ];

    const { wb, ws } = prepararReporte({ nombreHoja: 'Horarios', titulo: 'Reporte de horarios', columnas, filter, rows });

    rows.forEach((r) => {
      ws.addRow({
        nombre: obtenerNombreEmpleado(r.empleado),
        cedula: r.empleado?.cedula || '',
        departamento: r.empleado?.departamento?.nombre || r.departamento?.nombre || '',
        cargo: r.empleado?.cargo?.nombre || r.cargo?.nombre || '',
        horaEntrada: r.horaEntrada || '',
        horaSalida: r.horaSalida || '',
        diasLaborales: formatearDias(r.diasLaborales),
      });
    });

    return finalizarReporte({ wb, ws, totalColumnas: columnas.length });
  },

  vacaciones: async (filter = {}) => {
    const rows = await reporteVacaciones(filter);
    const columnas = [
      { header: 'Empleado', key: 'nombre', width: 30 },
      { header: 'Cédula', key: 'cedula', width: 16 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'Cargo', key: 'cargo', width: 25 },
      { header: 'Desde', key: 'desde', width: 14 },
      { header: 'Hasta', key: 'hasta', width: 14 },
      { header: 'Motivo', key: 'motivo', width: 35 },
    ];

    const { wb, ws } = prepararReporte({ nombreHoja: 'Vacaciones', titulo: 'Reporte de vacaciones', columnas, filter, rows });

    rows.forEach((r) => {
      ws.addRow({
        nombre: obtenerNombreEmpleado(r.empleado),
        cedula: r.empleado?.cedula || '',
        departamento: r.empleado?.departamento?.nombre || r.departamento?.nombre || '',
        cargo: r.empleado?.cargo?.nombre || r.cargo?.nombre || '',
        desde: formatearFecha(r.desde),
        hasta: formatearFecha(r.hasta),
        motivo: r.motivo || '',
      });
    });

    return finalizarReporte({ wb, ws, totalColumnas: columnas.length });
  },

  reposos: async (filter = {}) => {
    const rows = await reporteReposos(filter);
    const columnas = [
      { header: 'Empleado', key: 'nombre', width: 30 },
      { header: 'Cédula', key: 'cedula', width: 16 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'Cargo', key: 'cargo', width: 25 },
      { header: 'Inicio', key: 'fechaInicio', width: 14 },
      { header: 'Fin', key: 'fechaFin', width: 14 },
      { header: 'Diagnóstico', key: 'diagnostico', width: 35 },
    ];

    const { wb, ws } = prepararReporte({ nombreHoja: 'Reposos Médicos', titulo: 'Reporte de reposos médicos', columnas, filter, rows });

    rows.forEach((r) => {
      ws.addRow({
        nombre: obtenerNombreEmpleado(r.empleado),
        cedula: r.empleado?.cedula || '',
        departamento: r.empleado?.departamento?.nombre || r.departamento?.nombre || '',
        cargo: r.empleado?.cargo?.nombre || r.cargo?.nombre || '',
        fechaInicio: formatearFecha(r.fechaInicio),
        fechaFin: formatearFecha(r.fechaFin),
        diagnostico: r.diagnostico || '',
      });
    });

    return finalizarReporte({ wb, ws, totalColumnas: columnas.length });
  },

  permisos: async (filter = {}) => {
    const rows = await reportePermisos(filter);
    const columnas = [
      { header: 'Empleado', key: 'nombre', width: 30 },
      { header: 'Cédula', key: 'cedula', width: 16 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'Cargo', key: 'cargo', width: 25 },
      { header: 'Fecha', key: 'fecha', width: 14 },
      { header: 'Tipo', key: 'tipo', width: 22 },
      { header: 'Motivo', key: 'motivo', width: 35 },
    ];

    const { wb, ws } = prepararReporte({ nombreHoja: 'Permisos', titulo: 'Reporte de permisos', columnas, filter, rows });

    rows.forEach((r) => {
      ws.addRow({
        nombre: obtenerNombreEmpleado(r.empleado),
        cedula: r.empleado?.cedula || '',
        departamento: r.empleado?.departamento?.nombre || r.departamento?.nombre || '',
        cargo: r.empleado?.cargo?.nombre || r.cargo?.nombre || '',
        fecha: formatearFecha(r.fecha),
        tipo: r.tipo || '',
        motivo: r.motivo || '',
      });
    });

    return finalizarReporte({ wb, ws, totalColumnas: columnas.length });
  },
};

// Función principal de exportación
module.exports = async function exportReportXlsx({ tipo = 'asistencia', filter = {} }) {
  if (!handlers[tipo]) {
    throw {
      status: 400,
      code: 'INVALID_REPORT_TYPE',
      message: 'Tipo de reporte inválido',
    };
  }

  return handlers[tipo](filter);
};