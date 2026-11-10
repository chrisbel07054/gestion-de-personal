import Joi from "joi";

export const reportesAsistenciaSchema = Joi.object({
  empleadoId: Joi.string().optional(),
  departamentoId: Joi.string().optional(),
  cargo: Joi.string().optional(),
  desde: Joi.string().isoDate().optional().messages({
    "string.isoDate": "El parámetro desde debe ser una fecha ISO válida",
  }),
  hasta: Joi.string().isoDate().optional().messages({
    "string.isoDate": "El parámetro hasta debe ser una fecha ISO válida",
  }),
});

export const reportesVacacionesSchema = Joi.object({
  empleadoId: Joi.string().optional(),
  estado: Joi.string().valid("Programada", "En curso", "Finalizada").optional(),
  desde: Joi.string().isoDate().optional().messages({
    "string.isoDate": "El parámetro desde debe ser una fecha ISO válida",
  }),
  hasta: Joi.string().isoDate().optional().messages({
    "string.isoDate": "El parámetro hasta debe ser una fecha ISO válida",
  }),
});

export const reportesRepososSchema = Joi.object({
  empleadoId: Joi.string().optional(),
  tipoMovimiento: Joi.string().valid("OTORGADO", "UTILIZADO").optional(),
  desde: Joi.string().isoDate().optional().messages({
    "string.isoDate": "El parámetro desde debe ser una fecha ISO válida",
  }),
  hasta: Joi.string().isoDate().optional().messages({
    "string.isoDate": "El parámetro hasta debe ser una fecha ISO válida",
  }),
});

export const reportesObservacionesSchema = Joi.object({
  empleadoId: Joi.string().optional(),
  autor: Joi.string().optional(),
  desde: Joi.string().isoDate().optional().messages({
    "string.isoDate": "El parámetro desde debe ser una fecha ISO válida",
  }),
  hasta: Joi.string().isoDate().optional().messages({
    "string.isoDate": "El parámetro hasta debe ser una fecha ISO válida",
  }),
});

export const reportesExportSchema = Joi.object({
  tipo: Joi.string().valid("asistencia", "vacaciones", "reposos", "observaciones").optional(),
  empleadoId: Joi.string().optional(),
  departamentoId: Joi.string().optional(),
  cargo: Joi.string().optional(),
  estado: Joi.string().optional(),
  tipoMovimiento: Joi.string().optional(),
  autor: Joi.string().optional(),
  desde: Joi.string().isoDate().optional().messages({
    "string.isoDate": "El parámetro desde debe ser una fecha ISO válida",
  }),
  hasta: Joi.string().isoDate().optional().messages({
    "string.isoDate": "El parámetro hasta debe ser una fecha ISO válida",
  }),
});
