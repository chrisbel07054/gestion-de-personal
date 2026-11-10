import Joi from "joi";

export const vacacionSchema = Joi.object({
  empleadoId: Joi.string().required(),
  fechaInicio: Joi.date().required(),
  fechaFin: Joi.date().required(),
  estado: Joi.string().valid("Programada", "En curso", "Finalizada").required(),
  observaciones: Joi.string().allow("", null),
});
