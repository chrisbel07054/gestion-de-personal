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

const obtenerFechaHoy = () => {
  const hoy = new Date();

  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};

module.exports = async function crearSolicitudVacaciones({
  empleadoId,
  desde: desdeRaw,
  hasta: hastaRaw,
  motivo,
  aprobadoPorId
}) {
  const empId = toId(empleadoId);

  const desde = normalizarFecha(desdeRaw);
  const hasta = normalizarFecha(hastaRaw);

  const emp = await prisma.empleado.findUnique({
    where: {
      id: empId
    }
  });

  if (!emp || emp.estado !== 'Activo') {
    throw {
      status: 400,
      code: 'INVALID_EMPLOYEE',
      message: 'Empleado inválido o inactivo'
    };
  }

  if (!desde || !hasta) {
    throw {
      status: 400,
      code: 'INVALID_DATE',
      message: 'La fecha de inicio y la fecha de finalización son obligatorias'
    };
  }

  /*
   * Solo se restringen las fechas al crear.
   * Al editar se permite modificar registros históricos.
   */
  const fechaHoy = obtenerFechaHoy();

  if (desde < fechaHoy) {
    throw {
      status: 400,
      code: 'INVALID_START_DATE',
      message: 'La fecha de inicio de las vacaciones no puede ser anterior a hoy'
    };
  }

  if (desde > hasta) {
    throw {
      status: 400,
      code: 'INVALID_RANGE',
      message: 'La fecha desde no puede ser mayor que la fecha hasta'
    };
  }

  // 1. Validar solapamiento con otras VACACIONES
  const overlappingVacacion = await prisma.vacacion.findFirst({
    where: {
      empleadoId: empId,
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
      empleadoId: empId,
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
      empleadoId: empId,
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

  return prisma.vacacion.create({
    data: {
      empleadoId: empId,
      desde,
      hasta,
      motivo: motivo || null,
      estado: 'Aprobada',
      aprobadoPorId: aprobadoPorId || null
    }
  });
};