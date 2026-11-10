const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const controller = require('../controllers/observaciones.controller');

const { crearSchema } = require('../validators/observacion.validator');

const router = express.Router();

router.get(
  '/:empleadoId',
  verificarJWT,
  requireRole('ADMINISTRADOR', 'RRHH'),
  controller.listar
);

router.post(
  '/:empleadoId',
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
  controller.agregar
);

module.exports = router;