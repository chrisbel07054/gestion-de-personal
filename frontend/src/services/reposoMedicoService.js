import api from './api.js';

// Obtener todos los reposos médicos
export const getRepososMedicos = async (filtros = {}) => {
  const params = new URLSearchParams();

  if (filtros.empleadoId) {
    params.append('empleadoId', filtros.empleadoId);
  }

  if (filtros.estado) {
    params.append('estado', filtros.estado);
  }

  const query = params.toString();

  const response = await api.get(
    query ? `/reposos?${query}` : '/reposos'
  );

  return response.data.data || [];
};

// Obtener historial de reposos de un empleado
export const getHistorialReposos = async (empleadoId) => {
  const response = await api.get(
    `/reposos/empleado/${empleadoId}`
  );

  return response.data.data || [];
};

// Crear reposo médico
export const crearReposoMedico = async (payload) => {
  const response = await api.post(
    '/reposos',
    payload
  );

  return response.data.data;
};

// Editar reposo médico
export const editarReposoMedico = async (id, payload) => {
  const response = await api.patch(
    `/reposos/${id}`,
    payload
  );

  return response.data.data;
};

// Eliminar reposo médico
export const eliminarReposoMedico = async (id) => {
  const response = await api.delete(
    `/reposos/${id}`
  );

  return response.data.data;
};

// Finalizar / aprobar reposo médico
export const finalizarReposoMedico = async (id) => {
  const response = await api.patch(
    `/reposos/${id}/finalizar`
  );

  return response.data.data;
};