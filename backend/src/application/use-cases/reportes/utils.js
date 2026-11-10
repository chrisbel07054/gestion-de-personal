const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

async function buildEmpleadoQuery(filter = {}) {
  const where = {};
  if (filter.empleadoId) {
    where.empleadoId = toId(filter.empleadoId);
  }
  if (filter.departamentoId) {
    const empleados = await prisma.empleado.findMany({
      where: {
        departamentoId: toId(filter.departamentoId),
      },
      select: {
        id: true,
      },
    });

    if (!empleados.length) return null;
    const ids = empleados.map((empleado) => empleado.id);
    if (where.empleadoId) {
      if (!ids.some((id) => String(id) === String(where.empleadoId))) {
        return null;
      }
    } else {
      where.empleadoId = {
        in: ids,
      };
    }
  }

  return where;
}

function applyFechaRange(where, field, desde, hasta) {
  if (desde && hasta) where[field] = { gte: desde, lte: hasta };
  else if (desde) where[field] = { gte: desde };
  else if (hasta) where[field] = { lte: hasta };
}

module.exports = { buildEmpleadoQuery, applyFechaRange };
