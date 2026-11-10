const registrarEntrada = require('../../application/use-cases/asistencia/registrarEntrada');
const registrarSalida = require('../../application/use-cases/asistencia/registrarSalida');
const consultas = require('../../application/use-cases/asistencia/consultas');

exports.entrada = async (req, res) => {
  try {
    const record = await registrarEntrada(
      {
        empleadoId: req.body.empleadoId,
        horaEntrada: req.body.horaEntrada,
        observacion: req.body.observacion
      },
      req.usuario ? req.usuario.usuarioId : null
    );
    return res.status(201).json({
      mensaje: 'Entrada registrada',
      data: record,
      error: null
    });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({
      mensaje: err.message || 'Error interno',
      data: null,
      error: err.code || 'INTERNAL'
    });
  }
};

exports.salida = async (req, res) => {
  try {
    const record = await registrarSalida(
      {
        empleadoId: req.body.empleadoId,
        horaSalida: req.body.horaSalida,
        observacion: req.body.observacion
      },
      req.usuario ? req.usuario.usuarioId : null
    );
    return res.json({
      mensaje: 'Salida registrada',
      data: record,
      error: null
    });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({
      mensaje: err.message || 'Error interno',
      data: null,
      error: err.code || 'INTERNAL'
    });
  }
};
exports.obtenerPorEmpleado = async (req, res) => {
  try {
    const records = await consultas.obtenerPorEmpleado({
      empleadoId: req.params.empleadoId,
      desde: req.query.desde,
      hasta: req.query.hasta
    });
    return res.json({
      mensaje: 'OK',
      data: records,
      error: null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      mensaje: 'Error interno',
      data: null,
      error: 'INTERNAL'
    });
  }
};
exports.obtenerPorDia = async (req, res) => {
  try {
    const fecha =
      req.query.fecha ||
      new Date().toISOString().slice(0, 10);

    const records = await consultas.obtenerPorDia({
      fecha,
      departamentoId: req.query.departamentoId,
      nombre: req.query.nombre,
      cedula: req.query.cedula,
      page: req.query.page,
      limit: req.query.limit
    });

    return res.json({
      mensaje: 'OK',
      data: records.items,
      meta: records.meta,
      error: null
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      mensaje: 'Error interno',
      data: null,
      error: 'INTERNAL'
    });
  }
};