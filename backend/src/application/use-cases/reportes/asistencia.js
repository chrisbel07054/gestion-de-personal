const prisma = require('../../../infrastructure/database/prismaClient');

function obtenerNombreDia(fecha) {
  const [year, month, day] = fecha.split('-').map(Number);
  const fechaObj = new Date(year, month - 1, day);
  const diasMap = { 0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado' };
  return diasMap[fechaObj.getDay()];
}

function normalizarTexto(texto) {
  return String(texto || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function generarFechas(desde, hasta) {
  const fechas = [];
  if (!desde || !hasta) return fechas;
  const [yI, mI, dI] = desde.split('-').map(Number);
  const [yF, mF, dF] = hasta.split('-').map(Number);
  const fechaActual = new Date(yI, mI - 1, dI);
  const fechaFinal = new Date(yF, mF - 1, dF);

  while (fechaActual <= fechaFinal) {
    const year = fechaActual.getFullYear();
    const month = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const day = String(fechaActual.getDate()).padStart(2, '0');
    fechas.push(`${year}-${month}-${day}`);
    fechaActual.setDate(fechaActual.getDate() + 1);
  }
  return fechas;
}

function obtenerFinJornada(fecha, horaEntrada, horaSalida) {
  if (!fecha || !horaEntrada || !horaSalida) return null;
  const [year, month, day] = fecha.split('-').map(Number);
  const [horaInicio, minutoInicio] = String(horaEntrada).split(':').map(Number);
  const [horaFin, minutoFin] = String(horaSalida).split(':').map(Number);
  const inicio = new Date(year, month - 1, day, horaInicio, minutoInicio);
  const fin = new Date(year, month - 1, day, horaFin, minutoFin);

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return null;
  if (fin <= inicio) fin.setDate(fin.getDate() + 1);
  return fin;
}

function obtenerEstadoSalida(asistencia, fecha, horario, ahora) {
  if (!asistencia?.horaEntrada || asistencia.horaSalida) return null;
  const finJornada = obtenerFinJornada(fecha, horario?.horaEntrada, horario?.horaSalida);
  if (!finJornada || ahora < finJornada) return null;
  return 'No registrada';
}

module.exports = async function reporteAsistencia(filter = {}) {
  if (!filter.desde || !filter.hasta) return [];
  const empleadoWhere = { estado: 'Activo' };
  if (filter.empleadoId) empleadoWhere.id = Number(filter.empleadoId);
  if (filter.departamentoId) empleadoWhere.departamentoId = Number(filter.departamentoId);

  const empleados = await prisma.empleado.findMany({
    where: empleadoWhere,
    include: { departamento: true, cargo: true, horario: true },
  });

  if (!empleados.length) return [];

  const fechas = generarFechas(filter.desde, filter.hasta);
  const empleadoIds = empleados.map((e) => e.id);
  const ahora = new Date();

  const [asistencias, vacaciones, reposos, permisos] = await Promise.all([
    prisma.asistencia.findMany({
      where: { empleadoId: { in: empleadoIds }, fecha: { gte: filter.desde, lte: filter.hasta } },
      include: { empleado: { include: { departamento: true, cargo: true, horario: true } } },
    }),
    prisma.vacacion.findMany({
      where: { empleadoId: { in: empleadoIds }, desde: { lte: filter.hasta }, hasta: { gte: filter.desde } },
    }),
    prisma.reposoMedico.findMany({
      where: { empleadoId: { in: empleadoIds }, fechaInicio: { lte: filter.hasta }, fechaFin: { gte: filter.desde } },
    }),
    prisma.permiso.findMany({
      where: { empleadoId: { in: empleadoIds }, fecha: { gte: filter.desde, lte: filter.hasta } },
    }),
  ]);

  const asistenciaMap = new Map();
  asistencias.forEach((asistencia) => {
    asistenciaMap.set(`${asistencia.empleadoId}-${asistencia.fecha}`, asistencia);
  });

  const resultado = [];
  
  for (const empleado of empleados) {
    const horario = empleado.horario;
    if (!horario) continue;

  const diasLaborales = (horario.diasLaborales || []).map(normalizarTexto);

  // Obtener la fecha de creación del horario en formato AAAA-MM-DD.
  const fechaCreacionHorario = horario.createdAt
    ? `${horario.createdAt.getFullYear()}-${String(horario.createdAt.getMonth() + 1).padStart(2, '0')}-${String(horario.createdAt.getDate()).padStart(2, '0')}`
    : null;

  for (const fecha of fechas) {
    // No generar registros anteriores a la creación del horario.
    if (fechaCreacionHorario && fecha < fechaCreacionHorario) continue;

    if (!diasLaborales.includes(obtenerNombreDia(fecha))) continue;

      const tieneVacaciones = vacaciones.some((v) => v.empleadoId === empleado.id && v.desde <= fecha && v.hasta >= fecha);
      if (tieneVacaciones) {
        resultado.push({ empleadoId: empleado.id, fecha, horaEntrada: null, horaSalida: null, estado: 'Vacaciones', empleado });
        continue;
      }

      const tieneReposo = reposos.some((r) => r.empleadoId === empleado.id && r.fechaInicio <= fecha && r.fechaFin >= fecha);
      if (tieneReposo) {
        resultado.push({ empleadoId: empleado.id, fecha, horaEntrada: null, horaSalida: null, estado: 'Reposo', empleado });
        continue;
      }

      const tienePermiso = permisos.some((p) => p.empleadoId === empleado.id && p.fecha === fecha);
      if (tienePermiso) {
        resultado.push({ empleadoId: empleado.id, fecha, horaEntrada: null, horaSalida: null, estado: 'Permiso', empleado });
        continue;
      }

      const asistencia = asistenciaMap.get(`${empleado.id}-${fecha}`);
      if (asistencia) {
        const estadoSalida = obtenerEstadoSalida(asistencia, fecha, horario, ahora);
        resultado.push({ ...asistencia, estadoSalida });
        continue;
      }

      resultado.push({ empleadoId: empleado.id, fecha, horaEntrada: null, horaSalida: null, estado: 'Ausente', empleado });
    }
  }

  return resultado.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
    const nombreA = `${a.empleado?.nombre || ''} ${a.empleado?.apellido || ''}`;
    const nombreB = `${b.empleado?.nombre || ''} ${b.empleado?.apellido || ''}`;
    return nombreA.localeCompare(nombreB);
  });
};