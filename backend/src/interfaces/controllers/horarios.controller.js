const asignarHorario = require('../../application/use-cases/horarios/asignarHorario');
const asignarPorDepartamento = require('../../application/use-cases/horarios/asignarPorDepartamento');
const obtenerHorario = require('../../application/use-cases/horarios/obtener');
const editarHorario = require('../../application/use-cases/horarios/editar');

exports.obtener = async (req, res) => {
  try {
    const horario = await obtenerHorario(req.params.empleadoId);

    if (!horario) {
      return res.json({
        mensaje: 'Empleado sin horario asignado',
        data: null,
        error: null
      });
    }

    return res.json({
      mensaje: 'OK',
      data: horario,
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

exports.asignar = async (req, res) => {
  try {
    const horario = await asignarHorario(req.params.empleadoId, req.body);
    return res.status(201).json({ mensaje: 'Horario asignado', data: horario, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};

exports.editar = async (req, res) => {
  try {
    const horario = await editarHorario(req.params.empleadoId, req.body);
    if (!horario) return res.status(404).json({ mensaje: 'Horario no encontrado', data: null, error: 'NOT_FOUND' });
    return res.json({ mensaje: 'Horario actualizado', data: horario, error: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno', data: null, error: 'INTERNAL' });
  }
};

exports.asignarPorDepartamento = async (req, res) => {
  try {
    const result = await asignarPorDepartamento(req.params.departamentoId, req.body);
    return res.json({ mensaje: 'Horarios asignados por departamento', data: result, error: null });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ mensaje: err.message || 'Error interno', data: null, error: err.code || 'INTERNAL' });
  }
};
