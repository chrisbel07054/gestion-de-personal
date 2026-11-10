const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

function normalizarDia(dia) {
  return String(dia || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function calcularEstadoSinEntrada(fecha, horario, ahora = new Date()) {
  const horaEntrada = horario?.horaEntrada;
  const horaSalida = horario?.horaSalida;

  if (!fecha || !horaEntrada || !horaSalida) {
    return { estado: 'Pendiente', observacion: 'Pendiente de registrar entrada' };
  }

  const inicioTurno = new Date(`${fecha}T${horaEntrada}:00`);
  const finTurno = new Date(`${fecha}T${horaSalida}:00`);

  if (Number.isNaN(inicioTurno.getTime()) || Number.isNaN(finTurno.getTime())) {
    return { estado: 'Pendiente', observacion: 'Pendiente de registrar entrada' };
  }

  if (finTurno <= inicioTurno) finTurno.setDate(finTurno.getDate() + 1);
  if (ahora < inicioTurno) return { estado: 'Programado', observacion: 'Jornada aún no iniciada' };
  if (ahora < finTurno) return { estado: 'Pendiente', observacion: 'Pendiente de registrar entrada' };

  return { estado: 'Ausente', observacion: 'Sin registro de asistencia al finalizar la jornada' };
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

function obtenerEstadoSalida(asistencia, fecha, horario, ahora = new Date()) {
  if (!asistencia?.horaEntrada || asistencia.horaSalida) return null;
  const finJornada = obtenerFinJornada(fecha, horario?.horaEntrada, horario?.horaSalida);
  if (!finJornada || ahora < finJornada) return null;
  return 'No registrada';
}

module.exports.obtenerPorEmpleado = async function obtenerPorEmpleado({ empleadoId, desde, hasta }) {
  const id = toId(empleadoId);
  const empleado = await prisma.empleado.findUnique({
    where: { id },
    include: { departamento: true, cargo: true }
  });

  if (!empleado) {
    const error = new Error('Empleado no encontrado');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const horario = await prisma.horario.findUnique({ where: { empleadoId: id } });
  const where = { empleadoId: id };

  if (desde || hasta) {
    where.fecha = {};
    if (desde) where.fecha.gte = desde;
    if (hasta) where.fecha.lte = hasta;
  }

  const asistencias = await prisma.asistencia.findMany({
    where,
    orderBy: { fecha: 'asc' },
    include: {
      empleado: { include: { departamento: true, cargo: true } },
      registradoPor: { select: { id: true, nombre: true, usuario: true } }
    }
  });

  if (!desde || !hasta || !horario) return asistencias;


  const diasLaborales = (horario.diasLaborales || []).map(normalizarDia);

  const fechaCreacionHorario = horario.createdAt
    ? `${horario.createdAt.getFullYear()}-${String(horario.createdAt.getMonth() + 1).padStart(2, '0')}-${String(horario.createdAt.getDate()).padStart(2, '0')}`
    : null;

  const asistenciasPorFecha = new Map(asistencias.map((a) => [a.fecha, a]));

  const [vacaciones, reposos, permisos] = await Promise.all([
    prisma.vacacion.findMany({
      where: { empleadoId: id, estado: { in: ['Pendiente', 'Aprobada'] }, desde: { lte: hasta }, hasta: { gte: desde } },
      orderBy: { desde: 'asc' }
    }),
    prisma.reposoMedico.findMany({
      where: { empleadoId: id, estado: { in: ['Pendiente', 'Aprobado'] }, fechaInicio: { lte: hasta }, fechaFin: { gte: desde } },
      orderBy: { fechaInicio: 'asc' }
    }),
    prisma.permiso.findMany({
      where: { empleadoId: id, estado: { in: ['Pendiente', 'Aprobado'] }, fecha: { gte: desde, lte: hasta } },
      orderBy: { fecha: 'asc' }
    })
  ]);

  const tieneVacaciones = (fecha) => vacaciones.some((v) => v.desde <= fecha && v.hasta >= fecha);
  const tieneReposo = (fecha) => reposos.some((r) => r.fechaInicio <= fecha && r.fechaFin >= fecha);
  const tienePermiso = (fecha) => permisos.some((p) => p.fecha === fecha);

  const resultado = [];
  const fechaInicio = new Date(`${desde}T00:00:00Z`);
  const fechaFin = new Date(`${hasta}T00:00:00Z`);

  for (let d = new Date(fechaInicio); d <= fechaFin; d.setUTCDate(d.getUTCDate() + 1)) {

    const fecha = d.toISOString().slice(0, 10);
    const nombreDia = normalizarDia(d.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' }));

    if (fechaCreacionHorario && fecha < fechaCreacionHorario) continue;

    if (!diasLaborales.includes(nombreDia)) continue;

    if (tieneVacaciones(fecha)) {
      resultado.push({ id: null, empleadoId: id, fecha, horaEntrada: null, horaSalida: null, estado: 'Vacaciones', observacion: 'Empleado de vacaciones', registradoPorId: null, registradoPor: null, minutosTrabajados: 0, createdAt: null, updatedAt: null, empleado });
      continue;
    }

    if (tieneReposo(fecha)) {
      resultado.push({ id: null, empleadoId: id, fecha, horaEntrada: null, horaSalida: null, estado: 'Reposo médico', observacion: 'Empleado en reposo médico', registradoPorId: null, registradoPor: null, minutosTrabajados: 0, createdAt: null, updatedAt: null, empleado });
      continue;
    }

    if (tienePermiso(fecha)) {
      const permiso = permisos.find((p) => p.fecha === fecha);
      resultado.push({ id: null, empleadoId: id, fecha, horaEntrada: null, horaSalida: null, estado: 'Permiso', observacion: permiso?.motivo || `Permiso: ${permiso?.tipo || 'Registrado'}`, registradoPorId: null, registradoPor: null, minutosTrabajados: 0, createdAt: null, updatedAt: null, empleado });
      continue;
    }

    const asistencia = asistenciasPorFecha.get(fecha);
    if (asistencia) {
      if (asistencia.horaEntrada) {
        resultado.push(asistencia);
      } else {
        const calculado = calcularEstadoSinEntrada(fecha, horario);
        resultado.push({ ...asistencia, estado: calculado.estado, observacion: calculado.observacion });
      }
      continue;
    }

    const calculado = calcularEstadoSinEntrada(fecha, horario);
    resultado.push({ id: null, empleadoId: id, fecha, horaEntrada: null, horaSalida: null, estado: calculado.estado, observacion: calculado.observacion, registradoPorId: null, registradoPor: null, minutosTrabajados: 0, createdAt: null, updatedAt: null, empleado });
  }

  return resultado;
};

module.exports.obtenerPorDia = async function obtenerPorDia({ fecha, departamentoId, nombre, cedula, page = 1, limit = 20 }) {
  const whereEmpleado = { estado: 'Activo' };

  if (departamentoId) whereEmpleado.departamentoId = toId(departamentoId);
  if (nombre) {
    whereEmpleado.OR = [
      { nombre: { contains: nombre, mode: 'insensitive' } },
      { apellido: { contains: nombre, mode: 'insensitive' } }
    ];
  }
  if (cedula) whereEmpleado.cedula = { contains: String(cedula) };

  const empleados = await prisma.empleado.findMany({
    where: whereEmpleado,
    include: { departamento: true, cargo: true },
    orderBy: { nombre: 'asc' }
  });

  const empleadosIds = empleados.map((e) => e.id);

  const [horarios, asistencias, vacaciones, reposos, permisos] = await Promise.all([
    prisma.horario.findMany({ where: { empleadoId: { in: empleadosIds } } }),
    prisma.asistencia.findMany({
      where: { fecha },
      include: {
        empleado: { include: { departamento: true, cargo: true } },
        registradoPor: { select: { id: true, nombre: true, usuario: true } }
      }
    }),
    prisma.vacacion.findMany({
      where: { empleadoId: { in: empleadosIds }, estado: { in: ['Pendiente', 'Aprobada'] }, desde: { lte: fecha }, hasta: { gte: fecha } }
    }),
    prisma.reposoMedico.findMany({
      where: { empleadoId: { in: empleadosIds }, estado: { in: ['Pendiente', 'Aprobado'] }, fechaInicio: { lte: fecha }, fechaFin: { gte: fecha } }
    }),
    prisma.permiso.findMany({
      where: { empleadoId: { in: empleadosIds }, estado: { in: ['Pendiente', 'Aprobado'] }, fecha }
    })
  ]);

  const horariosPorEmpleado = new Map(horarios.map((h) => [h.empleadoId, h]));
  const asistenciasPorEmpleado = new Map(asistencias.map((a) => [a.empleadoId, a]));
  const vacacionesPorEmpleado = new Map(vacaciones.map((v) => [v.empleadoId, v]));
  const repososPorEmpleado = new Map(reposos.map((r) => [r.empleadoId, r]));
  const permisosPorEmpleado = new Map(permisos.map((p) => [p.empleadoId, p]));

  const diasMap = { 0: 'domingo', 1: 'lunes', 2: 'martes', 3: 'miércoles', 4: 'jueves', 5: 'viernes', 6: 'sábado' };
  const fechaObj = new Date(`${fecha}T00:00:00Z`);
  const nombreDiaNormalizado = normalizarDia(diasMap[fechaObj.getUTCDay()]);
  const resultado = [];

  for (const empleado of empleados) {
    
  const horario = horariosPorEmpleado.get(empleado.id);
  if (!horario || horario.vigente === false) continue;

  const fechaCreacionHorario = horario.createdAt
    ? `${horario.createdAt.getFullYear()}-${String(horario.createdAt.getMonth() + 1).padStart(2, '0')}-${String(horario.createdAt.getDate()).padStart(2, '0')}`
    : null;

  if (fechaCreacionHorario && fecha < fechaCreacionHorario) continue;

  const diasLaborales = (horario.diasLaborales || []).map(normalizarDia);
  if (!diasLaborales.includes(nombreDiaNormalizado)) continue;

    if (vacacionesPorEmpleado.has(empleado.id)) {
      resultado.push({ id: null, empleadoId: empleado.id, fecha, horaEntrada: null, horaSalida: null, estado: 'Vacaciones', observacion: 'Empleado de vacaciones', registradoPorId: null, registradoPor: null, minutosTrabajados: 0, createdAt: null, updatedAt: null, empleado });
      continue;
    }

    if (repososPorEmpleado.has(empleado.id)) {
      resultado.push({ id: null, empleadoId: empleado.id, fecha, horaEntrada: null, horaSalida: null, estado: 'Reposo médico', observacion: 'Empleado en reposo médico', registradoPorId: null, registradoPor: null, minutosTrabajados: 0, createdAt: null, updatedAt: null, empleado });
      continue;
    }

    if (permisosPorEmpleado.has(empleado.id)) {
      const permiso = permisosPorEmpleado.get(empleado.id);
      resultado.push({ id: null, empleadoId: empleado.id, fecha, horaEntrada: null, horaSalida: null, estado: 'Permiso', observacion: permiso?.motivo || `Permiso: ${permiso?.tipo || 'Registrado'}`, registradoPorId: null, registradoPor: null, minutosTrabajados: 0, createdAt: null, updatedAt: null, empleado });
      continue;
    }

    const asistencia = asistenciasPorEmpleado.get(empleado.id);
    if (asistencia) {
      if (asistencia.horaEntrada) {
        const estadoSalida = obtenerEstadoSalida(asistencia, fecha, horario);
        resultado.push({ ...asistencia, estadoSalida });
      } else {
        const calculado = calcularEstadoSinEntrada(fecha, horario);
        resultado.push({ ...asistencia, estado: calculado.estado, observacion: calculado.observacion });
      }
      continue;
    }

    const calculado = calcularEstadoSinEntrada(fecha, horario);
    resultado.push({ id: null, empleadoId: empleado.id, fecha, horaEntrada: null, horaSalida: null, estado: calculado.estado, observacion: calculado.observacion, registradoPorId: null, registradoPor: null, minutosTrabajados: 0, createdAt: null, updatedAt: null, empleado });
  }

  const paginaActual = Math.max(1, Number(page) || 1);
  const limite = [10, 20, 50].includes(Number(limit)) ? Number(limit) : 20;
  const total = resultado.length;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const paginaFinal = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaFinal - 1) * limite;
  const items = resultado.slice(inicio, inicio + limite);

  return {
    items,
    meta: { total, page: paginaFinal, limit: limite, totalPages: totalPaginas }
  };
};