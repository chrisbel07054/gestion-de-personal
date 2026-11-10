const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const departamentosController = require('../controllers/departamentos.controller');
const { crearSchema, editarSchema } = require('../validators/departamento.validator');
const Joi = require('joi');

const router = express.Router();

// GET endpoints: Administrador, RRHH
router.get('/', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH', 'OPERADOR'), departamentosController.listar);
router.get('/:id', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH', 'OPERADOR'), departamentosController.obtener);

// Admin-only endpoints
router.post('/', verificarJWT, requireRole('ADMINISTRADOR'), (req, res, next) => {
  const { error } = crearSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, departamentosController.crear);

router.patch('/:id', verificarJWT, requireRole('ADMINISTRADOR'), (req, res, next) => {
  const { error } = editarSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, departamentosController.editar);

router.patch('/:id/activar', verificarJWT, requireRole('ADMINISTRADOR'), departamentosController.activar);
router.delete('/:id', verificarJWT, requireRole('ADMINISTRADOR'), departamentosController.inactivar);

module.exports = router;
