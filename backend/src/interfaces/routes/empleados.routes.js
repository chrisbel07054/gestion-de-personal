const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const empleadosController = require('../controllers/empleados.controller');
const { crearSchema, editarSchema } = require('../validators/empleado.validator');
const { upload } = require('../../infrastructure/storage/uploads');

const router = express.Router();

// Listar y obtener: Admin + RRHH
router.get('/', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), empleadosController.listar);
router.get('/:id', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), empleadosController.obtener);

// Búsqueda por cédula: Operador y RRHH
router.get('/cedula/:cedula', verificarJWT, requireRole('OPERADOR', 'RRHH'), empleadosController.buscarPorCedula);

// Crear: Admin + RRHH (admite foto multipart)
router.post('/', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), upload.single('foto'), (req, res, next) => {
  const { error } = crearSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, empleadosController.crear);

// Editar
router.patch('/:id', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), upload.single('foto'), (req, res, next) => {
  const { error } = editarSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, empleadosController.editar);

// Subir foto por separado
router.post('/:id/foto', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), upload.single('foto'), empleadosController.subirFoto);

// Inactivar
router.delete('/:id', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), empleadosController.inactivar);

module.exports = router;
