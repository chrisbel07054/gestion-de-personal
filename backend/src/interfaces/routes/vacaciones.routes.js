const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const vacacionesController = require('../controllers/vacaciones.controller');
const {
  crearSchema,
  editarSchema
} = require('../validators/vacacion.validator');

const router = express.Router();

router.post(
  '/',
  verificarJWT,
  requireRole('ADMINISTRADOR', 'RRHH'),
  (req, res, next) => {
    const { error } = crearSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        mensaje: error.message,
        data: null,
        error: 'VALIDATION'
      });
    }

    next();
  },
  vacacionesController.crear
);

router.get(
  '/',
  verificarJWT,
  requireRole('ADMINISTRADOR', 'RRHH'),
  vacacionesController.listar
);

router.get(
  '/empleado/:empleadoId',
  verificarJWT,
  requireRole('ADMINISTRADOR', 'RRHH'),
  vacacionesController.historialPorEmpleado
);

router.patch(
  '/:id',
  verificarJWT,
  requireRole('ADMINISTRADOR', 'RRHH'),
  (req, res, next) => {
    const { error } = editarSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        mensaje: error.message,
        data: null,
        error: 'VALIDATION'
      });
    }

    next();
  },
  vacacionesController.editar
);

router.delete(
  '/:id',
  verificarJWT,
  requireRole('ADMINISTRADOR', 'RRHH'),
  vacacionesController.eliminar
);

module.exports = router;