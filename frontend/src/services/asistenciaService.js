import api from './api.js';

export const getAsistenciasDia = async (filtros = {}) => {
  const params = new URLSearchParams();
  
  if (filtros.fecha) {
    params.append('fecha', filtros.fecha);
  }

  if (filtros.departamentoId) {
    params.append('departamentoId', filtros.departamentoId);
  }

  // Detectamos si es cédula (números) o nombre (texto) para evitar conflictos en el backend
  if (filtros.busqueda) {
    const valor = filtros.busqueda.trim();
    const esNumero = /^\d+$/.test(valor);
    
    if (esNumero) {
      params.append('cedula', valor);
    } else {
      params.append('nombre', valor);
    }
  }

  if (filtros.page) {
    params.append('page', filtros.page);
  }

  if (filtros.limit) {
    params.append('limit', filtros.limit);
  }

  const response = await api.get(`/asistencia?${params.toString()}`);
  return response.data;
};

export const getHistorialEmpleado = async (empleadoId, filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.desde) params.append('desde', filtros.desde);
  if (filtros.hasta) params.append('hasta', filtros.hasta);

  const query = params.toString();
  const response = await api.get(`/asistencia/${empleadoId}${query ? `?${query}` : ''}`);
  return response.data.data || [];
};

export const registrarEntrada = async (payload) => {
  const response = await api.post('/asistencia/entrada', payload);
  return response.data.data;
};

export const registrarSalida = async (payload) => {
  const response = await api.post('/asistencia/salida', payload);
  return response.data.data;
};