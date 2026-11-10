const prisma = require('../../../infrastructure/database/prismaClient');

const { buildEmpleadoQuery } = require('./utils');

module.exports = async function reporteVacaciones(filter = {}) {
  const where = await buildEmpleadoQuery(filter);

  if (where === null) return [];

  if (filter.desde && filter.hasta) {
    where.desde = { lte: filter.hasta };
    where.hasta = { gte: filter.desde };
  } else if (filter.desde) {
    where.hasta = { gte: filter.desde };
  } else if (filter.hasta) {
    where.desde = { lte: filter.hasta };
  }

  return prisma.vacacion.findMany({
    where,
    include: {
      empleado: {
        include: {
          departamento: true,
          cargo: true,
        },
      },
    },
  });
};