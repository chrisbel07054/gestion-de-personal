const prisma = require('../../../infrastructure/database/prismaClient');
const { buildEmpleadoQuery } = require('./utils');

module.exports = async function reporteHorarios(filter = {}) {
  const where = await buildEmpleadoQuery(filter);
  if (where === null) return [];
  return prisma.horario.findMany({ where, include: { empleado: { include: { departamento: true, cargo: true } } } });
};
