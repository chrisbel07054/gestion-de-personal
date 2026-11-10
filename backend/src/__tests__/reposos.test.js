const { prisma, limpiarBaseDeDatos } = require('./testUtils');
const crearReposo = require('../application/use-cases/reposos-medicos/crear');
const listarReposos = require('../application/use-cases/reposos-medicos/listar');
const finalizarReposo = require('../application/use-cases/reposos-medicos/finalizar');

afterEach(async () => { await limpiarBaseDeDatos(); });
afterAll(async () => { await prisma.$disconnect(); });

test('crear reposo medico y listar', async () => {
  const dept = await prisma.departamento.create({ data: { nombre: 'MedDept' } });
  const cargo = await prisma.cargo.create({ data: { nombre: 'MedCargo' } });
  const emp = await prisma.empleado.create({ data: { cedula: '700', nombre: 'Luis', departamentoId: dept.id, cargoId: cargo.id } });
  const rrhh = await prisma.usuario.create({ data: { usuario: 'rrhh_reposo', passwordHash: 'x', nombre: 'RRHH', rol: 'RRHH' } });

  const desde = '2099-07-20';
  const hasta = '2099-07-22';
  const doc = await crearReposo({ empleadoId: emp.id, fechaInicio: desde, fechaFin: hasta, diagnostico: 'Gripe', aprobadoPorId: rrhh.id });
  expect(doc).toHaveProperty('id');
  expect(doc.estado).toBe('Aprobado');
  expect(doc.aprobadoPorId).toBe(rrhh.id);

  const rows = await listarReposos({ empleadoId: emp.id });
  expect(rows.length).toBe(1);
});

test('finalizar reposo marca aprobado', async () => {
  const dept = await prisma.departamento.create({ data: { nombre: 'MedDept2' } });
  const cargo = await prisma.cargo.create({ data: { nombre: 'MedCargo2' } });
  const emp = await prisma.empleado.create({ data: { cedula: '701', nombre: 'Ana', departamentoId: dept.id, cargoId: cargo.id } });
  const aprobador = await prisma.usuario.create({ data: { usuario: 'aprobador1', passwordHash: 'x', nombre: 'Aprobador', rol: 'RRHH' } });

  const doc = await crearReposo({ empleadoId: emp.id, fechaInicio: '2099-07-25', fechaFin: '2099-07-26', diagnostico: 'Gripe' });
  expect(doc).toHaveProperty('id');
  expect(doc.estado).toBe('Pendiente');

  const doc2 = await finalizarReposo(doc.id, aprobador.id);
  expect(doc2.estado).toBe('Aprobado');
  expect(doc2.aprobadoPorId).toBe(aprobador.id);
});
