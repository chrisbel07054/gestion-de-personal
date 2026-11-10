const UsuarioRepository = require('../../../domain/repositories/UsuarioRepository');
const prisma = require('../prismaClient');
const { toId } = require('../../../shared/ids');

class PrismaUsuarioRepository extends UsuarioRepository {
  async crear(datos) {
    return prisma.usuario.create({ data: { ...datos, estado: datos.estado || 'Activo' } });
  }

  async editar(id, cambios) {
    try {
      return await prisma.usuario.update({ where: { id: toId(id) }, data: cambios });
    } catch (e) {
      if (e.code === 'P2025') return null;
      throw e;
    }
  }

  async obtenerPorId(id) {
    return prisma.usuario.findUnique({ where: { id: toId(id) } });
  }

  async obtenerPorUsuario(usuario) {
    return prisma.usuario.findUnique({ where: { usuario } });
  }

  async listar() {
    return prisma.usuario.findMany({
      select: { id: true, usuario: true, nombre: true, correo: true, rol: true, estado: true, createdAt: true, updatedAt: true },
    });
  }

  async existeUsuario(usuario, excluirId) {
    const where = excluirId ? { usuario, NOT: { id: toId(excluirId) } } : { usuario };
    const doc = await prisma.usuario.findFirst({ where, select: { id: true } });
    return !!doc;
  }

  async contarAdministradoresActivos() {
    return prisma.usuario.count({ where: { rol: 'ADMINISTRADOR', estado: 'Activo' } });
  }

  async desactivar(id) {
    try {
      return await prisma.usuario.update({ where: { id: toId(id) }, data: { estado: 'Inactivo' } });
    } catch (e) {
      if (e.code === 'P2025') return null;
      throw e;
    }
  }
  async activar(id) {
    try {
      return await prisma.usuario.update({
         where: { id: toId(id) },
         data: { estado: 'Activo' },
      });
    } catch (e) {
      if (e.code === 'P2025') return null;
      throw e;
    }
  }
}

module.exports = PrismaUsuarioRepository;
