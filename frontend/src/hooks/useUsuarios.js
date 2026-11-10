import { useEffect, useState } from 'react';
import { getUsuarios, createUsuario, updateUsuario, desactivarUsuario, activarUsuario, restablecerPassword } from '../services/usuarioService.js';
import { mostrarAlerta, confirmarAccion } from '../utils/alertas.js';

export default function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [errorForm, setErrorForm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);

  const [formPassword, setFormPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formNewPassword, setFormNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [formNombre, setFormNombre] = useState('');
  const [formUser, setFormUser] = useState('');
  const [formCorreo, setFormCorreo] = useState('');
  const [formRol, setFormRol] = useState('OPERADOR');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const usuariosRes = await getUsuarios();
      setUsuarios(Array.isArray(usuariosRes) ? usuariosRes : []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      const mensaje = err?.response?.data?.mensaje || err?.message || 'No se pudieron cargar los datos.';
      setError(mensaje);
      await mostrarAlerta('error', 'Error de carga', mensaje);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const limpiarPasswordsCrear = () => {
    setFormPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const limpiarPasswordsCambio = () => {
    setFormNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setErrorForm('');
    setFormNombre('');
    setFormUser('');
    setFormCorreo('');
    setFormRol('OPERADOR');
    limpiarPasswordsCrear();
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setErrorForm('');
    setFormNombre(item?.nombre || '');
    setFormUser(item?.usuario || '');
    setFormCorreo(item?.correo || '');
    setFormRol(item?.rol || 'OPERADOR');
    limpiarPasswordsCrear();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setShowModal(false);
    setErrorForm('');
    setSelectedItem(null);
    limpiarPasswordsCrear();
  };

  const handleOpenPassword = async (item) => {
    const userId = item?.id;
    if (!userId) {
      await mostrarAlerta('error', 'Usuario no válido', 'No se encontró el identificador del usuario.');
      return;
    }
    setPasswordUser(item);
    limpiarPasswordsCambio();
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    if (submitting) return;
    setShowPasswordModal(false);
    setPasswordUser(null);
    limpiarPasswordsCambio();
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (formNewPassword.length < 8) {
      await mostrarAlerta('error', 'Contraseña no válida', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (formNewPassword !== confirmNewPassword) {
      await mostrarAlerta('error', 'Las contraseñas no coinciden', 'Verifique ambos campos e inténtelo de nuevo.');
      return;
    }
    try {
      setSubmitting(true);
      await restablecerPassword(passwordUser.id, formNewPassword);
      setShowPasswordModal(false);
      const usuarioActualizado = passwordUser?.usuario;
      setPasswordUser(null);
      limpiarPasswordsCambio();
      await mostrarAlerta('success', 'Contraseña actualizada', `Se cambió la contraseña de ${usuarioActualizado}.`);
    } catch (err) {
      const mensaje = err?.response?.data?.mensaje || err?.message || 'No se pudo cambiar la contraseña.';
      await mostrarAlerta('error', 'Error', mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorForm('');
      setError('');
      const payload = {
        nombre: formNombre.trim(),
        usuario: formUser.trim(),
        correo: formCorreo.trim(),
        rol: formRol,
      };

      if (modalMode === 'create') {
        if (formPassword.length < 8) {
          setErrorForm('La contraseña debe tener al menos 8 caracteres.');
          return;
        }
        if (formPassword !== confirmPassword) {
          setErrorForm('Las contraseñas no coinciden.');
          return;
        }
        await createUsuario({ ...payload, password: formPassword });
        await loadData();
        setShowModal(false);
        setSelectedItem(null);
        limpiarPasswordsCrear();
        await mostrarAlerta('success', 'Usuario creado', 'El usuario se creó correctamente.');
        return;
      }

      const userId = selectedItem?.id;
      if (!userId) {
        const mensaje = 'No se encontró el identificador del usuario.';
        setErrorForm(mensaje);
        await mostrarAlerta('error', 'Usuario no válido', mensaje);
        return;
      }

      await updateUsuario(userId, payload);
      await loadData();
      setShowModal(false);
      setSelectedItem(null);
      await mostrarAlerta('success', 'Usuario actualizado', 'El usuario se actualizó correctamente.');
    } catch (err) {
      console.error('Error procesando usuario:', err);
      const mensaje = err?.response?.data?.mensaje || err?.message || 'No se pudo completar la operación.';
      setErrorForm(mensaje);
      await mostrarAlerta('error', 'Error', mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInactivar = async (item) => {
    const userId = item?.id;
    if (!userId) {
      await mostrarAlerta('error', 'Usuario no válido', 'No se encontró el identificador del usuario.');
      return;
    }
    const confirmado = await confirmarAccion({
      title: '¿Está seguro de desactivar este usuario?',
      text: `El usuario "${item.usuario}" pasará a estado inactivo.`,
      confirmButtonText: 'Sí, desactivar',
    });
    if (!confirmado.isConfirmed) return;

    try {
      setSubmitting(true);
      setError('');
      await desactivarUsuario(userId);
      await loadData();
      await mostrarAlerta('success', 'Usuario desactivado', `El usuario "${item.usuario}" fue desactivado correctamente.`);
    } catch (err) {
      console.error('Error desactivando usuario:', err);
      const mensaje = err?.response?.data?.mensaje || err?.message || 'No se pudo desactivar el usuario.';
      setError(mensaje);
      await mostrarAlerta('error', 'Error', mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivar = async (item) => {
    const userId = item?.id;
    if (!userId) {
      await mostrarAlerta('error', 'Usuario no válido', 'No se encontró el identificador del usuario.');
      return;
    }
    const confirmado = await confirmarAccion({
      title: '¿Está seguro de activar este usuario?',
      text: `El usuario "${item.usuario}" volverá a estar activo.`,
      confirmButtonText: 'Sí, activar',
    });
    if (!confirmado.isConfirmed) return;

    try {
      setSubmitting(true);
      setError('');
      await activarUsuario(userId);
      await loadData();
      await mostrarAlerta('success', 'Usuario activado', `El usuario "${item.usuario}" fue activado correctamente.`);
    } catch (err) {
      console.error('Error activando usuario:', err);
      const mensaje = err?.response?.data?.mensaje || err?.message || 'No se pudo activar el usuario.';
      setError(mensaje);
      await mostrarAlerta('error', 'Error', mensaje);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    usuarios, loading, error, showModal, showPasswordModal, modalMode, errorForm, setErrorForm, selectedItem, submitting, passwordUser,
    formPassword, confirmPassword, showPassword, showConfirmPassword, setFormPassword, setConfirmPassword, setShowPassword, setShowConfirmPassword,
    formNewPassword, confirmNewPassword, showNewPassword, showConfirmNewPassword, setFormNewPassword, setConfirmNewPassword, setShowNewPassword, setShowConfirmNewPassword,
    formNombre, formUser, formCorreo, formRol, setFormNombre, setFormUser, setFormCorreo, setFormRol,
    loadData, handleOpenCreate, handleOpenEdit, handleCloseModal, handleOpenPassword, handleClosePasswordModal, handleSubmitPassword, handleSubmit, handleInactivar, handleActivar,
  };
}