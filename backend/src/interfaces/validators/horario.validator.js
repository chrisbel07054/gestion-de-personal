const Joi = require('joi');

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const crearSchema = Joi.object({
  horaEntrada: Joi.string().pattern(timePattern).required()
    .messages({ 'string.pattern.base': 'horaEntrada debe tener formato HH:mm' }),
  horaSalida: Joi.string().pattern(timePattern).required()
    .messages({ 'string.pattern.base': 'horaSalida debe tener formato HH:mm' }),
  diasLaborales: Joi.array().items(Joi.string()).min(1).required(),
  diasLibres: Joi.array().items(Joi.string()).optional(),
});

const editarSchema = Joi.object({
  horaEntrada: Joi.string().pattern(timePattern).optional(),
  horaSalida: Joi.string().pattern(timePattern).optional(),
  diasLaborales: Joi.array().items(Joi.string()).optional(),
  diasLibres: Joi.array().items(Joi.string()).optional(),
}).min(1);

module.exports = { crearSchema, editarSchema };
