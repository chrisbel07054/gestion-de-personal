const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const asistenciaController = require('../controllers/asistencia.controller');
const { entradaSchema, salidaSchema } = require('../validators/asistencia.validator');

const router = express.Router();

// Registrar entrada (Operador, RRHH, ADMINISTRADOR)
router.post('/entrada', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH', 'OPERADOR'), (req, res, next) => {
  const { error } = entradaSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, asistenciaController.entrada);

// Registrar salida (Operador, RRHH, ADMINISTRADOR)
router.post('/salida', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH', 'OPERADOR'), (req, res, next) => {
  const { error } = salidaSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, asistenciaController.salida);

// Obtener historial por empleado (Admin, RRHH)
router.get('/:empleadoId', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), asistenciaController.obtenerPorEmpleado);

// Obtener registros por día (Admin, RRHH)
router.get('/', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), asistenciaController.obtenerPorDia);

module.exports = router;
