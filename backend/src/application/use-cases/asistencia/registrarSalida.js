const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function minutesBetween(a, b) {
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  return ah * 60 + am - (bh * 60 + bm);
}

function obtenerNombreDia() {
  const diasMap = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado' };
  return diasMap[new Date().getDay()];
}

async function verificarExcepcionLaboral(empId, fecha) {
  const [vacacion, reposo, permiso] = await Promise.all([
    prisma.vacacion.findFirst({
      where: { empleadoId: empId, estado: { in: ['Pendiente', 'Aprobada'] }, desde: { lte: fecha }, hasta: { gte: fecha } }
    }),
    prisma.reposoMedico.findFirst({
      where: { empleadoId: empId, estado: { in: ['Pendiente', 'Aprobado'] }, fechaInicio: { lte: fecha }, fechaFin: { gte: fecha } }
    }),
    prisma.permiso.findFirst({
      where: { empleadoId: empId, fecha, estado: { in: ['Pendiente', 'Aprobado'] } }
    })
  ]);

  if (vacacion) throw { status: 400, code: 'ON_VACATION', message: 'El empleado se encuentra de vacaciones para esta fecha' };
  if (reposo) throw { status: 400, code: 'ON_MEDICAL_LEAVE', message: 'El empleado se encuentra en reposo médico para esta fecha' };
  if (permiso) throw { status: 400, code: 'ON_PERMISSION', message: 'El empleado tiene un permiso para esta fecha' };
}

module.exports = async function registrarSalida({ empleadoId, observacion }, registradoPor) {
  const empId = toId(empleadoId);
  const fecha = todayString();
  const hora = nowHHMM();

  const empleado = await prisma.empleado.findUnique({ where: { id: empId } });
  if (!empleado || empleado.estado !== 'Activo') {
    throw { status: 400, code: 'INVALID_EMPLOYEE', message: 'Empleado inválido o inactivo' };
  }

  const horario = await prisma.horario.findUnique({ where: { empleadoId: empId } });
  if (!horario) {
    throw { status: 400, code: 'NO_HORARIO', message: 'No hay horario asignado para el empleado' };
  }

  await verificarExcepcionLaboral(empId, fecha);

  if (!(horario.diasLaborales || []).includes(obtenerNombreDia())) {
    throw { status: 400, code: 'NO_WORK_DAY', message: 'No es día laboral para este empleado' };
  }

  const record = await prisma.asistencia.findUnique({
    where: { empleadoId_fecha: { empleadoId: empId, fecha } }
  });

  if (!record || !record.horaEntrada) {
    throw { status: 400, code: 'NO_ENTRY', message: 'No existe registro de entrada para hoy' };
  }

  if (record.horaSalida) {
    throw { status: 400, code: 'ALREADY_RECORDED', message: 'Salida ya registrada para hoy' };
  }

  const minutos = minutesBetween(hora, record.horaEntrada);
  const minutosTrabajados = minutos > 0 ? minutos : 0;
  const observacionLimpia = observacion && observacion.trim() ? observacion.trim() : null;
  const autorIdObservacion = registradoPor ? toId(registradoPor) : record.registradoPorId;

  const asistenciaActualizada = await prisma.asistencia.update({
    where: { empleadoId_fecha: { empleadoId: empId, fecha } },
    data: {
      horaSalida: hora,
      minutosTrabajados,
      ...(observacionLimpia ? { observacion: observacionLimpia } : {})
    }
  });

  if (observacionLimpia && autorIdObservacion) {
    await prisma.observacion.create({
      data: { empleadoId: empId, texto: observacionLimpia, autorId: autorIdObservacion }
    });
  }

  return asistenciaActualizada;
};