import Joi from "joi";

export const reposoSchema = Joi.object({
  empleadoId: Joi.string().required(),
  tipoMovimiento: Joi.string().valid("OTORGADO", "UTILIZADO").required(),
  dias: Joi.number().integer().min(1).required(),
  motivo: Joi.string().allow("", null),
  observaciones: Joi.string().allow("", null),
  fecha: Joi.date().required(),
});
