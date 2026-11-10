const Joi = require('joi');

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const crearSchema = Joi.object({
  empleadoId: Joi.string().required(),
  fechaInicio: Joi.string().pattern(datePattern).required(),
  fechaFin: Joi.string().pattern(datePattern).required(),
  diagnostico: Joi.string().max(1000).optional(),
  documento: Joi.string().optional()
});

module.exports = { crearSchema };
