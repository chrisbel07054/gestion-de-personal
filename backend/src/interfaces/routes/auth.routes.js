const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// NOTE: Rate limiter removed per request — no "demasiados intentos" lockout
router.post('/login', authController.login);
router.get('/perfil', verificarJWT, authController.perfil);
router.patch('/cambiar-password', verificarJWT, authController.cambiarPassword);

module.exports = router;
