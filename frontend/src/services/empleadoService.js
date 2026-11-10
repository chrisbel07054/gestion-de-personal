import api from './api.js';

export const getEmpleados = async ({ page = 1, limit = 20, busqueda = '', departamentoId, cargoId, estado } = {}) => {
  const params = {};

  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (busqueda) params.busqueda = busqueda;
  if (departamentoId) params.departamentoId = departamentoId;
  if (cargoId) params.cargoId = cargoId;
  if (estado) params.estado = estado;

  const response = await api.get('/empleados', { params });
  return response?.data?.data;
};

export const getEmpleadoById = async (id) => {
  const response = await api.get(`/empleados/${id}`);
  return response?.data?.data;
};

export const getEmpleadoByCedula = async (cedula) => {
  const response = await api.get(
    `/empleados/cedula/${cedula}`
  );
  return response?.data?.data;
};

export const updateEmpleado = async (id, payload) => {
  const response = await api.patch(`/empleados/${id}`, payload);
  return response?.data?.data;
};

export const uploadEmpleadoFoto = async (id, formData) => {
  const response = await api.post(`/empleados/${id}/foto`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response?.data?.data;
};

export const inactivarEmpleado = async (id) => {
  const response = await api.delete(`/empleados/${id}`);
  return response?.data;
};

// Esta es la que faltaba y causaba el error en la consola:
export const createEmpleado = async (payload) => {
  const response = await api.post('/empleados', payload);
  return response?.data?.data;
};