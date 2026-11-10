const crearPermiso = require('../../application/use-cases/permisos/crear');
const listarPermisos = require('../../application/use-cases/permisos/listar');
const editarPermiso = require('../../application/use-cases/permisos/editar');
const eliminarPermiso = require('../../application/use-cases/permisos/eliminar');

exports.crear = async (req, res) => {
  try {
    const esRRHH = ['RRHH', 'ADMINISTRADOR'].includes(req.usuario?.rol);
    const payload = {
      ...req.body,
      aprobadoPorId: esRRHH ? req.usuario.usuarioId : null,
    };
    const doc = await crearPermiso(payload);
    return res.status(201).json({ mensaje: 'Permiso creado', data: doc, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};

exports.listar = async (req, res) => {
  try {
    const filter = {};
    if (req.query.empleadoId) filter.empleadoId = req.query.empleadoId;
    if (req.query.estado) filter.estado = req.query.estado;
    const rows = await listarPermisos(filter);
    return res.json({ mensaje: 'OK', data: rows, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};

exports.historialPorEmpleado = async (req, res) => {
  try {
    const empleadoId = req.params.empleadoId;
    const rows = await listarPermisos({ empleadoId });
    return res.json({ mensaje: 'OK', data: rows, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};

exports.editar = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const doc = await editarPermiso(id, updates);
    return res.json({ mensaje: 'Permiso actualizado', data: doc, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const id = req.params.id;
    await eliminarPermiso(id);
    return res.json({ mensaje: 'Permiso eliminado', data: null, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};
