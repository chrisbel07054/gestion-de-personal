module.exports = function listarEmpleadosUseCase(empleadoRepository) {
  return async function listarEmpleados({ page = 1, limit = 20, busqueda, departamentoId, cargoId, estado } = {}) {
    return empleadoRepository.listar({ busqueda, departamentoId, cargoId, estado }, { page: Number(page), limit: Number(limit) });
  };
};
