const prisma = require('../../../infrastructure/database/prismaClient');

function obtenerFechaHoy() {
  const ahora = new Date();

  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

module.exports = function buscarPorCedulaUseCase(empleadoRepository) {
  return async function buscarPorCedula(cedula) {
    const empleado = await empleadoRepository.obtenerPorCedulaExacta(cedula);

    if (!empleado) {
      const e = new Error('Empleado no encontrado');
      e.code = 'NOT_FOUND';
      throw e;
    }

    const fechaHoy = obtenerFechaHoy();

    const horario = await prisma.horario.findFirst({
      where: {
        empleadoId: empleado.id,
        vigente: true
      }
    });

    // Vacaciones
    const vacacion = await prisma.vacacion.findFirst({
      where: {
        empleadoId: empleado.id,
        estado: {
          not: 'Rechazada'
        },
        desde: {
          lte: fechaHoy
        },
        hasta: {
          gte: fechaHoy
        }
      }
    });

    // Reposo médico
    const reposo = await prisma.reposoMedico.findFirst({
      where: {
        empleadoId: empleado.id,
        estado: {
          not: 'Rechazado'
        },
        fechaInicio: {
          lte: fechaHoy
        },
        fechaFin: {
          gte: fechaHoy
        }
      }
    });

    // Permiso
    const permiso = await prisma.permiso.findFirst({
      where: {
        empleadoId: empleado.id,
        estado: {
          not: 'Rechazado'
        },
        fecha: fechaHoy
      }
    });

    let excepcion = null;

    if (vacacion) {
      excepcion = {
        tipo: 'Vacaciones',
        fechaInicio: vacacion.desde,
        fechaFin: vacacion.hasta
      };
    } else if (reposo) {
      excepcion = {
        tipo: 'Reposo médico',
        fechaInicio: reposo.fechaInicio,
        fechaFin: reposo.fechaFin
      };
    } else if (permiso) {
      excepcion = {
        tipo: 'Permiso',
        fecha: permiso.fecha,
        fechaFin: permiso.fecha
      };
    }

    return {
      empleadoId: empleado.id,
      foto: empleado.foto,
      nombre: `${empleado.nombre} ${empleado.apellido || ''}`.trim(),
      cedula: empleado.cedula,
      cargo: empleado.cargo ? empleado.cargo.nombre : null,
      departamento: empleado.departamento
        ? empleado.departamento.nombre
        : null,

      horario: horario
        ? {
            horaEntrada: horario.horaEntrada,
            horaSalida: horario.horaSalida,
            diasLaborales: horario.diasLaborales
          }
        : null,

      excepcion,

      puedeRegistrar: !excepcion
    };
  };
};