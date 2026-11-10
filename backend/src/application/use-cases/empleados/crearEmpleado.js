const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');


function err(mensaje, code) { 
  const e = new Error(mensaje); 
  e.code = code; 
  return e; 
}

module.exports = function crearEmpleadoUseCase(empleadoRepository) {
  return async function crearEmpleado(payload) {

    const departamento = await prisma.departamento.findUnique({ 
      where: { id: toId(payload.departamentoId) } 
    });

    if (!departamento || departamento.estado !== 'Activo') 
      throw err('Departamento inválido o inactivo', 'INVALID_DEPARTMENT');


    const cargo = await prisma.cargo.findUnique({ 
      where: { id: toId(payload.cargoId) } 
    });

    if (!cargo || cargo.estado !== 'Activo') 
      throw err('Cargo inválido o inactivo', 'INVALID_CARGO');


    if (await empleadoRepository.existeCedula(payload.cedula)) 
      throw err('Cédula ya registrada', 'DUPLICATE');


    // Conversión de fechas para Prisma DateTime
    if (payload.fechaNacimiento) {
      payload.fechaNacimiento = new Date(`${payload.fechaNacimiento}T00:00:00.000Z`);
    }

    if (payload.fechaIngreso) {
      payload.fechaIngreso = new Date(`${payload.fechaIngreso}T00:00:00.000Z`);
    }


    return empleadoRepository.crear(payload);
  };
};