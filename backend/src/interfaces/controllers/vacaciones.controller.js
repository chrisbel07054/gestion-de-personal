const crearSolicitud = require('../../application/use-cases/vacaciones/crearSolicitud');
const listarSolicitudes = require('../../application/use-cases/vacaciones/listarSolicitudes');
const editarVacacion = require('../../application/use-cases/vacaciones/editar');
const eliminarVacacion = require('../../application/use-cases/vacaciones/eliminar');

exports.crear = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      aprobadoPorId: req.usuario?.usuarioId,
    };
    const sol = await crearSolicitud(payload);
    return res.status(201).json({ mensaje: 'Solicitud creada', data: sol, error: null });
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
    const rows = await listarSolicitudes(filter);
    return res.json({ mensaje: 'OK', data: rows, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};

exports.historialPorEmpleado = async (req, res) => {
  try {
    const empleadoId = req.params.empleadoId;
    const rows = await listarSolicitudes({ empleadoId });
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
    const doc = await editarVacacion(id, updates);
    return res.json({ mensaje: 'Vacación actualizada', data: doc, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const id = req.params.id;
    await eliminarVacacion(id);
    return res.json({ mensaje: 'Vacación eliminada', data: null, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};
