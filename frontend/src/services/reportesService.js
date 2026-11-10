import api from './api.js';

const construirParams = (filtros = {}) => {
  const params = {};

  if (filtros.empleadoId) {
    params.empleadoId = filtros.empleadoId;
  }

  if (filtros.departamentoId) {
    params.departamentoId = filtros.departamentoId;
  }

  if (filtros.desde) {
    params.desde = filtros.desde;
  }

  if (filtros.hasta) {
    params.hasta = filtros.hasta;
  }

  return params;
};

/* REPORTE DE ASISTENCIA */
export const getReporteAsistencia = async (filtros = {}) => {
  const response = await api.get('/reportes/asistencia', {
    params: construirParams(filtros),
  });

  return response.data;
};

/* REPORTE DE HORARIOS */
export const getReporteHorarios = async (filtros = {}) => {
  const response = await api.get('/reportes/horarios', {
    params: construirParams(filtros),
  });

  return response.data;
};

/* GET /api/reportes/vacaciones */
export const getReporteVacaciones = async (filtros = {}) => {
  const response = await api.get('/reportes/vacaciones', {
    params: construirParams(filtros),
  });

  return response.data;
};

/* REPORTE DE REPOSOS */
export const getReporteReposos = async (filtros = {}) => {
  const response = await api.get('/reportes/reposos-medicos', {
    params: construirParams(filtros),
  });

  return response.data;
};

/* REPORTE DE PERMISOS */
export const getReportePermisos = async (filtros = {}) => {
  const response = await api.get('/reportes/permisos', {
    params: construirParams(filtros),
  });

  return response.data;
};

/* Exportar reporte en PDF. */
export const exportarReportePDF = async (filtros = {}) => {
  const response = await api.get('/reportes/exportar/pdf', {
    params: {
      ...construirParams(filtros),
      tipo: filtros.tipo,
    },
    responseType: 'blob',
  });

  return response;
};

/* Exportar reporte en Excel. */
export const exportarReporteExcel = async (filtros = {}) => {
  const response = await api.get('/reportes/exportar/excel', {
    params: {
      ...construirParams(filtros),
      tipo: filtros.tipo,
    },
    responseType: 'blob',
  });

  return response;
};