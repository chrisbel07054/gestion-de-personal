const prisma = require('../../../infrastructure/database/prismaClient');

async function verificarDisponibilidad(empleadoId, fecha) {

  const vacaciones = await prisma.vacacion.findFirst({
    where: {
      empleadoId,
      estado: "Aprobada",
      desde: {
        lte: fecha
      },
      hasta: {
        gte: fecha
      }
    }
  });

  if (vacaciones) {
    return {
      disponible: false,
      motivo: "Vacaciones"
    };
  }

  const reposo = await prisma.reposoMedico.findFirst({
    where: {
      empleadoId,
      estado: "Aprobado",
      fechaInicio: {
        lte: fecha
      },
      fechaFin: {
        gte: fecha
      }
    }
  });

  if (reposo) {
    return {
      disponible: false,
      motivo: "Reposo médico"
    };
  }

  const permiso = await prisma.permiso.findFirst({
    where: {
      empleadoId,
      estado: "Aprobado",
      fecha
    }
  });

  if (permiso) {
    return {
      disponible: false,
      motivo: "Permiso"
    };
  }

  return {
    disponible: true,
    motivo: null
  };
}

module.exports = verificarDisponibilidad;