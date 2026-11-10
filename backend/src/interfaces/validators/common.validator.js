import Joi from "joi";

export const objectIdSchema = Joi.string().hex().length(24).required().messages({
  "string.empty": "El id es obligatorio",
  "string.hex": "El id debe ser un identificador válido de MongoDB",
  "string.length": "El id debe tener 24 caracteres",
});

export const optionalObjectIdSchema = Joi.string().hex().length(24).optional().messages({
  "string.hex": "El id debe ser un identificador válido de MongoDB",
  "string.length": "El id debe tener 24 caracteres",
});

export const isoDateSchema = Joi.string().isoDate().messages({
  "string.isoDate": "La fecha debe ser una fecha ISO válida",
});
