const PrismaAuditoriaRepository = require('../../infrastructure/database/repositories/PrismaAuditoriaRepository');
const registrarEventoUseCase = require('../../application/use-cases/auditoria/registrarEvento');
const prisma = require('../../infrastructure/database/prismaClient');

const auditoriaRepository = new PrismaAuditoriaRepository();
const registrarEvento = registrarEventoUseCase(auditoriaRepository);

// Mapeo de rutas API a nombres de entidades
const NOMBRES_ENTIDAD = {
  '/api/usuarios': 'Usuario',
  '/api/departamentos': 'Departamento',
  '/api/cargos': 'Cargo',
  '/api/empleados': 'Empleado',
  '/api/horarios': 'Horario',
  '/api/asistencia': 'Asistencia',
  '/api/vacaciones': 'Vacacion',
  '/api/reposos-medicos': 'ReposoMedico',
  '/api/permisos': 'Permiso',
  '/api/observaciones': 'Observacion',
};

function obtenerRutaBase(url = '') {
  const ruta = url.split('?')[0];

  return Object.keys(NOMBRES_ENTIDAD).find((rutaBase) =>
    ruta.startsWith(rutaBase)
  );
}

function nombreEntidad(url) {
  const rutaBase = obtenerRutaBase(url);

  return NOMBRES_ENTIDAD[rutaBase] || rutaBase || 'Desconocido';
}

const ACCIONES = {
  POST: 'CREAR',
  PATCH: 'ACTUALIZAR',
  PUT: 'ACTUALIZAR',
  DELETE: 'ELIMINAR',
};

function obtenerNombreCompleto(datos = {}) {
  const nombre = String(datos.nombre || '').trim();
  const apellido = String(datos.apellido || '').trim();

  return [nombre, apellido]
    .filter(Boolean)
    .join(' ');
}

function obtenerEmpleadoId(req, entidad) {
  const body = req.body || {};
  const params = req.params || {};

  if (req.auditoria?.empleadoId) {
    return req.auditoria.empleadoId;
  }

  const entidadesConEmpleado = [
    'Asistencia',
    'Vacacion',
    'ReposoMedico',
    'Permiso',
    'Horario',
    'Observacion',
  ];

  if (!entidadesConEmpleado.includes(entidad)) {
    return null;
  }

  return (
    body.empleadoId ||
    params.empleadoId ||
    params.idEmpleado ||
    null
  );
}

/* Busca el nombre del empleado en la base de datos. */
async function obtenerNombreEmpleado(req, entidad) {
  const empleadoId = obtenerEmpleadoId(req, entidad);

  if (!empleadoId) {
    return null;
  }

  try {
    const empleado = await prisma.empleado.findUnique({
      where: {
        id: Number(empleadoId),
      },
      select: {
        nombre: true,
        apellido: true,
      },
    });

    if (!empleado) {
      return null;
    }

    return obtenerNombreCompleto(empleado);
  } catch (error) {
    console.error(
      'Error obteniendo empleado para auditoría:',
      error
    );

    return null;
  }
}

