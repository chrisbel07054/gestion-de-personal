import Joi from "joi";

export const observacionSchema = Joi.object({
  empleadoId: Joi.string().required(),
  texto: Joi.string().required(),
  fecha: Joi.date().required(),
  autor: Joi.string().required(),
});
