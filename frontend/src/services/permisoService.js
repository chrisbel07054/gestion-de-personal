import api from './api.js';

// Obtener todos los permisos
export const getPermisos = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.empleadoId) {
    params.append('empleadoId', filtros.empleadoId);
  }

  if (filtros.estado) {
    params.append('estado', filtros.estado);
  }

  const query = params.toString();

  const response = await api.get(
    query ? `/permisos?${query}` : '/permisos'
  );

  return response.data.data || [];
};

// Obtener historial de permisos de un empleado
export const getHistorialPermisos = async (empleadoId) => {
  const response = await api.get(
    `/permisos/empleado/${empleadoId}`
  );

  return response.data.data || [];
};

// Crear permiso
export const crearPermiso = async (payload) => {
  const response = await api.post(
    '/permisos',
    payload
  );

  return response.data.data;
};

// Editar permiso
export const editarPermiso = async (id, payload) => {
  const response = await api.patch(
    `/permisos/${id}`,
    payload
  );

  return response.data.data;
};

// Eliminar permiso
export const eliminarPermiso = async (id) => {
  const response = await api.delete(
    `/permisos/${id}`
  );

  return response.data.data;
};