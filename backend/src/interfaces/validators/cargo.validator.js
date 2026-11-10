const Joi = require('joi');

const crearSchema = Joi.object({
  nombre: Joi.string().min(2).required(),
  descripcion: Joi.string().allow('', null).optional(),
});

const editarSchema = Joi.object({
  nombre: Joi.string().min(2).optional(),
  descripcion: Joi.string().allow('', null).optional(),
}).min(1);

module.exports = { crearSchema, editarSchema };
