const Joi = require('joi');

const crearSchema = Joi.object({
  cedula: Joi.string().min(3).required(),
  nombre: Joi.string().required(),
  apellido: Joi.string().optional(),
  fechaNacimiento: Joi.date().optional(),
  sexo: Joi.string().optional(),
  telefono: Joi.string().optional(),
  correo: Joi.string().email().optional(),
  direccion: Joi.string().optional(),
  departamentoId: Joi.string().required(),
  cargoId: Joi.string().required(),
  fechaIngreso: Joi.date().optional(),
});

const editarSchema = Joi.object({
  cedula: Joi.string().min(3).optional(),
  nombre: Joi.string().optional(),
  apellido: Joi.string().optional(),
  fechaNacimiento: Joi.date().optional(),
  sexo: Joi.string().optional(),
  telefono: Joi.string().optional(),
  correo: Joi.string().email().optional(),
  direccion: Joi.string().optional(),
  departamentoId: Joi.string().optional(),
  cargoId: Joi.string().optional(),
  fechaIngreso: Joi.date().optional(),
  estado: Joi.string().valid('Activo', 'Inactivo').optional(),
}).min(1);

module.exports = { crearSchema, editarSchema };
