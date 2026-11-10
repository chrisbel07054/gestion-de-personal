const Joi = require('joi');

const crearSchema = Joi.object({
  usuario: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  nombre: Joi.string().required(),
  correo: Joi.string().email().optional(),
  rol: Joi.string().valid('ADMINISTRADOR', 'RRHH', 'OPERADOR').required(),
});

const editarSchema = Joi.object({
  usuario: Joi.string().min(3).optional(),
  nombre: Joi.string().optional(),
  correo: Joi.string().email().optional(),
  rol: Joi.string().valid('ADMINISTRADOR', 'RRHH', 'OPERADOR').optional(),
}).min(1);

module.exports = { crearSchema, editarSchema };
