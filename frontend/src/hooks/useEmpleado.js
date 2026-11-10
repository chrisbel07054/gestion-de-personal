import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getEmpleadoById,
  uploadEmpleadoFoto,
} from '../services/empleadoService.js';
import { SERVER_URL } from '../services/config';

export default function useEmpleado() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFoto, setShowFoto] = useState(false);

  const cargarEmpleado = useCallback(async (empleadoId = id) => {
    try {
      setLoading(true);
      setError('');

      const data = await getEmpleadoById(empleadoId);
      setEmpleado(data);
    } catch (err) {
      const mensajeServidor =
        err?.response?.data?.mensaje || err?.message;

      setError(
        mensajeServidor ||
          'No se pudo cargar el expediente del empleado.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarEmpleado();
  }, [cargarEmpleado]);

  const handleUploadFoto = async (empleadoId, formData) => {
    try {
      await uploadEmpleadoFoto(empleadoId, formData);

      const actualizado = await getEmpleadoById(empleadoId);

      setEmpleado(actualizado);
      setShowFoto(false);
    } catch (err) {
      const mensajeServidor =
        err?.response?.data?.mensaje || err?.message;

      setError(
        mensajeServidor ||
          'No se pudo actualizar la fotografía.'
      );
    }
  };

  const obtenerUrlFoto = (fotoPath) => {
    if (!fotoPath) return '';

    if (
      fotoPath.startsWith('http://') ||
      fotoPath.startsWith('https://') ||
      fotoPath.startsWith('blob:')
    ) {
      return fotoPath;
    }

    const rutaLimpieza = fotoPath.startsWith('/')
      ? fotoPath.slice(1)
      : fotoPath;

    return `${SERVER_URL}/${rutaLimpieza}`;
  };

  const volverAEmpleados = () => {
    navigate('/dashboard/empleados');
  };

  const abrirFoto = () => {
    setShowFoto(true);
  };

  const cerrarFoto = () => {
    setShowFoto(false);
  };

  const fotoUrl = obtenerUrlFoto(empleado?.foto);

  const esActivo =
    empleado?.estado === true ||
    empleado?.estado === 'Activo' ||
    empleado?.estado === 1 ||
    !empleado?.estado;

  return {
    id,
    empleado,
    loading,
    error,
    showFoto,
    fotoUrl,
    esActivo,
    cargarEmpleado,
    handleUploadFoto,
    volverAEmpleados,
    abrirFoto,
    cerrarFoto,
  };
}