const EmpleadoRepository = require('../../../domain/repositories/EmpleadoRepository');
const prisma = require('../prismaClient');
const { toId } = require('../../../shared/ids');

function convertirFechas(data) {
  const nuevoData = { ...data };

  if (nuevoData.fechaNacimiento) {
    nuevoData.fechaNacimiento = new Date(nuevoData.fechaNacimiento);
  }

  if (nuevoData.fechaIngreso) {
    nuevoData.fechaIngreso = new Date(nuevoData.fechaIngreso);
  }

  return nuevoData;
}

class PrismaEmpleadoRepository extends EmpleadoRepository {
  async crear(datosEmpleado) {
    const { departamentoId, cargoId, ...resto } = datosEmpleado;
    const data = convertirFechas(resto);

    return prisma.empleado.create({
      data: {
        ...data,
        departamentoId: toId(departamentoId),
        cargoId: toId(cargoId)
      },
    });
  }

  async editar(id, cambios) {
    const data = convertirFechas({ ...cambios });

    if (data.departamentoId) {
      data.departamentoId = toId(data.departamentoId);
    }

    if (data.cargoId) {
      data.cargoId = toId(data.cargoId);
    }

    try {
      return await prisma.empleado.update({
        where: { id: toId(id) },
        data
      });
    } catch (e) {
      if (e.code === 'P2025') return null;
      throw e;
    }
  }

  async inactivar(id) {
    try {
      return await prisma.empleado.update({
        where: { id: toId(id) },
        data: { estado: 'Inactivo' }
      });
    } catch (e) {
      if (e.code === 'P2025') return null;
      throw e;
    }
  }

  async obtenerPorId(id) {
    return prisma.empleado.findUnique({
      where: { id: toId(id) },
      include: {
        departamento: true,
        cargo: true
      },
    });
  }

  async obtenerPorCedulaExacta(cedula) {
    return prisma.empleado.findUnique({
      where: { cedula },
      include: {
        departamento: true,
        cargo: true
      },
    });
  }

  async listar(criterios = {}, { page = 1, limit = 20 } = {}) {
    const {
      busqueda,
      departamentoId,
      cargoId,
      estado
    } = criterios;

    const where = {};

    if (busqueda) {
      const terminos = busqueda.trim().split(/\s+/).filter(Boolean);
      
      if (terminos.length === 1) {
        where.OR = [
          {
            nombre: {
              contains: terminos[0],
              mode: 'insensitive'
            }
          },
          {
            apellido: {
              contains: terminos[0],
              mode: 'insensitive'
            }
          },
          {
            cedula: {
              contains: terminos[0],
              mode: 'insensitive'
            }
          }
        ];
      } else {
        where.AND = terminos.map((termino) => ({
          OR: [
            {
              nombre: {
                contains: termino,
                mode: 'insensitive'
              }
            },
            {
              apellido: {
                contains: termino,
                mode: 'insensitive'
              }
            },
            {
              cedula: {
                contains: termino,
                mode: 'insensitive'
              }
            }
          ]
        }));
      }
    }

    if (departamentoId) {
      where.departamentoId = toId(departamentoId);
    }

    if (cargoId) {
      where.cargoId = toId(cargoId);
    }

    if (estado) {
      where.estado = estado;
    }

    const [empleados, total] = await Promise.all([
      prisma.empleado.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          id: 'asc'
        },
        include: {
          departamento: true,
          cargo: true
        },
      }),

      prisma.empleado.count({
        where
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: empleados,

      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  async existeCedula(cedula) {
    const doc = await prisma.empleado.findUnique({
      where: { cedula },
      select: { id: true }
    });

    return !!doc;
  }
}

module.exports = PrismaEmpleadoRepository;