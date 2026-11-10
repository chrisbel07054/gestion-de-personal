const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function finalizarReposo(id, aprobadoPor) {
  const data = { estado: 'Aprobado' };
  if (aprobadoPor) data.aprobadoPorId = toId(aprobadoPor);
  try {
    return await prisma.reposoMedico.update({ where: { id: toId(id) }, data });
  } catch (e) {
    if (e.code === 'P2025') throw { status: 404, code: 'NOT_FOUND', message: 'Reposo no encontrado' };
    throw e;
  }
};
