const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function eliminarPermiso(id) {
  try {
    await prisma.permiso.delete({ where: { id: toId(id) } });
    return true;
  } catch (e) {
    if (e.code === 'P2025') throw { status: 404, code: 'NOT_FOUND', message: 'Permiso no encontrado' };
    throw e;
  }
};
