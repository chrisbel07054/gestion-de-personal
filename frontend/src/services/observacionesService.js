import api from './api.js';

// Obtener observaciones de un empleado
export const getObservacionesEmpleado = async (empleadoId) => {
  const response = await api.get(
    `/observaciones/${empleadoId}`
  );

  return response.data.data || [];
};

// Agregar observación a un empleado
export const agregarObservacion = async (empleadoId, payload) => {
  const response = await api.post(
    `/observaciones/${empleadoId}`,
    payload
  );

  return response.data.data;
};