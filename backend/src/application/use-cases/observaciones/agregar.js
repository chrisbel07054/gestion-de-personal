const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function agregarObservacion({ empleadoId, texto, autorId }) {
  const empId = toId(empleadoId);
  const empleado = await prisma.empleado.findUnique({ where: { id: empId } });
  if (!empleado) {
    const err = new Error('Empleado no encontrado');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return prisma.observacion.create({ data: { empleadoId: empId, texto, autorId: toId(autorId), fecha: new Date() } });
};
