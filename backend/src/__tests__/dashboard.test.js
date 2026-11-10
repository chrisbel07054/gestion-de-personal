const { prisma, limpiarBaseDeDatos } = require('./testUtils');
const obtenerMetricas = require('../application/use-cases/dashboard/metrics');

afterEach(async () => {
  await limpiarBaseDeDatos();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('metrics basic counts', async () => {
  const dept = await prisma.departamento.create({
    data: { nombre: 'DashDept' },
  });

  const cargo = await prisma.cargo.create({
    data: { nombre: 'DashCargo' },
  });

  const emp1 = await prisma.empleado.create({
    data: {
      cedula: '900',
      nombre: 'A',
      departamentoId: dept.id,
      cargoId: cargo.id,
    },
  });

  const emp2 = await prisma.empleado.create({
    data: {
      cedula: '901',
      nombre: 'B',
      departamentoId: dept.id,
      cargoId: cargo.id,
    },
  });

  const emp3 = await prisma.empleado.create({
    data: {
      cedula: '902',
      nombre: 'C',
      departamentoId: dept.id,
      cargoId: cargo.id,
    },
  });

  const hoy = new Date().toISOString().slice(0, 10);

  const nombreDia = new Date(`${hoy}T00:00:00Z`)
    .toLocaleDateString('es-ES', {
      weekday: 'long',
      timeZone: 'UTC',
    })
    .toLowerCase();

  await prisma.horario.create({
    data: {
      empleadoId: emp1.id,
      horaEntrada: '09:00',
      horaSalida: '17:00',
      diasLaborales: [nombreDia],
    },
  });

  await prisma.horario.create({
    data: {
      empleadoId: emp2.id,
      horaEntrada: '09:00',
      horaSalida: '17:00',
      diasLaborales: [nombreDia],
    },
  });

  await prisma.horario.create({
    data: {
      empleadoId: emp3.id,
      horaEntrada: '09:00',
      horaSalida: '17:00',
      diasLaborales: [nombreDia],
    },
  });

  await prisma.asistencia.create({
    data: {
      empleadoId: emp1.id,
      fecha: hoy,
      horaEntrada: '08:00',
      estado: 'Puntual',
    },
  });

  await prisma.asistencia.create({
    data: {
      empleadoId: emp2.id,
      fecha: hoy,
      horaEntrada: '09:40',
      estado: 'Tarde',
    },
  });

  await prisma.permiso.create({
    data: {
      empleadoId: emp3.id,
      fecha: hoy,
      tipo: 'Personal',
      estado: 'Pendiente',
    },
  });

  await prisma.vacacion.create({
    data: {
      empleadoId: emp1.id,
      desde: hoy,
      hasta: hoy,
      estado: 'Aprobada',
    },
  });

  const m = await obtenerMetricas();

  expect(m.totalEmpleados).toBe(3);
  expect(m.ausentesHoy).toBe(1);
  expect(m.entradasHoy).toBe(2);
  expect(m.puntualidadCount).toBe(1);
  expect(m.retardosHoy).toBe(0);
  expect(m.tardeHoy).toBe(1);
  expect(m.permisosActivos).toBe(1);
  expect(m.vacacionesActivas).toBe(1);
});