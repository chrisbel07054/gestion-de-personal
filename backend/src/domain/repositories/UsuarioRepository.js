class UsuarioRepository {
  async crear(datos) { throw new Error('No implementado'); }
  async editar(id, cambios) { throw new Error('No implementado'); }
  async obtenerPorId(id) { throw new Error('No implementado'); }
  async obtenerPorUsuario(usuario) { throw new Error('No implementado'); }
  async listar() { throw new Error('No implementado'); }
  async existeUsuario(usuario) { throw new Error('No implementado'); }
  async contarAdministradoresActivos() { throw new Error('No implementado'); }
  async desactivar(id) { throw new Error('No implementado'); }
}

module.exports = UsuarioRepository;
