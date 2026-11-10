const Joi = require('joi');

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const crearSchema = Joi.object({
  empleadoId: Joi.string().required(),
  fecha: Joi.string().pattern(datePattern).required(),
  tipo: Joi.string().max(100).required(),
  motivo: Joi.string().max(500).optional()
});

module.exports = { crearSchema };
