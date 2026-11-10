function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e;}

module.exports = function activarUsuarioUseCase(usuarioRepository) {
  return async function activarUsuario(id) {
    const usuario = await usuarioRepository.obtenerPorId(id);
    if (!usuario) { throw err('Usuario no encontrado', 'NOT_FOUND');}

    if (usuario.estado === 'Activo') {
      throw err('El usuario ya se encuentra activo', 'BUSINESS_RULE');
    }
    return usuarioRepository.activar(id);
  };
};