function obtenerDescripcion(
  req,
  entidad,
  accion,
  nombreEmpleado = null
) {
  const body = req.body || {};
  const auditoria = req.auditoria || {};

  switch (entidad) {
    case 'Usuario': {
      const usuarioObjetivo =
        auditoria.usuarioObjetivo ||
        body.usuario ||
        'usuario';

      if (auditoria.tipo === 'USUARIO_DESACTIVADO') {
        return `Se desactivó la cuenta de usuario ${usuarioObjetivo}.`;
      }

      if (auditoria.tipo === 'USUARIO_ACTIVADO') {
        return `Se activó la cuenta de usuario ${usuarioObjetivo}.`;
      }

      if (auditoria.tipo === 'PASSWORD_RESTABLECIDO') {
        return `Se cambió la contraseña de la cuenta de usuario ${usuarioObjetivo}.`;
      }

      if (accion === 'CREAR') {
        return `Se creó la cuenta de usuario ${usuarioObjetivo}.`;
      }

      if (accion === 'ACTUALIZAR') {
        return `Se actualizaron los datos de la cuenta de usuario ${usuarioObjetivo}.`;
      }

      return `Se realizó una acción sobre la cuenta de usuario ${usuarioObjetivo}.`;
    }

    case 'Empleado': {
      const nombre =
        auditoria.empleadoObjetivo ||
        nombreEmpleado ||
        obtenerNombreCompleto(body);

      if (auditoria.tipo === 'EMPLEADO_INACTIVADO') {
        return nombre
          ? `Se inactivó al empleado ${nombre}.`
          : 'Se inactivó un empleado.';
      }

      if (auditoria.tipo === 'EMPLEADO_ACTIVADO') {
        return nombre
        ? `Se activó al empleado ${nombre}.`
        : 'Se activó un empleado.';
      }

      if (accion === 'CREAR') {
        return nombre
          ? `Se registró al empleado ${nombre}.`
          : 'Se registró un nuevo empleado.';
      }

      if (accion === 'ACTUALIZAR') {
        return nombre
          ? `Se actualizaron los datos del empleado ${nombre}.`
          : 'Se actualizaron los datos de un empleado.';
      }

      return nombre
        ? `Se realizó una acción sobre el empleado ${nombre}.`
        : 'Se realizó una acción sobre un empleado.';
    }

    case 'Departamento': {
      const nombre = body.nombre || 'departamento';

      if (accion === 'CREAR') {
        return `Se registró el departamento ${nombre}.`;
      }

      if (accion === 'ACTUALIZAR') {
        return `Se actualizaron los datos del departamento ${nombre}.`;
      }

      return `Se realizó una acción sobre el departamento ${nombre}.`;
    }

    case 'Cargo': {
      const nombre = body.nombre || 'cargo';

      if (accion === 'CREAR') {
        return `Se registró el cargo ${nombre}.`;
      }

      if (accion === 'ACTUALIZAR') {
        return `Se actualizaron los datos del cargo ${nombre}.`;
      }

      return `Se realizó una acción sobre el cargo ${nombre}.`;
    }

    case 'Horario': {
      if (nombreEmpleado) {
        if (accion === 'CREAR') {
          return `Se registró el horario de ${nombreEmpleado}.`;
        }

        if (accion === 'ACTUALIZAR') {
          return `Se actualizó el horario de ${nombreEmpleado}.`;
        }

        return `Se realizó una acción sobre el horario de ${nombreEmpleado}.`;
      }

      if (accion === 'CREAR') {
        return 'Se registró un nuevo horario.';
      }

      if (accion === 'ACTUALIZAR') {
        return 'Se actualizó un horario.';
      }

      return 'Se realizó una acción sobre un horario.';
    }

    case 'Asistencia': {
      if (nombreEmpleado) {
        if (accion === 'CREAR') {
          return `Se registró la entrada de ${nombreEmpleado}.`;
        }

        if (accion === 'ACTUALIZAR') {
          return `Se registró la salida de ${nombreEmpleado}.`;
        }

        return `Se actualizó la asistencia de ${nombreEmpleado}.`;
      }

      if (accion === 'CREAR') {
        return 'Se registró una entrada de asistencia.';
      }

      if (accion === 'ACTUALIZAR') {
        return 'Se registró una salida de asistencia.';
      }

      return 'Se actualizó un registro de asistencia.';
    }

    case 'Vacacion': {
      if (nombreEmpleado) {
        if (accion === 'CREAR') {
          return `Se registraron vacaciones para ${nombreEmpleado}.`;
        }

        if (accion === 'ACTUALIZAR') {
          return `Se actualizaron las vacaciones de ${nombreEmpleado}.`;
        }

        return `Se realizó una acción sobre las vacaciones de ${nombreEmpleado}.`;
      }

      if (accion === 'CREAR') {
        return 'Se registró un período de vacaciones.';
      }

      if (accion === 'ACTUALIZAR') {
        return 'Se actualizaron las vacaciones.';
      }

      return 'Se realizó una acción sobre unas vacaciones.';
    }

    case 'ReposoMedico': {
      if (nombreEmpleado) {
        if (accion === 'CREAR') {
          return `Se registró un reposo médico para ${nombreEmpleado}.`;
        }

        if (accion === 'ACTUALIZAR') {
          return `Se actualizó el reposo médico de ${nombreEmpleado}.`;
        }

        return `Se realizó una acción sobre el reposo médico de ${nombreEmpleado}.`;
      }

      if (accion === 'CREAR') {
        return 'Se registró un reposo médico.';
      }

      if (accion === 'ACTUALIZAR') {
        return 'Se actualizó un reposo médico.';
      }

      return 'Se realizó una acción sobre un reposo médico.';
    }

    case 'Permiso': {
      if (nombreEmpleado) {
        if (accion === 'CREAR') {
          return `Se registró un permiso para ${nombreEmpleado}.`;
        }

        if (accion === 'ACTUALIZAR') {
          return `Se actualizó un permiso de ${nombreEmpleado}.`;
        }

        return `Se realizó una acción sobre un permiso de ${nombreEmpleado}.`;
      }

      if (accion === 'CREAR') {
        return 'Se registró un permiso.';
      }

      if (accion === 'ACTUALIZAR') {
        return 'Se actualizó un permiso.';
      }

      return 'Se realizó una acción sobre un permiso.';
    }

    case 'Observacion': {
      if (nombreEmpleado) {
        if (accion === 'CREAR') {
          return `Se registró una observación para ${nombreEmpleado}.`;
        }

        if (accion === 'ACTUALIZAR') {
          return `Se actualizó una observación de ${nombreEmpleado}.`;
        }

        return `Se realizó una acción sobre una observación de ${nombreEmpleado}.`;
      }

      if (accion === 'CREAR') {
        return 'Se registró una observación.';
      }

      if (accion === 'ACTUALIZAR') {
        return 'Se actualizó una observación.';
      }

      return 'Se realizó una acción sobre una observación.';
    }

    default:
      return `Se realizó la acción ${accion.toLowerCase()} sobre ${entidad}.`;
  }
}

