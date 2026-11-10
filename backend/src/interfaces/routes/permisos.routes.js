const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const permisosController = require('../controllers/permisos.controller');
const { crearSchema } = require('../validators/permiso.validator');

const router = express.Router();

// Crear permiso (Empleado, RRHH, ADMIN)
router.post('/', verificarJWT, (req, res, next) => {
  const { error } = crearSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, permisosController.crear);

// Listar permisos (ADMIN, RRHH)
router.get('/', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), permisosController.listar);

// Historial por empleado
router.get('/empleado/:empleadoId', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), permisosController.historialPorEmpleado);

// Editar permiso (PATCH)
router.patch('/:id', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), permisosController.editar);

// Eliminar permiso
router.delete('/:id', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), permisosController.eliminar);

module.exports = router;
