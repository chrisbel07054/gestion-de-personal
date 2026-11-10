import Joi from "joi";

export const objectIdParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.empty": "El id es obligatorio",
    "string.hex": "El id debe ser un identificador válido de MongoDB",
    "string.length": "El id debe tener 24 caracteres",
  }),
});

export const empleadoIdParamSchema = Joi.object({
  empleadoId: Joi.string().hex().length(24).required().messages({
    "string.empty": "El empleadoId es obligatorio",
    "string.hex": "El empleadoId debe ser un identificador válido de MongoDB",
    "string.length": "El empleadoId debe tener 24 caracteres",
  }),
});
