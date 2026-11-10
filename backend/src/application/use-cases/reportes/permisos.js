const prisma = require('../../../infrastructure/database/prismaClient');
const { buildEmpleadoQuery, applyFechaRange } = require('./utils');

module.exports = async function reportePermisos(filter = {}) {
  const where = await buildEmpleadoQuery(filter);
  if (where === null) return [];
  applyFechaRange(where, 'fecha', filter.desde, filter.hasta);
  return prisma.permiso.findMany({ where, include: { empleado: { include: { departamento: true, cargo: true } } } });
};
