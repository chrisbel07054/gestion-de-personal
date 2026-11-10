const { prisma, limpiarBaseDeDatos } = require('./testUtils');
const asignarHorario = require('../application/use-cases/horarios/asignarHorario');
const asignarPorDepartamento = require('../application/use-cases/horarios/asignarPorDepartamento');

afterEach(async () => { await limpiarBaseDeDatos(); });
afterAll(async () => { await prisma.$disconnect(); });

test('asignar horario a empleado y por departamento', async () => {
  const dept = await prisma.departamento.create({ data: { nombre: 'HR' } });
  const cargo = await prisma.cargo.create({ data: { nombre: 'Admin' } });
  const e1 = await prisma.empleado.create({ data: { cedula: '1', nombre: 'E1', departamentoId: dept.id, cargoId: cargo.id } });
  await prisma.empleado.create({ data: { cedula: '2', nombre: 'E2', departamentoId: dept.id, cargoId: cargo.id } });

  const payload = { horaEntrada: '08:00', horaSalida: '16:00', diasLaborales: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] };
  const h1 = await asignarHorario(e1.id, payload);
  expect(h1.horaEntrada).toBe('08:00');

  const res = await asignarPorDepartamento(dept.id, payload);
  expect(res).toHaveProperty('upsertedCount');

  const all = await prisma.horario.findMany();
  expect(all.length).toBeGreaterThanOrEqual(2);
});
