jest.mock('../infrastructure/database/prismaClient', () => ({
  empleado: { findUnique: jest.fn() },
  permiso: { findFirst: jest.fn(), create: jest.fn() },
  reposoMedico: { findFirst: jest.fn(), create: jest.fn() },
  vacacion: { findFirst: jest.fn(), create: jest.fn() },
}));

const prisma = require('../infrastructure/database/prismaClient');
const crearPermiso = require('../application/use-cases/permisos/crear');
const crearReposo = require('../application/use-cases/reposos-medicos/crear');
const crearVacacion = require('../application/use-cases/vacaciones/crearSolicitud');

beforeEach(() => {
  jest.clearAllMocks();
  prisma.empleado.findUnique.mockResolvedValue({ id: 1, estado: 'Activo' });
  prisma.permiso.findFirst.mockResolvedValue(null);
  prisma.reposoMedico.findFirst.mockResolvedValue(null);
  prisma.vacacion.findFirst.mockResolvedValue(null);
  prisma.permiso.create.mockImplementation(async ({ data }) => data);
  prisma.reposoMedico.create.mockImplementation(async ({ data }) => data);
  prisma.vacacion.create.mockImplementation(async ({ data }) => data);
});

test('permiso creado por RRHH queda aprobado y otro permiso queda pendiente', async () => {
  const aprobado = await crearPermiso({ empleadoId: 1, fecha: '2099-01-01', tipo: 'Temporal', aprobadoPorId: 7 });
  const pendiente = await crearPermiso({ empleadoId: 1, fecha: '2099-01-02', tipo: 'Temporal' });

  expect(aprobado).toMatchObject({ estado: 'Aprobado', aprobadoPorId: 7 });
  expect(pendiente).toMatchObject({ estado: 'Pendiente', aprobadoPorId: null });
});

test('reposo creado por RRHH queda aprobado y otro reposo queda pendiente', async () => {
  const aprobado = await crearReposo({ empleadoId: 1, fechaInicio: '2099-02-01', fechaFin: '2099-02-02', aprobadoPorId: 7 });
  const pendiente = await crearReposo({ empleadoId: 1, fechaInicio: '2099-03-01', fechaFin: '2099-03-02' });

  expect(aprobado).toMatchObject({ estado: 'Aprobado', aprobadoPorId: 7 });
  expect(pendiente).toMatchObject({ estado: 'Pendiente', aprobadoPorId: null });
});

test('vacación creada por RRHH queda aprobada y registra quién la aprobó', async () => {
  const vacacion = await crearVacacion({
    empleadoId: 1,
    desde: '2099-04-01',
    hasta: '2099-04-05',
    aprobadoPorId: 7,
  });

  expect(vacacion).toMatchObject({ estado: 'Aprobada', aprobadoPorId: 7 });
});