module.exports = function listarUsuariosUseCase(usuarioRepository) {
  return async function listarUsuarios() {
    return usuarioRepository.listar();
  };
};
