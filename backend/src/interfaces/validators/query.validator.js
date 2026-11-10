import Joi from "joi";
import { optionalObjectIdSchema, isoDateSchema } from "./common.validator.js";

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().messages({
    "number.base": "Page debe ser un número",
    "number.min": "Page debe ser al menos 1",
  }),
  limit: Joi.number().integer().min(1).optional().messages({
    "number.base": "Limit debe ser un número",
    "number.min": "Limit debe ser al menos 1",
  }),
  desde: isoDateSchema.optional(),
  hasta: isoDateSchema.optional(),
});

export const empleadoQuerySchema = Joi.object({
  busqueda: Joi.string().optional(),
  departamentoId: optionalObjectIdSchema,
  cargo: Joi.string().optional(),
  estado: Joi.string().valid("Activo", "Inactivo").optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional(),
});

export const asistenciaQuerySchema = Joi.object({
  empleadoId: optionalObjectIdSchema,
  departamentoId: optionalObjectIdSchema,
  cargo: Joi.string().optional(),
  fecha: isoDateSchema.optional(),
});

export const observacionesQuerySchema = Joi.object({
  empleadoId: optionalObjectIdSchema,
  autor: Joi.string().optional(),
  desde: isoDateSchema.optional(),
  hasta: isoDateSchema.optional(),
});

export const vacacionQuerySchema = Joi.object({
  empleadoId: optionalObjectIdSchema,
  estado: Joi.string().valid("Programada", "En curso", "Finalizada").optional(),
  desde: isoDateSchema.optional(),
  hasta: isoDateSchema.optional(),
});

export const reposoQuerySchema = Joi.object({
  empleadoId: optionalObjectIdSchema,
  tipoMovimiento: Joi.string().valid("OTORGADO", "UTILIZADO").optional(),
  desde: isoDateSchema.optional(),
  hasta: isoDateSchema.optional(),
});

export const reporteExportQuerySchema = Joi.object({
  tipo: Joi.string().valid("asistencia", "vacaciones", "reposos", "observaciones").optional(),
  empleadoId: optionalObjectIdSchema,
  departamentoId: optionalObjectIdSchema,
  cargo: Joi.string().optional(),
  estado: Joi.string().optional(),
  tipoMovimiento: Joi.string().optional(),
  autor: Joi.string().optional(),
  desde: isoDateSchema.optional(),
  hasta: isoDateSchema.optional(),
});
