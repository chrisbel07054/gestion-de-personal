const prisma = require('../infrastructure/database/prismaClient');
const PrismaCatalogoRepository = require('../infrastructure/database/repositories/PrismaCatalogoRepository');
const activarItemCatalogoUseCase = require('../application/use-cases/catalogo/activarItemCatalogo');

describe('catalogos', () => {
  afterEach(async () => {
    await prisma.empleado.deleteMany({});
    await prisma.departamento.deleteMany({});
    await prisma.cargo.deleteMany({});
  });

  test('reactiva un departamento inactivo', async () => {
    const repo = new PrismaCatalogoRepository('departamento', 'departamentoId');
    const item = await prisma.departamento.create({
      data: { nombre: 'Dept Reactivar', estado: 'Inactivo' },
    });

    const activar = activarItemCatalogoUseCase(repo, 'Departamento');
    const actualizado = await activar(item.id);

    expect(actualizado.estado).toBe('Activo');
  });

  test('listar empleados devuelve nombre de departamento y cargo', async () => {
    const departamento = await prisma.departamento.create({ data: { nombre: 'RRHH' } });
    const cargo = await prisma.cargo.create({ data: { nombre: 'Analista' } });

    await prisma.empleado.create({
      data: {
        cedula: '12345678',
        nombre: 'Ana',
        apellido: 'Pérez',
        departamentoId: departamento.id,
        cargoId: cargo.id,
      },
    });

    const repo = new PrismaCatalogoRepository('departamento', 'departamentoId');
    const empleados = await repo.listar();
    expect(empleados).toEqual(expect.any(Array));

    const empleadoRepo = require('../infrastructure/database/repositories/PrismaEmpleadoRepository');
    const empleadoService = new empleadoRepo();
    const rows = await empleadoService.listar();

    expect(rows[0].departamento.nombre).toBe('RRHH');
    expect(rows[0].cargo.nombre).toBe('Analista');
  });
});
