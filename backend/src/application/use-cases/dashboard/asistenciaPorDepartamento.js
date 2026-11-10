const prisma = require('../../../infrastructure/database/prismaClient');

const hoyString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const normalizarTexto = (texto) =>
  String(texto || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const obtenerNombreDia = (fecha) => {
  const [year, month, day] = fecha.split('-').map(Number);
  const diasMap = { 0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado' };
  return diasMap[new Date(year, month - 1, day).getDay()];
};

module.exports = async function asistenciaPorDepartamento({ fecha, desde, hasta } = {}) {
  const targetDate = fecha || hoyString();

  if (desde || hasta) {
    const where = {};
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = desde;
      if (hasta) where.fecha.lte = hasta;
    }

    const rows = await prisma.asistencia.findMany({
      where,
      include: { empleado: { include: { departamento: true } } }
    });

    const map = new Map();
    rows.forEach((r) => {
      const dep = r.empleado?.departamento?.nombre || 'Sin departamento';
      if (!map.has(dep)) map.set(dep, { departamento: dep, presentes: 0, ausentes: 0 });
      if (['Puntual', 'Retardo', 'Tarde'].includes(r.estado)) {
        map.get(dep).presentes++;
      }
    });

    return Array.from(map.values());
  }

  const nombreDia = obtenerNombreDia(targetDate);

  const [empleados, asistencias, vacaciones, reposos, permisos] = await Promise.all([
    prisma.empleado.findMany({
      where: { estado: 'Activo' },
      include: { departamento: true, horario: true }
    }),
    prisma.asistencia.findMany({ where: { fecha: targetDate }, select: { empleadoId: true, estado: true } }),
    prisma.vacacion.findMany({ where: { desde: { lte: targetDate }, hasta: { gte: targetDate } }, select: { empleadoId: true } }),
    prisma.reposoMedico.findMany({ where: { fechaInicio: { lte: targetDate }, fechaFin: { gte: targetDate } }, select: { empleadoId: true } }),
    prisma.permiso.findMany({ where: { fecha: targetDate }, select: { empleadoId: true } })
  ]);

  const asistenciaPorEmpleado = new Map(asistencias.map((a) => [a.empleadoId, a]));
  const empleadosVacaciones = new Set(vacaciones.map((v) => v.empleadoId));
  const empleadosReposo = new Set(reposos.map((r) => r.empleadoId));
  const empleadosPermiso = new Set(permisos.map((p) => p.empleadoId));

  const map = new Map();

  empleados.forEach((empleado) => {
    if (!empleado.horario) return;

    const diasLaborales = (empleado.horario.diasLaborales || []).map(normalizarTexto);
    if (!diasLaborales.includes(nombreDia)) return;

    if (
      empleadosVacaciones.has(empleado.id) ||
      empleadosReposo.has(empleado.id) ||
      empleadosPermiso.has(empleado.id)
    ) {
      return;
    }

    const departamento = empleado.departamento?.nombre || 'Sin departamento';
    if (!map.has(departamento)) {
      map.set(departamento, { departamento, presentes: 0, ausentes: 0 });
    }

    const estadistica = map.get(departamento);
    const asistencia = asistenciaPorEmpleado.get(empleado.id);

    if (asistencia && ['Puntual', 'Retardo', 'Tarde'].includes(asistencia.estado)) {
      estadistica.presentes++;
    } else {
      estadistica.ausentes++;
    }
  });

  return Array.from(map.values());
};