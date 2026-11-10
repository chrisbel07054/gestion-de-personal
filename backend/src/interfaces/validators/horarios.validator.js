import Joi from "joi";

export const horarioSchema = Joi.object({
  horaEntrada: Joi.string().trim().required().messages({
    "string.empty": "La hora de entrada es obligatoria",
  }),
  horaSalida: Joi.string().trim().required().messages({
    "string.empty": "La hora de salida es obligatoria",
  }),
  diasLaborales: Joi.array().items(Joi.string()).required().messages({
    "any.required": "Los días laborales son obligatorios",
  }),
  diasLibres: Joi.array().items(Joi.string()).optional(),
});
