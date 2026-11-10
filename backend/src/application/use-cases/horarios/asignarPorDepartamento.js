const prisma = require('../../../infrastructure/database/prismaClient');
const { toId } = require('../../../shared/ids');
const verificarDisponibilidad = require('./verificarDisponibilidad');


module.exports = async function asignarPorDepartamento(departamentoId, payload) {

  const depId = toId(departamentoId);

  const empleados = await prisma.empleado.findMany({
    where: {
      departamentoId: depId,
      estado: 'Activo'
    },
    select: {
      id: true
    }
  });

  if (!empleados.length) {
    throw {
      status: 404,
      code: 'NOT_FOUND',
      message: 'No hay empleados activos en el departamento'
    };
  }


  const fechaActual = new Date().toISOString().split('T')[0];


  const disponibles = [];

  for (const empleado of empleados) {

    const estado = await verificarDisponibilidad(
      empleado.id,
      fechaActual
    );

    if (estado.disponible) {
      disponibles.push(empleado);
    }
  }


  if (!disponibles.length) {
    throw {
      status: 400,
      code: 'NO_AVAILABLE_EMPLOYEES',
      message: 'No hay empleados disponibles para asignar horario'
    };
  }

  const resultados = await prisma.$transaction(
    disponibles.map((e) =>
      prisma.horario.upsert({
        where: { empleadoId: e.id },
        update: {
          ...payload,
          vigente: true
        },
        create: {
          ...payload,
          empleadoId: e.id,
          vigente: true
        },
      })
    )
  );

  return {
    matchedCount: resultados.length,
    upsertedCount: resultados.length
  };
};