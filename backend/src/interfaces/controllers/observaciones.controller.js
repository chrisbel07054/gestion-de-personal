const agregarObservacion = require('../../application/use-cases/observaciones/agregar');
const listarObservaciones = require('../../application/use-cases/observaciones/listar');

exports.listar = async (req, res) => {
  try {
    const data = await listarObservaciones(req.params.empleadoId);

    return res.json({
      mensaje: 'OK',
      data,
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

exports.agregar = async (req, res) => {
  try {
    const data = await agregarObservacion({
      empleadoId: req.params.empleadoId,
      texto: req.body.texto,
      autorId: req.usuario.usuarioId
    });

    return res.status(201).json({
      mensaje: 'Observación agregada',
      data,
      error: null
    });

  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({
        mensaje: err.message,
        data: null,
        error: 'NOT_FOUND'
      });
    }

    console.error(err);

    return res.status(500).json({
      mensaje: 'Error interno',
      data: null,
      error: 'INTERNAL'
    });
  }
};