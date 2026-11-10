import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { toast } from 'react-toastify';

function obtenerDestino(rol) {
  if (rol === 'ADMINISTRADOR') {
    return '/admin';
  }

  if (rol === 'RRHH') {
    return '/dashboard';
  }

  if (rol === 'OPERADOR') {
    return '/operador';
  }

  return '/login';
}

export default function useLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, rol, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    usuario: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.usuario.trim() || !form.password.trim()) {
      setError(
        'Por favor, complete todos los campos para iniciar sesión.'
      );
      return;
    }

    try {
      const result = await login({
        usuario: form.usuario,
        password: form.password,
      });

      if (result?.ok) {
        try {
          localStorage.setItem('showWelcome', 'true');
        } catch (e) {
          // ignore storage errors
        }

        const destination = obtenerDestino(result.rol);

        navigate(destination, {
          replace: true,
        });
      }
    } catch (err) {
      const mensajeServidor =
        err?.response?.data?.mensaje ||
        err?.message ||
        '';

      const mensajeNormalizado = mensajeServidor.toLowerCase();

      const esErrorCredenciales =
        mensajeNormalizado.includes('credencial') ||
        mensajeNormalizado.includes('inálid') ||
        mensajeNormalizado.includes('invalid') ||
        err?.response?.status === 401;

      if (esErrorCredenciales || !mensajeServidor) {
        setError(
          'El usuario o la contraseña son incorrectos. Verifique sus datos e intente nuevamente.'
        );
      } else {
        setError(mensajeServidor);
      }
    }
  };

  const destinoAutenticado = obtenerDestino(rol);

  return {
    form,
    error,
    isAuthenticated,
    isLoading,
    destinoAutenticado,
    handleChange,
    handleSubmit,
  };
}