module.exports = function auditoria(req, res, next) {
  res.on('finish', async () => {
    try {
      if (
        !['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)
      ) {
        return;
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        return;
      }

      const ruta = req.originalUrl.split('?')[0];

      if (
        ruta.startsWith('/api/auditoria') ||
        ruta.startsWith('/api/auth')
      ) {
        return;
      }

      const usuarioId = req.usuario
        ? req.usuario.usuarioId
        : null;

      const entidad = nombreEntidad(req.originalUrl);

      const entidadIdRaw =
        (req.params && req.params.id) || null;

      const entidadId =
        entidadIdRaw && !isNaN(Number(entidadIdRaw))
          ? Number(entidadIdRaw)
          : null;

      const accion =
        ACCIONES[req.method] || req.method;

      const bodyAuditoria = {
        ...(req.body || {}),
      };

      delete bodyAuditoria.password;
      delete bodyAuditoria.contrasena;
      delete bodyAuditoria.clave;
      delete bodyAuditoria.passwordHash;

      const nombreEmpleado =
        await obtenerNombreEmpleado(req, entidad);

      const detalle = {
        descripcion: obtenerDescripcion(
          req,
          entidad,
          accion,
          nombreEmpleado
        ),
        datos: {
          params: req.params,
          body: bodyAuditoria,
          query: req.query,
        },
      };

      const ip =
        req.ip ||
        (req.headers &&
          req.headers['x-forwarded-for']) ||
        (req.connection &&
          req.connection.remoteAddress) ||
        null;

      registrarEvento({
        usuarioId,
        accion,
        entidad,
        entidadId,
        detalle,
        fecha: new Date(),
        ip,
      }).catch((err) => {
        console.error(
          'Error guardando auditoría:',
          err
        );
      });
    } catch (err) {
      console.error(
        'Error en middleware auditoría:',
        err
      );
    }
  });

  next();
};