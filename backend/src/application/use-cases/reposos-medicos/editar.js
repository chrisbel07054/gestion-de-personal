const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');

module.exports = async function editarReposo(id, updates) {
  try {
    const reposoId = toId(id);

    // 1. Buscar el reposo existente
    const reposoActual = await prisma.reposoMedico.findUnique({
      where: { id: reposoId }
    });

    if (!reposoActual) {
      throw {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Reposo no encontrado'
      };
    }

    // 2. Determinar las fechas definitivas
    const nuevaFechaInicio =
      updates.fechaInicio ?? reposoActual.fechaInicio;

    const nuevaFechaFin =
      updates.fechaFin ?? reposoActual.fechaFin;

    // 3. Validar que existan ambas fechas
    if (!nuevaFechaInicio || !nuevaFechaFin) {
      throw {
        status: 400,
        code: 'INVALID_DATE',
        message:
          'La fecha de inicio y la fecha de finalización son obligatorias'
      };
    }

    // 4. Validar que el rango sea correcto
    if (nuevaFechaInicio > nuevaFechaFin) {
      throw {
        status: 400,
        code: 'INVALID_RANGE',
        message:
          'La fecha de inicio no puede ser posterior a la fecha de finalización'
      };
    }

    // 5. Validar solapamiento con OTROS reposos médicos
    const reposoSolapado = await prisma.reposoMedico.findFirst({
      where: {
        empleadoId: reposoActual.empleadoId,
        id: {
          not: reposoId
        },
        AND: [
          {
            fechaInicio: {
              lte: nuevaFechaFin
            }
          },
          {
            fechaFin: {
              gte: nuevaFechaInicio
            }
          }
        ]
      }
    });

    if (reposoSolapado) {
      throw {
        status: 400,
        code: 'OVERLAP',
        message:
          'Ya existe otro reposo médico registrado que se solapa con estas fechas'
      };
    }

    // 6. Validar solapamiento con vacaciones
    const vacacionSolapada = await prisma.vacacion.findFirst({
      where: {
        empleadoId: reposoActual.empleadoId,
        estado: {
          not: 'Rechazada'
        },
        AND: [
          {
            desde: {
              lte: nuevaFechaFin
            }
          },
          {
            hasta: {
              gte: nuevaFechaInicio
            }
          }
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

    // 7. Validar solapamiento con permisos
    const permisoSolapado = await prisma.permiso.findFirst({
      where: {
        empleadoId: reposoActual.empleadoId,
        estado: {
          not: 'Rechazado'
        },
        fecha: {
          gte: nuevaFechaInicio,
          lte: nuevaFechaFin
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

    // 8. Construir únicamente los campos que se pueden modificar
    const data = {
      fechaInicio: nuevaFechaInicio,
      fechaFin: nuevaFechaFin
    };

    if (updates.diagnostico !== undefined) {
      data.diagnostico = updates.diagnostico;
    }

    if (updates.documento !== undefined) {
      data.documento = updates.documento;
    }

    // 9. Actualizar el reposo
    return await prisma.reposoMedico.update({
      where: {
        id: reposoId
      },
      data
    });

  } catch (e) {
    if (e.code === 'P2025') {
      throw {
        status: 404,
        code: 'NOT_FOUND',
        message: 'Reposo no encontrado'
      };
    }

    throw e;
  }
};