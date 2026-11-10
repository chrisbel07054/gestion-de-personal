import api from './api.js';

export const getEstadisticas = async (filtros = {}) => {
  const params = {};

  if (filtros.periodo) params.periodo = filtros.periodo;
  if (filtros.desde) params.desde = filtros.desde;
  if (filtros.hasta) params.hasta = filtros.hasta;

  if (filtros.departamentoId) {
    params.departamentoId = filtros.departamentoId;
  }

  if (filtros.empleadoId) {
    params.empleadoId = filtros.empleadoId;
  }

  if (filtros.estado) {
    params.estado = filtros.estado;
  }

  const response = await api.get('/estadisticas', { params });

  return response?.data?.data ?? response?.data;
};
