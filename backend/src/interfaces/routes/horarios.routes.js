const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const horariosController = require('../controllers/horarios.controller');
const { crearSchema, editarSchema } = require('../validators/horario.validator');

const router = express.Router();

// Obtener horario de un empleado (Admin, RRHH)
router.get('/:empleadoId', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), horariosController.obtener);

// Asignar horario a empleado (Admin, RRHH)
router.post('/:empleadoId', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), (req, res, next) => {
  const { error } = crearSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, horariosController.asignar);

// Editar horario (PATCH)
router.patch('/:empleadoId', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), (req, res, next) => {
  const { error } = editarSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, horariosController.editar);

// Asignar horario por departamento (bulk write)
router.post('/departamento/:departamentoId', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), (req, res, next) => {
  const { error } = crearSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, horariosController.asignarPorDepartamento);

module.exports = router;
