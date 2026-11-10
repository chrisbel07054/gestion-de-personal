import LayoutAdministrador from '../layouts/LayoutAdministrador.jsx';
import logoInstitucion from '../assets/IVSS.svg';
import useUsuarios from '../hooks/useUsuarios.js';
import { useAuthStore } from '../store/authStore.js';
import SelectPersonalizado from '../components/comunes/SelectPersonalizado.jsx';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react'; // Asegúrate de importar useState si manejas errores locales o usa el del hook

export default function UsuariosPage() {
  const {
    usuarios, loading, showModal, modalMode, showPasswordModal, passwordUser,
    formPassword, confirmPassword, showPassword, showConfirmPassword,
    setFormPassword, setConfirmPassword, setShowPassword, setShowConfirmPassword,
    formNewPassword, confirmNewPassword, showNewPassword, showConfirmNewPassword,
    setFormNewPassword, setConfirmNewPassword, setShowNewPassword, setShowConfirmNewPassword,
    errorForm, setErrorForm, submitting,
    formNombre, formUser, formCorreo, formRol,
    setFormNombre, setFormUser, setFormCorreo, setFormRol,
    handleOpenCreate, handleOpenEdit, handleCloseModal, handleOpenPassword, handleClosePasswordModal,
    handleSubmitPassword: handleSubmitPasswordHook, handleSubmit: handleSubmitHook, handleInactivar, handleActivar,
  } = useUsuarios();

  // Estado local opcional para errores específicos del modal de contraseña si el hook no lo separa
  const [errorPasswordForm, setErrorPasswordForm] = useState('');

  const { usuario } = useAuthStore();
  const roles = [
    { id: 'ADMINISTRADOR', nombre: 'Administrador' },
    { id: 'RRHH', nombre: 'Recursos Humanos' },
    { id: 'OPERADOR', nombre: 'Operador' },
  ];
  const nombreUsuario = usuario?.usuario || usuario?.nombre || 'Administrador';

  const handleValidarYGuardar = async (e) => {
    e.preventDefault();
    if (!formNombre?.trim() || !formUser?.trim()) {
      setErrorForm('Debe completar los campos obligatorios.');
      return;
    }
    if (modalMode === 'create') {
      if (!formPassword || formPassword.length < 8) {
        setErrorForm('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (formPassword !== confirmPassword) {
        setErrorForm('Las contraseñas no coinciden.');
        return;
      }
    }
    await handleSubmitHook(e);
  };

  // Validador personalizado para el cambio de contraseña
  const handleValidarYGuardarPassword = async (e) => {
    e.preventDefault();
    if (!formNewPassword || formNewPassword.length < 8) {
      setErrorPasswordForm('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (formNewPassword !== confirmNewPassword) {
      setErrorPasswordForm('Las contraseñas no coinciden.');
      return;
    }
    setErrorPasswordForm('');
    await handleSubmitPasswordHook(e);
  };

  const renderAcciones = (item, esInactivo) => (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button" title="Editar" aria-label={`Editar usuario ${item.usuario}`} disabled={submitting}
        onClick={() => { setErrorPasswordForm(''); handleOpenEdit(item); }}
        className="p-2 rounded-xl border border-corporativo-boton/40 text-corporativo-boton bg-corporativo-fondo hover:bg-corporativo-principal hover:text-white disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        type="button" title="Cambiar contraseña" aria-label={`Cambiar contraseña de ${item.usuario}`} disabled={submitting}
        onClick={() => { setErrorPasswordForm(''); handleOpenPassword(item); }}
        className="p-2 rounded-xl border border-corporativo-boton/40 text-corporativo-boton bg-corporativo-fondo hover:bg-corporativo-principal hover:text-white disabled:opacity-40 transition-all cursor-pointer shadow-2xs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </button>
      <button
        type="button" title={esInactivo ? 'Activar' : 'Desactivar'} aria-label={`${esInactivo ? 'Activar' : 'Desactivar'} usuario ${item.usuario}`} disabled={submitting}
        onClick={() => esInactivo ? handleActivar(item) : handleInactivar(item)}
        className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs disabled:opacity-40 ${
          esInactivo ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {esInactivo ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l4 4L19 6" />
          ) : (
            <>
              <circle cx="12" cy="12" r="9" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.7 5.7l12.6 12.6" />
            </>
          )}
        </svg>
      </button>
    </div>
  );

  return (
    <LayoutAdministrador>
      <section className="w-full px-3 sm:px-6 pt-3 pb-6 space-y-4">
        {/* Cabecera principal */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-corporativo-borde shadow-sm">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 min-w-0">
              <img src={logoInstitucion} alt="Logo Institución" className="h-14 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-corporativo-oscuro tracking-tight leading-tight">Gestión de Usuarios</h1>
                <div className="hidden sm:flex mt-1 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-corporativo-boton">
                  <span>Administre las cuentas de acceso y usuarios del sistema.</span>
                </div>
              </div>
            </div>
            <div className="sm:hidden mt-1 text-sm text-corporativo-boton leading-relaxed">
              Administre las cuentas de acceso y usuarios del sistema.
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <button
              type="button" onClick={() => { setErrorForm(''); handleOpenCreate(); }} disabled={submitting}
              className="rounded-xl bg-corporativo-principal px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer whitespace-nowrap"
            >
              + Nuevo Usuario
            </button>
            <div className="rounded-xl bg-corporativo-fondo border border-corporativo-borde px-3.5 py-2 text-xs font-bold text-corporativo-oscuro whitespace-nowrap">
              {nombreUsuario}
            </div>
          </div>
        </div>

        {/* Listado de usuarios */}
        <section className="bg-white rounded-3xl border border-corporativo-borde/40 p-4 sm:p-6 shadow-sm space-y-6">
          <div className="border-b border-corporativo-borde/40 pb-4">
            <h2 className="text-lg font-bold text-corporativo-oscuro">Listado de Usuarios</h2>
            <p className="text-xs text-corporativo-boton mt-0.5">Visualice, edite o controle el estado operativo de los usuarios.</p>
          </div>
          {loading ? (
            <div className="p-12 text-center text-sm font-semibold text-corporativo-oscuro">Cargando usuarios...</div>
          ) : usuarios.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-corporativo-borde p-12 text-center text-sm text-corporativo-boton">No hay usuarios registrados.</div>
          ) : (
            <>
              {/* Tabla para escritorio */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full border-collapse text-center text-sm">
                  <thead>
                    <tr className="bg-corporativo-fondo text-xs font-bold uppercase tracking-wider text-corporativo-principal">
                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40">Nombre</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40">Usuario</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40">Rol</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40">Estado</th>
                      <th className="px-4 py-3.5 border-b border-corporativo-borde/40">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-corporativo-borde/40">
                    {usuarios.map((item) => {
                      const esInactivo = ['Inactivo', 'Desactivado'].includes(item.estado);
                      return (
                        <tr key={item.id} className="hover:bg-corporativo-fondo/50 transition-colors">
                          <td className="px-4 py-3.5 font-semibold text-corporativo-oscuro">{item.nombre}</td>
                          <td className="px-4 py-3.5 text-corporativo-boton">{item.usuario}</td>
                          <td className="px-4 py-3.5">
                            <span className="inline-block rounded-full bg-corporativo-fondo px-3 py-1 text-xs font-semibold text-corporativo-principal border border-corporativo-borde/40">
                              {item.rol}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold border ${
                              esInactivo ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {item.estado || 'Activo'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">{renderAcciones(item, esInactivo)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tarjetas para móvil */}
              <div className="grid grid-cols-1 gap-3 lg:hidden">
                {usuarios.map((item) => {
                  const esInactivo = ['Inactivo', 'Desactivado'].includes(item.estado);
                  return (
                    <article key={item.id} className="rounded-2xl border border-corporativo-borde bg-white p-4 shadow-xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-sm text-corporativo-oscuro">{item.nombre}</h3>
                          <p className="mt-0.5 text-xs text-corporativo-boton">@{item.usuario}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border shrink-0 ${
                          esInactivo ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.estado || 'Activo'}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-corporativo-borde/40 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-corporativo-fondo px-3 py-1 text-xs font-semibold text-corporativo-principal border border-corporativo-borde/40">
                          {item.rol}
                        </span>
                        {renderAcciones(item, esInactivo)}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Modal: cambiar contraseña */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 text-white">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold">Cambiar contraseña</h3>
                <p className="mt-1 text-sm text-slate-300">Usuario: {passwordUser?.usuario}</p>
              </div>

              {/* Mensaje de error personalizado en el modal de contraseña */}
              {errorPasswordForm && (
                <div role="alert" className="text-corporativo-claro1 font-medium text-sm">
                  {errorPasswordForm}
                </div>
              )}

              {/* Se añadió noValidate y se usa handleValidarYGuardarPassword */}
              <form onSubmit={handleValidarYGuardarPassword} className="space-y-4" autoComplete="off" noValidate>
                {/* Nueva contraseña */}
                <div>
                  <label htmlFor="nueva-contrasena" className="mb-2 block text-xs font-semibold text-slate-200 uppercase">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      id="nueva-contrasena" name="nueva-contrasena" type={showNewPassword ? 'text' : 'password'}
                      value={formNewPassword} 
                      onChange={(e) => { setFormNewPassword(e.target.value); if (errorPasswordForm) setErrorPasswordForm(''); }}
                      minLength={8} required autoComplete="new-password" disabled={submitting}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-12 text-sm text-white outline-none focus:border-corporativo-boton disabled:opacity-50"
                    />
                    <button
                      type="button" title={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      aria-label={showNewPassword ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
                      aria-pressed={showNewPassword} onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-300 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Debe tener al menos 8 caracteres.</p>
                </div>

                {/* Confirmar nueva contraseña */}
                <div>
                  <label htmlFor="confirmar-contrasena" className="mb-2 block text-xs font-semibold text-slate-200 uppercase">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      id="confirmar-contrasena" name="confirmar-contrasena" type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword} 
                      onChange={(e) => { setConfirmNewPassword(e.target.value); if (errorPasswordForm) setErrorPasswordForm(''); }}
                      minLength={8} required autoComplete="new-password" disabled={submitting}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-12 text-sm text-white outline-none focus:border-corporativo-boton disabled:opacity-50"
                    />
                    <button
                      type="button" title={showConfirmNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      aria-label={showConfirmNewPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                      aria-pressed={showConfirmNewPassword} onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-300 hover:text-white"
                    >
                      {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                  <button
                    type="button" onClick={handleClosePasswordModal} disabled={submitting}
                    className="rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="rounded-xl bg-corporativo-boton px-5 py-2.5 text-sm font-semibold text-white hover:bg-corporativo-principal disabled:opacity-50"
                  >
                    {submitting ? 'Guardando...' : 'Guardar contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: crear o editar usuario */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold tracking-wide">
                  {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
                </h3>
                <button
                  type="button" disabled={submitting} onClick={handleCloseModal} aria-label="Cerrar modal"
                  className="h-9 w-9 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              {errorForm && (
                <div role="alert" className="text-corporativo-claro1 font-medium text-sm">
                  {errorForm}
                </div>
              )}

              <form onSubmit={handleValidarYGuardar} className="space-y-4" autoComplete="off" noValidate>
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre-completo" className="mb-2 block text-xs font-semibold text-slate-200 uppercase tracking-wider">Nombre completo *</label>
                  <input
                    id="nombre-completo" name="nombre" type="text" value={formNombre} disabled={submitting}
                    placeholder="Ej. Juan Pérez" autoComplete="name" required
                    onChange={(e) => { setFormNombre(e.target.value); if (errorForm) setErrorForm(''); }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-corporativo-boton text-white placeholder-slate-500 disabled:opacity-50 transition-all"
                  />
                </div>

                {/* Nombre de usuario */}
                <div>
                  <label htmlFor="nuevo-usuario" className="mb-2 block text-xs font-semibold text-slate-200 uppercase tracking-wider">Usuario *</label>
                  <input
                    id="nuevo-usuario" name="nuevo_usuario" type="text" value={formUser} disabled={submitting}
                    placeholder="Ej. jperez" autoComplete="off" required
                    onChange={(e) => { setFormUser(e.target.value); if (errorForm) setErrorForm(''); }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-corporativo-boton text-white placeholder-slate-500 disabled:opacity-50 transition-all"
                  />
                </div>

                {/* Correo electrónico */}
                <div>
                  <label htmlFor="correo-electronico" className="mb-2 block text-xs font-semibold text-slate-200 uppercase tracking-wider">Correo electrónico</label>
                  <input
                    id="correo-electronico" name="correo" type="email" value={formCorreo} disabled={submitting}
                    placeholder="ejemplo@correo.com" autoComplete="email"
                    onChange={(e) => { setFormCorreo(e.target.value); if (errorForm) setErrorForm(''); }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm outline-none focus:border-corporativo-boton text-white placeholder-slate-500 disabled:opacity-50 transition-all"
                  />
                </div>

                {/* Contraseña: solo al crear un usuario */}
                {modalMode === 'create' && (
                  <>
                    <div>
                      <label htmlFor="contrasena-nuevo-usuario" className="mb-2 block text-xs font-semibold text-slate-200 uppercase tracking-wider">Contraseña *</label>
                      <div className="relative">
                        <input
                          id="contrasena-nuevo-usuario" name="password" type={showPassword ? 'text' : 'password'}
                          value={formPassword} disabled={submitting} minLength={8} required autoComplete="new-password"
                          onChange={(e) => { setFormPassword(e.target.value); if (errorForm) setErrorForm(''); }}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-12 text-sm outline-none focus:border-corporativo-boton text-white placeholder-slate-500 disabled:opacity-50 transition-all"
                        />
                        <button
                          type="button" title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-300 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">Debe tener al menos 8 caracteres.</p>
                    </div>

                    {/* Confirmación de contraseña */}
                    <div>
                      <label htmlFor="confirmar-contrasena-nuevo-usuario" className="mb-2 block text-xs font-semibold text-slate-200 uppercase tracking-wider">Confirmar contraseña *</label>
                      <div className="relative">
                        <input
                          id="confirmar-contrasena-nuevo-usuario" name="confirmar_password"
                          type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                          disabled={submitting} minLength={8} required autoComplete="new-password"
                          onChange={(e) => { setConfirmPassword(e.target.value); if (errorForm) setErrorForm(''); }}
                          placeholder="Repita la contraseña"
                          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 pr-12 text-sm outline-none focus:border-corporativo-boton text-white placeholder-slate-500 disabled:opacity-50 transition-all"
                        />
                        <button
                          type="button" title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                          aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
                          aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-300 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Rol */}
                <div>
                  <label htmlFor="rol-usuario" className="mb-2 block text-xs font-semibold text-slate-200 uppercase tracking-wider">Rol *</label>
                  <SelectPersonalizado
                    value={formRol} options={roles} placeholder="Seleccione..." variant="dark"
                    disabled={submitting} className="w-full"
                    onChange={(v) => { setFormRol(v); if (errorForm) setErrorForm(''); }}
                  />
                </div>

                {/* Botones */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-corporativo-boton border border-slate-700/80 px-6 py-2.5 text-sm font-semibold text-white hover:bg-corporativo-principal active:scale-95 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {submitting ? 'Procesando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </LayoutAdministrador>
  );
}