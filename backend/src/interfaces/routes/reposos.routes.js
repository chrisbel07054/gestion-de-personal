const express = require('express');
const verificarJWT = require('../middlewares/verificarJWT');
const requireRole = require('../middlewares/requireRole');
const repososController = require('../controllers/reposos.controller');
const { crearSchema } = require('../validators/reposo.validator');

const router = express.Router();

// Crear reposo (Empleado, RRHH, ADMIN)
router.post('/', verificarJWT, (req, res, next) => {
  const { error } = crearSchema.validate(req.body);
  if (error) return res.status(400).json({ mensaje: error.message, data: null, error: 'VALIDATION' });
  next();
}, repososController.crear);

// Listar reposos (ADMIN, RRHH)
router.get('/', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), repososController.listar);

// Historial por empleado
router.get('/empleado/:empleadoId', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), repososController.historialPorEmpleado);

// Editar reposo (PATCH)
router.patch('/:id', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), repososController.editar);

// Eliminar reposo
router.delete('/:id', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), repososController.eliminar);

// Finalizar reposo (marcar Aprobado)
router.patch('/:id/finalizar', verificarJWT, requireRole('ADMINISTRADOR', 'RRHH'), repososController.finalizar);

module.exports = router;
