import Joi from "joi";

export const loginSchema = Joi.object({
  usuario: Joi.string().trim().required().messages({
    "string.empty": "El usuario es obligatorio",
  }),
  password: Joi.string().required().messages({
    "string.empty": "La contraseña es obligatoria",
  }),
});

export const changePasswordSchema = Joi.object({
  passwordActual: Joi.string().required().messages({
    "string.empty": "La contraseña actual es obligatoria",
  }),
  passwordNueva: Joi.string().min(8).required().messages({
    "string.empty": "La nueva contraseña es obligatoria",
    "string.min": "La nueva contraseña debe tener al menos 8 caracteres",
  }),
});
