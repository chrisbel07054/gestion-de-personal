const { prisma, limpiarBaseDeDatos } = require('./testUtils');
const crearSolicitud = require('../application/use-cases/vacaciones/crearSolicitud');
const listarSolicitudes = require('../application/use-cases/vacaciones/listarSolicitudes');

afterEach(async () => { await limpiarBaseDeDatos(); });
afterAll(async () => { await prisma.$disconnect(); });

test('crear solicitud de vacaciones y listar', async () => {
  const dept = await prisma.departamento.create({ data: { nombre: 'VacDept' } });
  const cargo = await prisma.cargo.create({ data: { nombre: 'VacCargo' } });
  const emp = await prisma.empleado.create({ data: { cedula: '900', nombre: 'Carla', departamentoId: dept.id, cargoId: cargo.id } });
  const rrhh = await prisma.usuario.create({ data: { usuario: 'rrhh_vac', passwordHash: 'x', nombre: 'RRHH', rol: 'RRHH' } });

  const desde = '2099-08-01';
  const hasta = '2099-08-05';
  const sol = await crearSolicitud({ empleadoId: emp.id, desde, hasta, motivo: 'Vacaciones', aprobadoPorId: rrhh.id });
  expect(sol).toHaveProperty('id');
  expect(sol.estado).toBe('Aprobada');
  expect(sol.aprobadoPorId).toBe(rrhh.id);

  const rows = await listarSolicitudes({ empleadoId: emp.id });
  expect(rows.length).toBe(1);
});
