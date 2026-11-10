const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function obtenerHorario(empleadoId) {
  return prisma.horario.findUnique({ where: { empleadoId: toId(empleadoId) } });
};
