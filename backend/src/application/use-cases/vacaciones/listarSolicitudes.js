const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function listarSolicitudesVacaciones(filter = {}) {
  const where = {};

  if (filter.empleadoId) {
    where.empleadoId = toId(filter.empleadoId);
  }

  if (filter.estado) {
    where.estado = filter.estado;
  }

  return prisma.vacacion.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    },
    take: 500
  });
};