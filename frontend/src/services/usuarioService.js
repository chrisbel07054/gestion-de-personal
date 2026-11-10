import api from './api.js';

export const getUsuarios = async () => {
  const response = await api.get('/usuarios');
  return response?.data?.data || response?.data || [];
};

export const createUsuario = async (data) => {
  const response = await api.post('/usuarios', data);
  return response?.data?.data || response?.data;
};

// Cambiado de PUT a PATCH según tu ruta router.patch('/:id')
export const updateUsuario = async (id, data) => {
  const response = await api.patch(`/usuarios/${id}`, data);
  return response?.data?.data || response?.data;
};

// Cambiado de /inactivar a DELETE /usuarios/:id según tu ruta router.delete('/:id')
export const desactivarUsuario = async (id) => {
  const response = await api.delete(`/usuarios/${id}`);
  return response?.data?.data || response?.data;
};

export const activarUsuario = async (id) => {
  const response = await api.patch(`/usuarios/${id}/activar`);
  return response?.data?.data || response?.data;
};

// Cambiado de /reset-password a PATCH /usuarios/:id/restablecer-password
export const restablecerPassword = async (id, newPassword) => {
  const body = newPassword ? { newPassword } : {};
  const response = await api.patch(`/usuarios/${id}/restablecer-password`, body);
  return response?.data?.data || response?.data;
};