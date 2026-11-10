import api from './api.js';

export const getDashboardMetrics = async () => {
  const response = await api.get('/dashboard/metrics');

  return response?.data?.data;
};

export const getAsistenciaPorDepartamento = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.fecha) {
    params.append('fecha', filtros.fecha);
  }

  if (filtros.desde) {
    params.append('desde', filtros.desde);
  }

  if (filtros.hasta) {
    params.append('hasta', filtros.hasta);
  }

  const query = params.toString();

  const response = await api.get(
    `/dashboard/asistencia-por-departamento${
      query ? `?${query}` : ''
    }`
  );

  return response?.data?.data || [];
};

export const getTopRetardos = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.mes) {
    params.append('mes', filtros.mes);
  }

  if (filtros.limit) {
    params.append('limit', filtros.limit);
  }

  const query = params.toString();

  const response = await api.get(
    `/dashboard/top-retardos${
      query ? `?${query}` : ''
    }`
  );

  return response?.data?.data || [];
};

export const getProximasReincorporaciones = async (dias = 7) => {
  const response = await api.get(
    `/dashboard/proximas-reincorporaciones?dias=${dias}`
  );

  return response?.data?.data || [];
};