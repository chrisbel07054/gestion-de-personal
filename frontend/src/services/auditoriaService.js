import api from './api.js';

export const getAuditoria = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.fecha) {
    params.append('desde', filtros.fecha);
    params.append('hasta', filtros.fecha);
  }

  if (filtros.page) {
    params.append('page', filtros.page);
  }

  if (filtros.limit) {
    params.append('limit', filtros.limit);
  }

  const query = params.toString();

  const response = await api.get(
    `/auditoria${query ? `?${query}` : ''}`
  );

  return response.data?.data || {};
};