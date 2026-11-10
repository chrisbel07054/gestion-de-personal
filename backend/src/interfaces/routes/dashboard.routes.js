const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

// Métricas del sistema
router.get('/metrics', verificarJWT, requireRole('ADMINISTRADOR','RRHH','OPERADOR'), dashboardController.metrics);

// Presentes / ausentes por departamento (fecha o rango)
router.get('/asistencia-por-departamento', verificarJWT, requireRole('ADMINISTRADOR','RRHH'), dashboardController.asistenciaPorDepartamento);

// Top retardos por departamento (mes, limit)
router.get('/top-retardos', verificarJWT, requireRole('ADMINISTRADOR','RRHH'), dashboardController.topRetardos);

// Próximas reincorporaciones (dias)
router.get('/proximas-reincorporaciones', verificarJWT, requireRole('ADMINISTRADOR','RRHH'), dashboardController.proximasReincorporaciones);

module.exports = router;
