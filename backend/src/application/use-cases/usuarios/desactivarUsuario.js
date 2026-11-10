function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function desactivarUsuarioUseCase(usuarioRepository) {
  return async function desactivarUsuario(id) {
    const usuario = await usuarioRepository.obtenerPorId(id);
    if (!usuario) throw err('Usuario no encontrado', 'NOT_FOUND');

    if (usuario.rol === 'ADMINISTRADOR') {
      const activos = await usuarioRepository.contarAdministradoresActivos();
      if (activos <= 1) {
        throw err('No se puede desactivar al único Administrador activo', 'BUSINESS_RULE');
      }
    }
    return usuarioRepository.desactivar(id);
  };
};
