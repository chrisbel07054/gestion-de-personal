import { useCallback, useEffect, useState } from 'react';
import {
  getCargos,
  createCargo,
  updateCargo,
  inactivarCargo,
  activarCargo
} from '../services/cargoService.js'; // Ajusta la ruta de tu servicio si es necesario
import { mostrarAlerta, confirmarAccion } from '../utils/alertas.js';

export default function useCargos() {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');         // Error general de carga de la tabla
  const [errorForm, setErrorForm] = useState('');   // 👈 NUEVO: Error exclusivo para el formulario del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getCargos();
      setCargos(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error('Error cargando cargos:', err);
      const mensaje = err?.response?.data?.mensaje || err?.message || 'No se pudieron cargar los cargos.';
      setError(mensaje);
      await mostrarAlerta('error', 'Error de carga', mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setFormNombre('');
    setFormDescripcion('');
    setErrorForm(''); // Limpiamos errores previos al abrir
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    if (!item?.id) {
      mostrarAlerta('error', 'Error', 'No se encontró el identificador del cargo.');
      return;
    }
    setModalMode('edit');
    setSelectedItem(item);
    setFormNombre(item.nombre || '');
    setFormDescripcion(item.descripcion || '');
    setErrorForm(''); // Limpiamos errores previos al abrir
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setShowModal(false);
    setSelectedItem(null);
    setFormNombre('');
    setFormDescripcion('');
    setErrorForm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm(''); // Limpiamos cualquier error previo antes de validar

    if (!formNombre.trim()) {
      setErrorForm('Debe ingresar el nombre del cargo.'); // 👈 Error en el form en lugar de SweetAlert
      return;
    }

    try {
      setSubmitting(true);
      const nombre = formNombre.trim();
      const descripcion = formDescripcion.trim();

      if (modalMode === 'create') {
        await createCargo({ nombre, descripcion });
        setShowModal(false);
        await mostrarAlerta('success', '¡Cargo registrado!', 'El cargo se registró correctamente.');
      } else {
        const cargoId = selectedItem?.id;
        if (!cargoId) {
          setErrorForm('No se encontró el identificador del cargo.');
          return;
        }
        await updateCargo(cargoId, { nombre, descripcion });
        setShowModal(false);
        await mostrarAlerta('success', '¡Cargo actualizado!', 'La información del cargo se actualizó correctamente.');
      }

      setSelectedItem(null);
      setFormNombre('');
      setFormDescripcion('');
      setErrorForm('');
      await cargarDatos();
    } catch (err) {
      console.error('Error procesando cargo:', err);
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      const esCrear = modalMode === 'create';
      
      // 👈 Capturamos el error del servidor directamente en el estado local del formulario
      setErrorForm(
        mensajeServidor || 
        (esCrear ? 'No se pudo registrar el cargo.' : 'No se pudo actualizar el cargo.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInactivar = async (item) => {
    const cargoId = item?.id;
    if (!cargoId) {
      await mostrarAlerta('error', 'Error', 'No se encontró el identificador del cargo.');
      return;
    }

    const result = await confirmarAccion({
      title: '¿Inactivar cargo?',
      text: `¿Está seguro de que desea inactivar el cargo "${item.nombre}"?`,
      confirmButtonText: 'Sí, inactivar'
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await inactivarCargo(cargoId);
      await mostrarAlerta('success', '¡Cargo inactivado!', 'El cargo se inactivó correctamente.');
      await cargarDatos();
    } catch (err) {
      console.error('Error inactivando cargo:', err);
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'Operación fallida', mensajeServidor || 'No se pudo inactivar el cargo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivar = async (item) => {
    const cargoId = item?.id;
    if (!cargoId) {
      await mostrarAlerta('error', 'Error', 'No se encontró el identificador del cargo.');
      return;
    }

    const result = await confirmarAccion({
      title: '¿Reactivar cargo?',
      text: `¿Está seguro de que desea reactivar el cargo "${item.nombre}"?`,
      confirmButtonText: 'Sí, reactivar'
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await activarCargo(cargoId);
      await mostrarAlerta('success', '¡Cargo reactivado!', 'El cargo se reactivó correctamente.');
      await cargarDatos();
    } catch (err) {
      console.error('Error reactivando cargo:', err);
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'Operación fallida', mensajeServidor || 'No se pudo reactivar el cargo.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    cargos,
    loading,
    error,
    errorForm,       // 👈 Exportamos el error del formulario
    setErrorForm,    // 👈 Exportamos el setter por si requieres manipularlo
    showModal,
    modalMode,
    selectedItem,
    formNombre,
    formDescripcion,
    submitting,
    setFormNombre,
    setFormDescripcion,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleSubmit,
    handleInactivar,
    handleActivar,
    cargarDatos
  };
}