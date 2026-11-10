function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function editarUsuarioUseCase(usuarioRepository) {
  return async function editarUsuario(id, cambios) {
    const { password, passwordHash, ...camposPermitidos } = cambios; // la contraseña no se cambia por esta vía
    if (camposPermitidos.usuario && await usuarioRepository.existeUsuario(camposPermitidos.usuario, id)) {
      throw err('Nombre de usuario ya en uso', 'DUPLICATE');
    }
    const usuario = await usuarioRepository.editar(id, camposPermitidos);
    if (!usuario) throw err('Usuario no encontrado', 'NOT_FOUND');
    return usuario;
  };
};
