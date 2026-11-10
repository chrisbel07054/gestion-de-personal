const { prisma, limpiarBaseDeDatos } = require('./testUtils');
const crearPermiso = require('../application/use-cases/permisos/crear');
const listarPermisos = require('../application/use-cases/permisos/listar');

afterEach(async () => { await limpiarBaseDeDatos(); });
afterAll(async () => { await prisma.$disconnect(); });

test('crear permiso y listar', async () => {
  const dept = await prisma.departamento.create({ data: { nombre: 'PermDept' } });
  const cargo = await prisma.cargo.create({ data: { nombre: 'PermCargo' } });
  const emp = await prisma.empleado.create({ data: { cedula: '800', nombre: 'Sofia', departamentoId: dept.id, cargoId: cargo.id } });
  const rrhh = await prisma.usuario.create({ data: { usuario: 'rrhh_perm', passwordHash: 'x', nombre: 'RRHH', rol: 'RRHH' } });

  const fecha = '2099-07-30';
  const doc = await crearPermiso({ empleadoId: emp.id, fecha, tipo: 'Temporal', motivo: 'Asunto personal', aprobadoPorId: rrhh.id });
  expect(doc).toHaveProperty('id');
  expect(doc.estado).toBe('Aprobado');
  expect(doc.aprobadoPorId).toBe(rrhh.id);

  const pendiente = await crearPermiso({ empleadoId: emp.id, fecha: '2099-07-31', tipo: 'Temporal' });
  expect(pendiente.estado).toBe('Pendiente');

  const rows = await listarPermisos({ empleadoId: emp.id });
  expect(rows.length).toBe(1);
});
