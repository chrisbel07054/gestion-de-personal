const consultas = require('../../application/use-cases/estadisticas/consultas');

const obtenerEstadisticas = async (req, res, next) => {
  try {
    const {
      periodo,
      desde,
      hasta,
      departamentoId,
      empleadoId
    } = req.query;

    const resultado = await consultas.obtenerEstadisticas({
      periodo,
      desde,
      hasta,
      departamentoId,
      empleadoId
    });

    return res.status(200).json({
      mensaje: 'Estadísticas de asistencia obtenidas correctamente',
      data: resultado,
      error: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerEstadisticas
};
