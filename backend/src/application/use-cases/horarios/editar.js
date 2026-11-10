const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function editarHorario(empleadoId, updates) {
  try {
    return await prisma.horario.update({ where: { empleadoId: toId(empleadoId) }, data: updates });
  } catch (e) {
    if (e.code === 'P2025') return null;
    throw e;
  }
};
