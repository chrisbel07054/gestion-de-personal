const { prisma, limpiarBaseDeDatos } = require('./testUtils');
const registrarEntrada = require('../application/use-cases/asistencia/registrarEntrada');
const registrarSalida = require('../application/use-cases/asistencia/registrarSalida');

afterEach(async () => { await limpiarBaseDeDatos(); });
afterAll(async () => { await prisma.$disconnect(); });

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

test('registrar entrada puntual y salida calcula minutos trabajados', async () => {
  const dept = await prisma.departamento.create({ data: { nombre: 'Dept Test' } });
  const cargo = await prisma.cargo.create({ data: { nombre: 'Dev' } });
  const emp = await prisma.empleado.create({ data: { cedula: '123', nombre: 'Juan', departamentoId: dept.id, cargoId: cargo.id } });
  await prisma.horario.create({ data: { empleadoId: emp.id, horaEntrada: '09:00', horaSalida: '17:00', diasLaborales: DIAS } });

  const entrada = await registrarEntrada({ empleadoId: emp.id, horaEntrada: '08:50' }, null);
  expect(entrada.horaEntrada).toBe('08:50');
  expect(entrada.estado).toBe('Puntual');

  const salida = await registrarSalida({ empleadoId: emp.id, horaSalida: '17:15' }, null);
  expect(salida.horaSalida).toBe('17:15');
  expect(salida.minutosTrabajados).toBeGreaterThan(0);
});

test('no permite doble entrada', async () => {
  const dept = await prisma.departamento.create({ data: { nombre: 'Dept2' } });
  const cargo = await prisma.cargo.create({ data: { nombre: 'Dev2' } });
  const emp = await prisma.empleado.create({ data: { cedula: '456', nombre: 'Ana', departamentoId: dept.id, cargoId: cargo.id } });
  await prisma.horario.create({ data: { empleadoId: emp.id, horaEntrada: '09:00', horaSalida: '17:00', diasLaborales: DIAS } });

  const first = await registrarEntrada({ empleadoId: emp.id, horaEntrada: '09:05' }, null);
  expect(first.estado).toBe('Retardo');

  await expect(registrarEntrada({ empleadoId: emp.id, horaEntrada: '09:10' }, null)).rejects.toMatchObject({ code: 'ALREADY_RECORDED' });
});
