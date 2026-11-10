import api from './api.js';

export const getCargos = async () => {
  const response = await api.get('/cargos');
  return response?.data?.data || response?.data || [];
};

export const createCargo = async (payload) => {
  const response = await api.post('/cargos', payload);
  return response?.data?.data || response?.data;
};

export const updateCargo = async (id, payload) => {
  const response = await api.patch(`/cargos/${id}`, payload);
  return response?.data?.data || response?.data;
};

export const inactivarCargo = async (id) => {
  const response = await api.delete(`/cargos/${id}`);
  return response?.data?.data || response?.data;
};

export const activarCargo = async (id) => {
  const response = await api.patch(`/cargos/${id}/activar`);
  return response?.data?.data || response?.data;
};