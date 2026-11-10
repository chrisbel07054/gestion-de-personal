const crearReposo = require('../../application/use-cases/reposos-medicos/crear');
const listarReposos = require('../../application/use-cases/reposos-medicos/listar');
const editarReposo = require('../../application/use-cases/reposos-medicos/editar');
const eliminarReposo = require('../../application/use-cases/reposos-medicos/eliminar');
const finalizarReposo = require('../../application/use-cases/reposos-medicos/finalizar');

exports.crear = async (req, res) => {
  try {
    const esRRHH = ['RRHH', 'ADMINISTRADOR'].includes(req.usuario?.rol);
    const doc = await crearReposo({
      ...req.body,
      aprobadoPorId: esRRHH ? req.usuario.usuarioId : null,
    });
    return res.status(201).json({ mensaje: 'Reposo creado', data: doc, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};

exports.listar = async (req, res) => {
  try {
    const rows = await listarReposos({ empleadoId: req.query.empleadoId, estado: req.query.estado });
    return res.json({ mensaje: 'OK', data: rows, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};

exports.historialPorEmpleado = async (req, res) => {
  try {
    const rows = await listarReposos({ empleadoId: req.params.empleadoId });
    return res.json({ mensaje: 'OK', data: rows, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};

exports.editar = async (req, res) => {
  try {
    const doc = await editarReposo(req.params.id, req.body);
    return res.json({ mensaje: 'Reposo actualizado', data: doc, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};

exports.eliminar = async (req, res) => {
  try {
    await eliminarReposo(req.params.id);
    return res.json({ mensaje: 'Reposo eliminado', data: null, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};

exports.finalizar = async (req, res) => {
  try {
    const aprobadoPor = req.usuario && req.usuario.usuarioId;
    const doc = await finalizarReposo(req.params.id, aprobadoPor);
    return res.json({ mensaje: 'Reposo finalizado', data: doc, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};
