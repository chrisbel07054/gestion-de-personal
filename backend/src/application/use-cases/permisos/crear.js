const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function crearPermiso({ empleadoId, fecha, tipo, motivo, aprobadoPorId }) {
  const empId = toId(empleadoId);
  const emp = await prisma.empleado.findUnique({ where: { id: empId } });
  if (!emp || emp.estado !== 'Activo') throw { status: 400, code: 'INVALID_EMPLOYEE', message: 'Empleado inválido o inactivo' };

  const existe = await prisma.permiso.findFirst({ where: { empleadoId: empId, fecha, tipo, estado: { in: ['Pendiente', 'Aprobado'] } } });
  if (existe) throw { status: 400, code: 'DUPLICATE', message: 'Ya existe un permiso para ese día y tipo' };

  return prisma.permiso.create({
    data: {
      empleadoId: empId,
      fecha,
      tipo,
      motivo,
      estado: aprobadoPorId ? 'Aprobado' : 'Pendiente',
      aprobadoPorId: aprobadoPorId || null,
    },
  });
};
