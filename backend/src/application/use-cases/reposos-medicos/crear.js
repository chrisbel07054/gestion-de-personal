const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

function obtenerFechaHoy() {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

module.exports = async function crearReposoMedico({
  empleadoId,
  fechaInicio,
  fechaFin,
  diagnostico,
  documento,
  aprobadoPorId
}) {
  const empId = toId(empleadoId);

  // Validar empleado
  const emp = await prisma.empleado.findUnique({
    where: { id: empId }
  });

  if (!emp || emp.estado !== 'Activo') {
    throw {
      status: 400,
      code: 'INVALID_EMPLOYEE',
      message: 'Empleado inválido o inactivo'
    };
  }

  // Validar que las fechas existan
  if (!fechaInicio || !fechaFin) {
    throw {
      status: 400,
      code: 'INVALID_DATE',
      message: 'La fecha de inicio y la fecha de finalización son obligatorias'
    };
  }

  // Validar que el reposo no comience antes de hoy
  const fechaHoy = obtenerFechaHoy();

  if (fechaInicio < fechaHoy) {
    throw {
      status: 400,
      code: 'INVALID_START_DATE',
      message: 'La fecha de inicio del reposo no puede ser anterior a hoy'
    };
  }

  // Validar rango de fechas
  if (fechaInicio > fechaFin) {
    throw {
      status: 400,
      code: 'INVALID_RANGE',
      message: 'La fecha de inicio no puede ser posterior a la fecha de finalización'
    };
  }

  // 1. Validar solapamiento con otro reposo médico
  const reposoSolapado = await prisma.reposoMedico.findFirst({
    where: {
      empleadoId: empId,
      AND: [
        { fechaInicio: { lte: fechaFin } },
        { fechaFin: { gte: fechaInicio } }
      ]
    }
  });

  if (reposoSolapado) {
    throw {
      status: 400,
      code: 'OVERLAP',
      message:
        'Ya existe un reposo médico registrado que se solapa con estas fechas'
    };
  }

  // 2. Validar solapamiento con vacaciones
  const vacacionSolapada = await prisma.vacacion.findFirst({
    where: {
      empleadoId: empId,
      estado: { not: 'Rechazada' },
      AND: [
        { desde: { lte: fechaFin } },
        { hasta: { gte: fechaInicio } }
      ]
    }
  });

  if (vacacionSolapada) {
    throw {
      status: 400,
      code: 'OVERLAP',
      message:
        'El empleado se encuentra de vacaciones en ese período de fechas'
    };
  }

  // 3. Validar solapamiento con permisos
  const permisoSolapado = await prisma.permiso.findFirst({
    where: {
      empleadoId: empId,
      estado: { not: 'Rechazado' },
      fecha: {
        gte: fechaInicio,
        lte: fechaFin
      }
    }
  });

  if (permisoSolapado) {
    throw {
      status: 400,
      code: 'OVERLAP',
      message:
        'Existe un permiso registrado que coincide con estas fechas'
    };
  }

  // 4. Crear reposo médico
  return prisma.reposoMedico.create({
    data: {
      empleadoId: empId,
      fechaInicio,
      fechaFin,
      diagnostico: diagnostico || null,
      documento: documento || null,
      estado: aprobadoPorId ? 'Aprobado' : 'Pendiente',
      aprobadoPorId: aprobadoPorId || null
    }
  });
};