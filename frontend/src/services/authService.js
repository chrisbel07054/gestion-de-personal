import api from './api.js';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);

  return {
    token: response?.data?.data?.token,
    rol: response?.data?.data?.rol,
  };
};

export const getProfile = async () => {
  const response = await api.get('/auth/perfil');
  return response.data;
};
