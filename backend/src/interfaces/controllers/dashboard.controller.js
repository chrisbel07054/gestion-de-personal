const obtenerMetricas = require('../../application/use-cases/dashboard/metrics');
const asistenciaPorDepartamento = require('../../application/use-cases/dashboard/asistenciaPorDepartamento');
const topRetardos = require('../../application/use-cases/dashboard/topRetardos');
const proximasReincorporaciones = require('../../application/use-cases/dashboard/proximasReincorporaciones');

exports.metrics = async (req, res) => {
  try {
    const data = await obtenerMetricas();
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};

exports.asistenciaPorDepartamento = async (req, res) => {
  try {
    const { fecha, desde, hasta } = req.query;
    const data = await asistenciaPorDepartamento({ fecha, desde, hasta });
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};

exports.topRetardos = async (req, res) => {
  try {
    const { mes, limit } = req.query;
    const data = await topRetardos({ mes, limit: limit ? Number(limit) : undefined });
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};

exports.proximasReincorporaciones = async (req, res) => {
  try {
    const dias = req.query.dias ? Number(req.query.dias) : undefined;
    const data = await proximasReincorporaciones({ dias });
    return res.json({ mensaje: 'OK', data, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};
