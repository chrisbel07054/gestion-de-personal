module.exports = function obtenerExpedienteUseCase(empleadoRepository) {
  return async function obtenerExpediente(id) {
    const empleado = await empleadoRepository.obtenerPorId(id);
    if (!empleado) {
      const e = new Error('Empleado no encontrado');
      e.code = 'NOT_FOUND';
      throw e;
    }
    return empleado;
  };
};
