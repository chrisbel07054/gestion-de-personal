const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const reportesController = require('../controllers/reportes.controller');

const router = express.Router();

// Reportes con filtros
router.get('/asistencia', verificarJWT, requireRole('ADMINISTRADOR','RRHH'), reportesController.asistencia);
router.get('/horarios', verificarJWT, requireRole('ADMINISTRADOR','RRHH'), reportesController.horarios);
router.get('/vacaciones', verificarJWT, requireRole('ADMINISTRADOR','RRHH'), reportesController.vacaciones);
router.get('/reposos-medicos', verificarJWT, requireRole('ADMINISTRADOR','RRHH'), reportesController.reposos);
router.get('/permisos', verificarJWT, requireRole('ADMINISTRADOR','RRHH'), reportesController.permisos);

// Exportaciones
router.get('/exportar/excel', verificarJWT, requireRole('ADMINISTRADOR','RRHH'), reportesController.exportExcel);
router.get('/exportar/pdf', verificarJWT, requireRole('ADMINISTRADOR','RRHH'), reportesController.exportPdf);

module.exports = router;
