const CatalogoRepository = require('../../../domain/repositories/CatalogoRepository');
const prisma = require('../prismaClient');
const { toId } = require('../../../shared/ids');

// Implementación Prisma genérica: recibe el nombre del modelo Prisma
// ('empleado' para el conteo de asociados) y el delegate del catálogo
// ('departamento' o 'cargo'), más el nombre del campo FK en Empleado.
class PrismaCatalogoRepository extends CatalogoRepository {
  constructor(delegateName, campoEnEmpleado) {
    super();
    this.delegate = prisma[delegateName]; // prisma.departamento | prisma.cargo
    this.campoEnEmpleado = campoEnEmpleado; // 'departamentoId' | 'cargoId'
  }

  async listar() {
    return this.delegate.findMany({ orderBy: { id: 'asc' } });
  }

  async obtenerPorId(id) {
    return this.delegate.findUnique({ where: { id: toId(id) } });
  }

  async existeNombre(nombre, excluirId) {
    const where = excluirId
      ? { nombre: { equals: nombre, mode: 'insensitive' }, NOT: { id: toId(excluirId) } }
      : { nombre: { equals: nombre, mode: 'insensitive' } };
    const doc = await this.delegate.findFirst({ where, select: { id: true } });
    return !!doc;
  }

  async crear(datos) {
    return this.delegate.create({ data: datos });
  }

  async editar(id, cambios) {
    try {
      return await this.delegate.update({ where: { id: toId(id) }, data: cambios });
    } catch (e) {
      if (e.code === 'P2025') return null;
      throw e;
    }
  }

  async inactivar(id) {
    return this.delegate.update({ where: { id: toId(id) }, data: { estado: 'Inactivo' } });
  }

  async activar(id) {
    return this.delegate.update({ where: { id: toId(id) }, data: { estado: 'Activo' } });
  }

  async contarEmpleadosActivosAsociados(id) {
    return prisma.empleado.count({ where: { [this.campoEnEmpleado]: toId(id), estado: 'Activo' } });
  }
}

module.exports = PrismaCatalogoRepository;
