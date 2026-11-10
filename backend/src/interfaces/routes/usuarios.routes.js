const express = require('express');
const requireRole = require('../middlewares/requireRole');
const verificarJWT = require('../middlewares/verificarJWT');
const usuariosController = require('../controllers/usuarios.controller');

const router = express.Router();

// Todos los endpoints de usuarios requieren ser Administrador
router.use(verificarJWT, requireRole('ADMINISTRADOR'));

router.get('/', usuariosController.listar);
router.get('/:id', usuariosController.obtener);
router.post('/', usuariosController.crear);
router.patch('/:id', usuariosController.editar);
router.patch('/:id/restablecer-password', usuariosController.restablecerPassword);
router.delete('/:id', usuariosController.desactivar);
router.patch('/:id/activar', usuariosController.activar);

module.exports = router;
