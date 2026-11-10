const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

function err(mensaje, code) { const e = new Error(mensaje); e.code = code; return e; }

module.exports = function editarEmpleadoUseCase(empleadoRepository) {
  return async function editarEmpleado(id, cambios) {
    if (cambios.departamentoId) {
      const departamento = await prisma.departamento.findUnique({ where: { id: toId(cambios.departamentoId) } });
      if (!departamento || departamento.estado !== 'Activo') throw err('Departamento inválido o inactivo', 'INVALID_DEPARTMENT');
    }
    if (cambios.cargoId) {
      const cargo = await prisma.cargo.findUnique({ where: { id: toId(cambios.cargoId) } });
      if (!cargo || cargo.estado !== 'Activo') throw err('Cargo inválido o inactivo', 'INVALID_CARGO');
    }
    const empleado = await empleadoRepository.editar(id, cambios);
    if (!empleado) throw err('Empleado no encontrado', 'NOT_FOUND');
    return empleado;
  };
};
