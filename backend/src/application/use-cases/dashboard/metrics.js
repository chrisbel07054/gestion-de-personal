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

module.exports = async function obtenerMetricas() {
  const hoy = hoyString();
  const nombreDia = obtenerNombreDia(hoy);

  const [
    totalEmpleados,
    entradasHoy,
    puntualidadCount,
    retardosHoy,
    tardeHoy,
    vacacionesActivas,
    repososActivos,
    permisosActivos,
    empleadosActivos,
    registrosHoy,
    vacacionesHoy,
    repososHoy,
    permisosHoy
  ] = await Promise.all([
    prisma.empleado.count({ where: { estado: 'Activo' } }),
    prisma.asistencia.count({ where: { fecha: hoy, horaEntrada: { not: null } } }),
    prisma.asistencia.count({ where: { fecha: hoy, estado: 'Puntual' } }),
    prisma.asistencia.count({ where: { fecha: hoy, estado: 'Retardo' } }),
    prisma.asistencia.count({ where: { fecha: hoy, estado: 'Tarde' } }),
    prisma.vacacion.count({ where: { desde: { lte: hoy }, hasta: { gte: hoy } } }),
    prisma.reposoMedico.count({ where: { fechaInicio: { lte: hoy }, fechaFin: { gte: hoy } } }),
    prisma.permiso.count({ where: { fecha: hoy } }),
    prisma.empleado.findMany({ where: { estado: 'Activo' }, include: { horario: true } }),
    prisma.asistencia.findMany({ where: { fecha: hoy }, select: { empleadoId: true } }),
    prisma.vacacion.findMany({ where: { desde: { lte: hoy }, hasta: { gte: hoy } }, select: { empleadoId: true } }),
    prisma.reposoMedico.findMany({ where: { fechaInicio: { lte: hoy }, fechaFin: { gte: hoy } }, select: { empleadoId: true } }),
    prisma.permiso.findMany({ where: { fecha: hoy }, select: { empleadoId: true } })
  ]);

  const empleadosDiaLaboral = empleadosActivos.filter((e) => {
    if (!e.horario?.diasLaborales) return false;
    return e.horario.diasLaborales.map(normalizarTexto).includes(nombreDia);
  });

  const idsConRegistro = new Set(registrosHoy.map((r) => r.empleadoId));
  const idsVacaciones = new Set(vacacionesHoy.map((r) => r.empleadoId));
  const idsReposos = new Set(repososHoy.map((r) => r.empleadoId));
  const idsPermisos = new Set(permisosHoy.map((r) => r.empleadoId));

  const ahora = new Date();
  const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

  const ausentesHoy = empleadosDiaLaboral.filter((empleado) => {
    const { id, horario } = empleado;
    if (!horario?.horaEntrada || horaActual < horario.horaEntrada) return false;

    const tieneExcepcion = idsVacaciones.has(id) || idsReposos.has(id) || idsPermisos.has(id);
    return !tieneExcepcion && !idsConRegistro.has(id);
  }).length;

  const presentesHoy = puntualidadCount + retardosHoy + tardeHoy;
  const puntualidadRate = entradasHoy > 0 ? Math.round((puntualidadCount / entradasHoy) * 100) : null;

  return {
    fecha: hoy,
    totalEmpleados,
    ausentesHoy,
    entradasHoy,
    presentesHoy,
    puntualidadCount,
    puntualidadRate,
    retardosHoy,
    tardeHoy,
    tardanzas: retardosHoy + tardeHoy,
    vacacionesActivas,
    repososActivos,
    permisosActivos
  };
};