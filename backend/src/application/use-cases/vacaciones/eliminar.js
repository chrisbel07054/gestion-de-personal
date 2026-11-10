const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function eliminarVacacion(id) {
  try {
    await prisma.vacacion.delete({
      where: {
        id: toId(id)
      }
    });

    return true;
  } catch (e) {
    if (e.code === 'P2025') {
      throw {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Vacación no encontrada'
      };
    }

    throw e;
  }
};