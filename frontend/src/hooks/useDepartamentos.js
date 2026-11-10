import { useCallback, useEffect, useState } from 'react';
import {
  getDepartamentos,
  createDepartamento,
  updateDepartamento,
  inactivarDepartamento,
  activarDepartamento
} from '../services/departamentoService.js';
import { mostrarAlerta, confirmarAccion } from '../utils/alertas.js';

export default function useDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(''); // Error general de carga de la tabla
  const [errorForm, setErrorForm] = useState(''); // 👈 NUEVO: Error exclusivo para el formulario del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDepartamentos();
      setDepartamentos(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      console.error('Error cargando departamentos:', err);
      const mensaje = err?.response?.data?.mensaje || err?.message || 'No se pudieron cargar los departamentos.';
      setError(mensaje);
      await mostrarAlerta('error', 'Error de carga', mensaje);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirCrear = () => {
    setModalMode('create');
    setSelectedItem(null);
    setFormNombre('');
    setFormDescripcion('');
    setErrorForm(''); // Limpiamos errores previos al abrir
    setShowModal(true);
  };

  const abrirEditar = (item) => {
    if (!item?.id) {
      mostrarAlerta('error', 'Error', 'No se encontró el identificador del departamento.');
      return;
    }
    setModalMode('edit');
    setSelectedItem(item);
    setFormNombre(item.nombre || '');
    setFormDescripcion(item.descripcion || '');
    setErrorForm(''); // Limpiamos errores previos al abrir
    setShowModal(true);
  };

  const cerrarModal = () => {
    if (submitting) return;
    setShowModal(false);
    setSelectedItem(null);
    setFormNombre('');
    setFormDescripcion('');
    setErrorForm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorForm(''); // Limpiar cualquier error anterior antes de validar

    if (!formNombre.trim()) {
      setErrorForm('Debe ingresar el nombre del departamento.'); // 👈 Mostramos el error en el form en lugar de SweetAlert
      return;
    }

    try {
      setSubmitting(true);
      const nombre = formNombre.trim();
      const descripcion = formDescripcion.trim();

      if (modalMode === 'create') {
        await createDepartamento({ nombre, descripcion });
        setShowModal(false);
        await mostrarAlerta('success', '¡Departamento registrado!', 'El departamento se registró correctamente.');
      } else {
        const depId = selectedItem?.id;
        if (!depId) {
          setErrorForm('No se encontró el identificador del departamento.');
          return;
        }
        await updateDepartamento(depId, { nombre, descripcion });
        setShowModal(false);
        await mostrarAlerta('success', '¡Departamento actualizado!', 'La información del departamento se actualizó correctamente.');
      }

      setSelectedItem(null);
      setFormNombre('');
      setFormDescripcion('');
      setErrorForm('');
      await cargarDatos();
    } catch (err) {
      console.error('Error procesando departamento:', err);
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      const esCrear = modalMode === 'create';
      
      // 👈 Capturamos el error del servidor directamente en el estado del formulario
      setErrorForm(
        mensajeServidor || 
        (esCrear ? 'No se pudo registrar el departamento.' : 'No se pudo actualizar el departamento.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInactivar = async (item) => {
    const depId = item?.id;
    if (!depId) {
      await mostrarAlerta('error', 'Error', 'No se encontró el identificador del departamento.');
      return;
    }

    const result = await confirmarAccion({
      title: '¿Inactivar departamento?',
      text: `¿Está seguro de que desea inactivar el departamento "${item.nombre}"?`,
      confirmButtonText: 'Sí, inactivar'
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await inactivarDepartamento(depId);
      await mostrarAlerta('success', '¡Departamento inactivado!', 'El departamento se inactivó correctamente.');
      await cargarDatos();
    } catch (err) {
      console.error('Error inactivando departamento:', err);
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'Operación fallida', mensajeServidor || 'No se pudo inactivar el departamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivar = async (item) => {
    const depId = item?.id;
    if (!depId) {
      await mostrarAlerta('error', 'Error', 'No se encontró el identificador del departamento.');
      return;
    }

    const result = await confirmarAccion({
      title: '¿Reactivar departamento?',
      text: `¿Está seguro de que desea reactivar el departamento "${item.nombre}"?`,
      confirmButtonText: 'Sí, reactivar'
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      await activarDepartamento(depId);
      await mostrarAlerta('success', '¡Departamento reactivado!', 'El departamento se reactivó correctamente.');
      await cargarDatos();
    } catch (err) {
      console.error('Error reactivando departamento:', err);
      const mensajeServidor = err?.response?.data?.mensaje || err?.message;
      await mostrarAlerta('error', 'Operación fallida', mensajeServidor || 'No se pudo reactivar el departamento.');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    departamentos,
    loading,
    submitting,
    error,
    errorForm,         // 👈 Exportamos el estado del error del formulario
    setErrorForm,      // 👈 Exportamos el modificador por si quieres limpiarlo desde la vista
    showModal,
    modalMode,
    selectedItem,
    formNombre,
    formDescripcion,
    setFormNombre,
    setFormDescripcion,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    handleSubmit,
    handleInactivar,
    handleActivar,
    cargarDatos
  };
}