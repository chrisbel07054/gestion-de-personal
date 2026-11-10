const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const cargosController = require('../controllers/cargos.controller');
const { crearSchema, editarSchema } = require('../validators/cargo.validator');

const router = express.Router();

// GET endpoints: Administrador, RRHH
router.get('/', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH', 'OPERADOR'), cargosController.listar);
router.get('/:id', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH', 'OPERADOR'), cargosController.obtener);

// Admin-only endpoints
router.post('/', verificarJWT, requireRole('ADMINISTRADOR'), (req, res, next) => {
  const { error } = crearSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, cargosController.crear);

router.patch('/:id', verificarJWT, requireRole('ADMINISTRADOR'), (req, res, next) => {
  const { error } = editarSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, cargosController.editar);

router.patch('/:id/activar', verificarJWT, requireRole('ADMINISTRADOR'), cargosController.activar);
router.delete('/:id', verificarJWT, requireRole('ADMINISTRADOR'), cargosController.inactivar);

module.exports = router;
