import api from './api.js';

export const getDepartamentos = async () => {
  const response = await api.get('/departamentos');
  return response?.data?.data || response?.data || [];
};

export const createDepartamento = async (payload) => {
  const response = await api.post('/departamentos', payload);
  return response?.data?.data || response?.data;
};

export const updateDepartamento = async (id, payload) => {
  const response = await api.patch(`/departamentos/${id}`, payload);
  return response?.data?.data || response?.data;
};

export const inactivarDepartamento = async (id) => {
  const response = await api.delete(`/departamentos/${id}`);
  return response?.data?.data || response?.data;
};

export const activarDepartamento = async (id) => {
  const response = await api.patch(`/departamentos/${id}/activar`);
  return response?.data?.data || response?.data;
};