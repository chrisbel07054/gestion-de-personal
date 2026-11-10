require('dotenv').config();
const prisma = require('../infrastructure/database/prismaClient');

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada. Usa .env para configurarla.');
  }

  const admin = await prisma.usuario.findUnique({ where: { usuario: 'admin' } });
  if (!admin) {
    throw new Error('No se encontró el usuario admin. Ejecuta primero scripts/createAdmin.js o src/scripts/seed-admin.js');
  }

  let departamento = await prisma.departamento.findUnique({ where: { nombre: 'Tecnología' } });
  if (!departamento) {
    departamento = await prisma.departamento.create({
      data: {
        nombre: 'Tecnología',
        descripcion: 'Desarrollo y operaciones',
        responsable: 'Jefe Tech',
      },
    });
    console.log('Departamento creado: Tecnología');
  } else {
    console.log('Departamento existente: Tecnología');
  }

  let cargo = await prisma.cargo.findUnique({ where: { nombre: 'Desarrollador' } });
  if (!cargo) {
    cargo = await prisma.cargo.create({
      data: {
        nombre: 'Desarrollador',
        descripcion: 'Desarrollador de software',
      },
    });
    console.log('Cargo creado: Desarrollador');
  } else {
    console.log('Cargo existente: Desarrollador');
  }

  let empleado = await prisma.empleado.findUnique({ where: { cedula: 'V-12345678' } });
  if (!empleado) {
    empleado = await prisma.empleado.create({
      data: {
        cedula: 'V-12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        departamentoId: departamento.id,
        cargoId: cargo.id,
        fechaIngreso: new Date(),
        estado: 'Activo',
      },
    });
    console.log('Empleado creado: Juan Pérez');
  } else {
    console.log('Empleado existente: Juan Pérez');
  }

  let horario = await prisma.horario.findUnique({ where: { empleadoId: empleado.id } });
  if (!horario) {
    horario = await prisma.horario.create({
      data: {
        empleadoId: empleado.id,
        horaEntrada: '08:00',
        horaSalida: '17:00',
        diasLaborales: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        diasLibres: ['Sábado', 'Domingo'],
        vigente: true,
      },
    });
    console.log('Horario creado para Juan Pérez');
  } else {
    console.log('Horario existente para Juan Pérez');
  }

  const hoy = new Date();
  const fechaHoy = formatDate(hoy);

  let asistencia = await prisma.asistencia.findUnique({
    where: { empleadoId_fecha: { empleadoId: empleado.id, fecha: fechaHoy } },
  });
  if (!asistencia) {
    asistencia = await prisma.asistencia.create({
      data: {
        empleadoId: empleado.id,
        fecha: fechaHoy,
        horaEntrada: '08:05',
        horaSalida: '17:02',
        estado: 'Puntual',
        registradoPorId: admin.id,
      },
    });
    console.log('Asistencia creada para hoy');
  } else {
    console.log('Asistencia existente para hoy');
  }

  const vacacionDesde = formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 7));
  const vacacionHasta = formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 14));
  let vacacion = await prisma.vacacion.findFirst({
    where: { empleadoId: empleado.id, desde: vacacionDesde, hasta: vacacionHasta },
  });
  if (!vacacion) {
    vacacion = await prisma.vacacion.create({
      data: {
        empleadoId: empleado.id,
        desde: vacacionDesde,
        hasta: vacacionHasta,
        motivo: 'Vacaciones de prueba',
        estado: 'Programada',
        aprobadoPorId: admin.id,
      },
    });
    console.log('Vacación programada creada');
  } else {
    console.log('Vacación existente');
  }

  const reposoFechaInicio = formatDate(hoy);
  const reposoFechaFin = formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 5));
  let reposo = await prisma.reposoMedico.findFirst({
    where: {
      empleadoId: empleado.id,
      fechaInicio: reposoFechaInicio,
      fechaFin: reposoFechaFin,
    },
  });
  if (!reposo) {
    reposo = await prisma.reposoMedico.create({
      data: {
        empleadoId: empleado.id,
        fechaInicio: reposoFechaInicio,
        fechaFin: reposoFechaFin,
        tipo: 'OTORGADO',
        dias: 5,
        motivo: 'Reposo médico de ejemplo',
        diagnostico: 'Reposo generado por seed',
        estado: 'Pendiente',
        aprobadoPorId: admin.id,
      },
    });
    console.log('Reposo creado');
  } else {
    console.log('Reposo existente');
  }

  let observacion = await prisma.observacion.findFirst({
    where: {
      empleadoId: empleado.id,
      texto: 'Observación de ejemplo creada por seed',
    },
  });
  if (!observacion) {
    observacion = await prisma.observacion.create({
      data: {
        empleadoId: empleado.id,
        texto: 'Observación de ejemplo creada por seed',
        fecha: new Date(),
        autorId: admin.id,
      },
    });
    console.log('Observación creada');
  } else {
    console.log('Observación existente');
  }

  console.log('Seed de datos de ejemplo completado.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
