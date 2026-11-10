const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const estadisticasController = require('../controllers/estadisticas.controller');

const router = express.Router();

router.get(
  '/',
  verificarJWT,
  requireRole('ADMINISTRADOR', 'RRHH'),
  estadisticasController.obtenerEstadisticas
);

module.exports = router;
