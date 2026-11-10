const Joi = require('joi');

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

// Crear vacaciones
const crearSchema = Joi.object({
  empleadoId: Joi.string().required(),

  desde: Joi.string()
    .pattern(datePattern)
    .required(),

  hasta: Joi.string()
    .pattern(datePattern)
    .required(),

  motivo: Joi.string()
    .max(500)
    .allow('')
    .optional()
});

// Editar vacaciones
const editarSchema = Joi.object({
  desde: Joi.string()
    .pattern(datePattern)
    .optional(),

  hasta: Joi.string()
    .pattern(datePattern)
    .optional(),

  motivo: Joi.string()
    .max(500)
    .allow('')
    .optional()
});

const estadoSchema = Joi.object({
  estado: Joi.string()
    .valid('Pendiente', 'Aprobada', 'Rechazada')
    .required(),

  aprobadoPor: Joi.string()
    .optional()
});

module.exports = {
  crearSchema,
  editarSchema,
  estadoSchema
};