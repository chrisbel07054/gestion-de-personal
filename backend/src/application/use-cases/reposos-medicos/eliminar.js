const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function eliminarReposo(id) {
  try {
    await prisma.reposoMedico.delete({ where: { id: toId(id) } });
    return true;
  } catch (e) {
    if (e.code === 'P2025') throw { status: 404, code: 'NOT_FOUND', message: 'Reposo no encontrado' };
    throw e;
  }
};
