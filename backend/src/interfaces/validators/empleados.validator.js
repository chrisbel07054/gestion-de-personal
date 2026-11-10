import Joi from "joi";

export const empleadoSchema = Joi.object({
  cedula: Joi.string().trim().required().messages({
    "string.empty": "La cédula es obligatoria",
  }),
  nombre: Joi.string().trim().required().messages({
    "string.empty": "El nombre es obligatorio",
  }),
  apellido: Joi.string().trim().required().messages({
    "string.empty": "El apellido es obligatorio",
  }),
  fechaNacimiento: Joi.date().optional(),
  sexo: Joi.string().optional(),
  telefono: Joi.string().allow("", null),
  correo: Joi.string().email().allow("", null),
  direccion: Joi.string().allow("", null),
  departamentoId: Joi.string().required().messages({
    "string.empty": "El departamento es obligatorio",
  }),
  cargo: Joi.string().allow("", null),
  fechaIngreso: Joi.date().optional(),
  estado: Joi.string().valid("Activo", "Inactivo").optional(),
  foto: Joi.string().uri().allow("", null),
});
