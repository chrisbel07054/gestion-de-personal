const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

const normalizarFecha = (fechaStr) => {
  if (!fechaStr) return '';

  if (fechaStr.includes('/')) {
    const [dia, mes, anio] = fechaStr.split('/');
    return `${anio}-${mes}-${dia}`;
  }

  return fechaStr;
};

module.exports = async function editarVacacion(id, updates) {
  const vacacionId = toId(id);

  const vacacionActual = await prisma.vacacion.findUnique({
    where: {
      id: vacacionId
    }
  });

  if (!vacacionActual) {
    throw {
      status: 404,
      code: 'NOT_FOUND',
      message: 'Vacación no encontrada'
    };
  }

  const desdeRaw =
    updates.desde !== undefined
      ? updates.desde
      : vacacionActual.desde;

  const hastaRaw =
    updates.hasta !== undefined
      ? updates.hasta
      : vacacionActual.hasta;

  const desde = normalizarFecha(desdeRaw);
  const hasta = normalizarFecha(hastaRaw);

  if (!desde || !hasta) {
    throw {
      status: 400,
      code: 'INVALID_DATE',
      message:
        'La fecha de inicio y la fecha de finalización son obligatorias'
    };
  }

  if (desde > hasta) {
    throw {
      status: 400,
      code: 'INVALID_RANGE',
      message:
        'La fecha desde no puede ser mayor que la fecha hasta'
    };
  }

  const empleadoId = vacacionActual.empleadoId;

  // 1. Validar solapamiento con otras VACACIONES
  const overlappingVacacion = await prisma.vacacion.findFirst({
    where: {
      empleadoId,
      id: {
        not: vacacionId
      },
      estado: {
        in: ['Pendiente', 'Aprobada']
      },
      desde: {
        lte: hasta
      },
      hasta: {
        gte: desde
      }
    }
  });

  if (overlappingVacacion) {
    throw {
      status: 400,
      code: 'OVERLAP',
      message:
        'El empleado ya tiene un período de vacaciones que se solapa con las fechas seleccionadas'
    };
  }

  // 2. Validar solapamiento con REPOSOS MÉDICOS
  const overlappingReposo = await prisma.reposoMedico.findFirst({
    where: {
      empleadoId,
      AND: [
        {
          fechaInicio: {
            lte: hasta
          }
        },
        {
          fechaFin: {
            gte: desde
          }
        }
      ]
    }
  });

  if (overlappingReposo) {
    throw {
      status: 400,
      code: 'OVERLAP',
      message:
        'El empleado tiene un reposo médico registrado que se solapa con estas fechas de vacaciones'
    };
  }

  // 3. Validar solapamiento con PERMISOS
  const overlappingPermiso = await prisma.permiso.findFirst({
    where: {
      empleadoId,
      estado: {
        not: 'Rechazado'
      },
      fecha: {
        gte: desde,
        lte: hasta
      }
    }
  });

  if (overlappingPermiso) {
    throw {
      status: 400,
      code: 'OVERLAP',
      message:
        'El empleado tiene un permiso registrado que se solapa con estas fechas de vacaciones'
    };
  }

  try {
    const data = {
      desde,
      hasta
    };

    if (updates.motivo !== undefined) {
      data.motivo = updates.motivo || null;
    }

    return await prisma.vacacion.update({
      where: {
        id: vacacionId
      },
      data
    });
  } catch (e) {
    if (e.code === 'P2025') {
      throw {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Vacación no encontrada'
      };
    }

    throw e;
  }
};