const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function listarObservaciones(empleadoId) {
  return prisma.observacion.findMany({
    where: { empleadoId: toId(empleadoId) },
    orderBy: { fecha: 'desc' },
    include: { autor: { select: { nombre: true, usuario: true } } },
  });
};
