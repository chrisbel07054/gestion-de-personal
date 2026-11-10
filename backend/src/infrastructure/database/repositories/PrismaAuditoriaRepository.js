const AuditoriaRepository = require('../../../domain/repositories/AuditoriaRepository');
const prisma = require('../prismaClient');
const { toId } = require('../../../shared/ids');

class PrismaAuditoriaRepository extends AuditoriaRepository {
  async registrar(evento) {
    return prisma.auditoria.create({
      data: {
        ...evento,
        usuarioId: evento.usuarioId
          ? toId(evento.usuarioId)
          : null,
        entidadId: evento.entidadId
          ? toId(evento.entidadId)
          : null,
      },
    });
  }

  async listar(
    criterios = {},
    { page = 1, limit = 20 } = {}
  ) {
    const {
      usuarioId,
      entidad,
      desde,
      hasta,
    } = criterios;

    const pagina = Math.max(1, Number(page) || 1);
    const limite = Math.max(1, Number(limit) || 20);

    const where = {};

    if (usuarioId) {
      where.usuarioId = toId(usuarioId);
    }

    if (entidad) {
      where.entidad = entidad;
    }

    if (desde || hasta) {
      where.fecha = {};

      if (desde) {
        where.fecha.gte = new Date(`${desde}T00:00:00`);
      }

      if (hasta) {
        where.fecha.lte = new Date(`${hasta}T23:59:59.999`);
      }
    }

    const [items, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,

        include: {
          usuario: {
            select: {
              id: true,
              usuario: true,
              nombre: true,
            },
          },
        },

        orderBy: {
          fecha: 'desc',
        },

        skip: (pagina - 1) * limite,
        take: limite,
      }),

      prisma.auditoria.count({
        where,
      }),
    ]);

    return {
      items,
      total,
      page: pagina,
      limit: limite,
      totalPaginas: Math.max(
        1,
        Math.ceil(total / limite)
      ),
    };
  }
}

module.exports = PrismaAuditoriaRepository;