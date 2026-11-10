const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function asignarHorario(empleadoId, payload) {
  const empId = toId(empleadoId);
  const emp = await prisma.empleado.findUnique({ where: { id: empId } });
  if (!emp || emp.estado !== 'Activo') throw { status: 400, code: 'INVALID_EMPLOYEE', message: 'Empleado inválido o inactivo' };

  return prisma.horario.upsert({
    where: { empleadoId: empId },
    update: { ...payload, vigente: true },
    create: { ...payload, empleadoId: empId, vigente: true },
  });
};
