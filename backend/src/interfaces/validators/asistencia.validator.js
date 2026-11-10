const Joi = require('joi');

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const entradaSchema = Joi.object({
  empleadoId: Joi.string().required(),
  horaEntrada: Joi.string().pattern(timePattern).optional(),
  observacion: Joi.string().allow('', null).optional() // <-- Agregado aquí
});

const salidaSchema = Joi.object({
  empleadoId: Joi.string().required(),
  horaSalida: Joi.string().pattern(timePattern).optional(),
  observacion: Joi.string().allow('', null).optional() // <-- Y aquí también
});

module.exports = { entradaSchema, salidaSchema };