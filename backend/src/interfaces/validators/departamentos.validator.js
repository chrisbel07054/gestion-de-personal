import Joi from "joi";

export const departamentoSchema = Joi.object({
  nombre: Joi.string().trim().required().messages({
    "string.empty": "El nombre es obligatorio",
  }),
  descripcion: Joi.string().allow("", null),
  responsable: Joi.string().allow("", null),
  estado: Joi.string().valid("Activo", "Inactivo").optional(),
});
