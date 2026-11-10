const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const auditoriaController = require('../controllers/auditoria.controller');

const router = express.Router();

// Sólo Administrador puede consultar auditoría
router.get('/', verificarJWT, requireRole('ADMINISTRADOR'), auditoriaController.listar);

module.exports = router;
