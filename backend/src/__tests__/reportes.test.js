const { prisma, limpiarBaseDeDatos } = require('./testUtils');
const exportXlsx = require('../application/use-cases/reportes/exportXlsx');
const exportPdf = require('../application/use-cases/reportes/exportPdf');

afterEach(async () => { await limpiarBaseDeDatos(); });
afterAll(async () => { await prisma.$disconnect(); });

test('export xlsx and pdf buffers', async () => {
  const dept = await prisma.departamento.create({ data: { nombre: 'RepDept' } });
  const cargo = await prisma.cargo.create({ data: { nombre: 'RepCargo' } });
  const emp = await prisma.empleado.create({ data: { cedula: '1000', nombre: 'R', departamentoId: dept.id, cargoId: cargo.id } });

  const hoy = new Date().toISOString().slice(0, 10);
  await prisma.asistencia.create({ data: { empleadoId: emp.id, fecha: hoy, horaEntrada: '08:00', estado: 'Puntual' } });

  const xbuf = await exportXlsx({ tipo: 'asistencia', filter: { desde: hoy, hasta: hoy } });
  expect(Buffer.isBuffer(xbuf) || xbuf instanceof Uint8Array).toBe(true);

  const pbuf = await exportPdf({ tipo: 'asistencia', filter: { desde: hoy, hasta: hoy } });
  expect(Buffer.isBuffer(pbuf)).toBe(true);
});
