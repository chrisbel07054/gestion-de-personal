// Contrato genérico para catálogos administrables (Departamento, Cargo).
// Ambos comparten exactamente las mismas operaciones.
class CatalogoRepository {
  async listar() { throw new Error('No implementado'); }
  async obtenerPorId(id) { throw new Error('No implementado'); }
  async existeNombre(nombre, excluirId) { throw new Error('No implementado'); }
  async crear(datos) { throw new Error('No implementado'); }
  async editar(id, cambios) { throw new Error('No implementado'); }
  async inactivar(id) { throw new Error('No implementado'); }
  async contarEmpleadosActivosAsociados(id) { throw new Error('No implementado'); }
}

module.exports = CatalogoRepository;
