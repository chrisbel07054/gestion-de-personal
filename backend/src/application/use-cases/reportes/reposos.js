const prisma = require('../../../infrastructure/database/prismaClient');

const { buildEmpleadoQuery } = require('./utils');

module.exports = async function reporteReposos(filter = {}) {
  const where = await buildEmpleadoQuery(filter);

  if (where === null) return [];

  if (filter.desde && filter.hasta) {
    where.fechaInicio = { lte: filter.hasta };
    where.fechaFin = { gte: filter.desde };
  } else if (filter.desde) {
    where.fechaFin = { gte: filter.desde };
  } else if (filter.hasta) {
    where.fechaInicio = { lte: filter.hasta };
  }

  return prisma.reposoMedico.findMany({
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