const prisma = require('../../../infrastructure/database/prismaClient');

const hoyString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const sumarDias = (fechaString, dias) => {
  const [year, month, day] = fechaString.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  fecha.setDate(fecha.getDate() + dias);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
};

module.exports = async function proximasReincorporaciones({ dias = 7 } = {}) {
  const hoy = hoyString();
  const fin = sumarDias(hoy, dias);

  const [vacaciones, reposos] = await Promise.all([
    prisma.vacacion.findMany({
      where: { hasta: { gte: hoy, lte: fin } },
      include: { empleado: true }
    }),
    prisma.reposoMedico.findMany({
      where: { fechaFin: { gte: hoy, lte: fin } },
      include: { empleado: true }
    })
  ]);

  const items = [];

  const procesarItems = (registros, tipo) => {
    registros.forEach((reg) => {
      const fechaReincorporacion = sumarDias(reg.hasta || reg.fechaFin, 1);
      if (fechaReincorporacion >= hoy && fechaReincorporacion <= fin) {
        items.push({
          empleado: `${reg.empleado.nombre} ${reg.empleado.apellido || ''}`.trim(),
          tipo,
          fechaReincorporacion
        });
      }
    });
  };

  procesarItems(vacaciones, 'Vacaciones');
  procesarItems(reposos, 'Reposo Médico');

  return items.sort((a, b) => a.fechaReincorporacion.localeCompare(b.fechaReincorporacion));
};