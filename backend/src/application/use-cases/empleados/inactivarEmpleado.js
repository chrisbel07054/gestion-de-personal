module.exports = function inactivarEmpleadoUseCase(empleadoRepository) {
  return async function inactivarEmpleado(id) {
    const empleado = await empleadoRepository.inactivar(id);
    if (!empleado) {
      const e = new Error('Empleado no encontrado');
      e.code = 'NOT_FOUND';
      throw e;
    }
    return empleado;
  };
};
