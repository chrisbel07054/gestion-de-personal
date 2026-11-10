import api from './api.js';

// Obtener todas las solicitudes de vacaciones
export const getVacaciones = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.empleadoId) {
    params.append('empleadoId', String(filtros.empleadoId));
  }

  if (filtros.estado) {
    params.append('estado', filtros.estado);
  }

  const query = params.toString();

  const response = await api.get(
    query ? `/vacaciones?${query}` : '/vacaciones'
  );

  return response.data.data || [];
};

// Obtener historial de vacaciones de un empleado
export const getHistorialVacaciones = async (empleadoId) => {
  const response = await api.get(
    `/vacaciones/empleado/${String(empleadoId)}`
  );

  return response.data.data || [];
};

// Crear solicitud de vacaciones
export const crearVacacion = async (payload) => {
  const response = await api.post(
    '/vacaciones',
    payload
  );

  return response.data.data;
};

// Editar una vacación
export const editarVacacion = async (id, payload) => {
  const response = await api.patch(
    `/vacaciones/${id}`,
    payload
  );

  return response.data.data;
};

// Eliminar una vacación
export const eliminarVacacion = async (id) => {
  const response = await api.delete(
    `/vacaciones/${id}`
  );

  return response.data.data;
};