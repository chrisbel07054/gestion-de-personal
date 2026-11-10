const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function editarPermiso(id, updates) {
  try {
    const permisoId = toId(id);

    const data = {
      fecha: updates.fecha,
      tipo: updates.tipo,
      motivo: updates.motivo
    };

    if (updates.empleadoId !== undefined) {
      data.empleadoId = toId(updates.empleadoId);
    }

    return await prisma.permiso.update({
      where: {
        id: permisoId
      },
      data
    });

  } catch (e) {
    if (e.code === 'P2025') {
      throw {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Permiso no encontrado'
      };
    }

    throw e;
  }
};