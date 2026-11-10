import api from './api.js';

// Obtener horario de un empleado
export const getHorarioEmpleado = async (empleadoId) => {
  const response = await api.get(`/horarios/${empleadoId}`);
  return response.data.data;
};

// Asignar horario individual
export const asignarHorarioEmpleado = async (empleadoId, datos) => {
  const response = await api.post(
    `/horarios/${empleadoId}`,
    datos
  );

  return response.data.data;
};

// Editar horario individual
export const editarHorarioEmpleado = async (empleadoId, datos) => {
  const response = await api.patch(
    `/horarios/${empleadoId}`,
    datos
  );

  return response.data.data;
};

// Asignar horario por departamento
export const asignarHorarioDepartamento = async (
  departamentoId,
  datos
) => {
  const response = await api.post(
    `/horarios/departamento/${departamentoId}`,
    datos
  );

  return response.data.data;
};