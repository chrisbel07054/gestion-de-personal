// Contrato que debe cumplir cualquier implementación de persistencia de Empleados.
// application/use-cases/empleados/* solo conoce esta interfaz, nunca Mongoose.
class EmpleadoRepository {
  async crear(datosEmpleado) { throw new Error('No implementado'); }
  async editar(id, cambios) { throw new Error('No implementado'); }
  async inactivar(id) { throw new Error('No implementado'); }
  async obtenerPorId(id) { throw new Error('No implementado'); }
  async obtenerPorCedula(cedula) { throw new Error('No implementado'); }
  async obtenerPorCedulaExacta(cedula) { throw new Error('No implementado'); }
  async listar(filtro, opciones) { throw new Error('No implementado'); }
  async existeCedula(cedula) { throw new Error('No implementado'); }
}

module.exports = EmpleadoRepository;
