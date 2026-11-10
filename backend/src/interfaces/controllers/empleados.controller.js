const fs = require('fs');
const PrismaEmpleadoRepository = require('../../infrastructure/database/repositories/PrismaEmpleadoRepository');
const crearEmpleadoUseCase = require('../../application/use-cases/empleados/crearEmpleado');
const editarEmpleadoUseCase = require('../../application/use-cases/empleados/editarEmpleado');
const inactivarEmpleadoUseCase = require('../../application/use-cases/empleados/inactivarEmpleado');
const listarEmpleadosUseCase = require('../../application/use-cases/empleados/listarEmpleados');
const obtenerExpedienteUseCase = require('../../application/use-cases/empleados/obtenerExpediente');
const buscarPorCedulaUseCase = require('../../application/use-cases/empleados/buscarPorCedula');
const { toId } = require('../../shared/ids');
const { guardarFoto } = require('../../infrastructure/storage/uploads');

const empleadoRepository = new PrismaEmpleadoRepository();
const crearEmpleado = crearEmpleadoUseCase(empleadoRepository);
const editarEmpleado = editarEmpleadoUseCase(empleadoRepository);
const inactivarEmpleado = inactivarEmpleadoUseCase(empleadoRepository);
const listarEmpleados = listarEmpleadosUseCase(empleadoRepository);
const obtenerExpediente = obtenerExpedienteUseCase(empleadoRepository);
const buscarPorCedula = buscarPorCedulaUseCase(empleadoRepository);

function manejarError(res, err) {
  const CODIGOS = { INVALID_DEPARTMENT: 400, INVALID_CARGO: 400, DUPLICATE: 400, NOT_FOUND: 404, INVALID_ID: 400 };
  if (err.code && CODIGOS[err.code]) return res.status(CODIGOS[err.code]).json({ mensaje: err.message, data: null, error: err.code });
  console.error(err);
  return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
}

exports.listar = async (req, res) => {
  try {
    const data = await listarEmpleados(req.query);
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.obtener = async (req, res) => {
  try {
    const data = await obtenerExpediente(toId(req.params.id));
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.buscarPorCedula = async (req, res) => {
  try {
    const data = await buscarPorCedula(req.params.cedula);
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.crear = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.file) payload.foto = await guardarFoto(req.file);
    const data = await crearEmpleado(payload);
    return res.status(201).json({ mensaje: 'Empleado creado', data, error: null });
  } catch (err) { return manejarError(res, err); }
};

exports.editar = async (req, res) => {
  try {
    const empleadoId = toId(req.params.id);

    // Obtener el empleado antes de modificarlo para conocer su estado actual
    const empleadoActual = await empleadoRepository.obtenerPorId(empleadoId);

    if (!empleadoActual) {
      return res.status(404).json({
        mensaje: 'Empleado no encontrado',
        data: null,
        error: 'NOT_FOUND',
      });
    }

    const cambios = { ...req.body };

    if (req.file) {
      cambios.foto = await guardarFoto(req.file);
    }

    const data = await editarEmpleado(empleadoId, cambios);

    const nombreEmpleado = [empleadoActual.nombre, empleadoActual.apellido]
      .filter(Boolean)
      .join(' ')
      .trim();

    // Detectar reactivación: estaba inactivo y ahora queda activo
    if (empleadoActual.estado === 'Inactivo' && data.estado === 'Activo') {
      req.auditoria = {
        tipo: 'EMPLEADO_ACTIVADO',
        empleadoObjetivo: nombreEmpleado,
      };
    }

    return res.json({
      mensaje: 'Empleado actualizado',
      data,
      error: null,
    });
  } catch (err) {
    return manejarError(res, err);
  }
};

exports.inactivar = async (req, res) => {
  try {
    const empleadoId = toId(req.params.id);
    const empleado = await empleadoRepository.obtenerPorId(empleadoId);

    if (!empleado) {
      return res.status(404).json({
        mensaje: 'No encontrado',
        data: null,
        error: 'NOT_FOUND',
      });
    }

    const nombreEmpleado = [
      empleado.nombre,
      empleado.apellido,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    req.auditoria = {
      tipo: 'EMPLEADO_INACTIVADO',
      empleadoObjetivo: nombreEmpleado,
    };

    await inactivarEmpleado(empleadoId);

    return res.json({
      mensaje: 'Empleado inactivado',
      data: null,
      error: null,
    });
  } catch (err) {
    return manejarError(res, err);
  }
};

exports.subirFoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: 'Archivo no enviado', data: null, error: 'NO_FILE' });
    const data = await editarEmpleado(toId(req.params.id), {
      foto: await guardarFoto(req.file),
    });
    return res.json({ mensaje: 'Foto subida', data: data.foto, error: null });
  } catch (err) { return manejarError(res, err); }
};
