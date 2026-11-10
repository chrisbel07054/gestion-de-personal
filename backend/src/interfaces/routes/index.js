import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { departamentosRouter } from "./departamentos.routes.js";
import { empleadosRouter } from "./empleados.routes.js";
import { horariosRouter } from "./horarios.routes.js";
import { asistenciaRouter } from "./asistencia.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { reportesRouter } from "./reportes.routes.js";
import { vacacionesRouter } from "./vacaciones.routes.js";
import { repososRouter } from "./reposos.routes.js";
import { observacionesRouter } from "./observaciones.routes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/departamentos", departamentosRouter);
router.use("/empleados", empleadosRouter);
router.use("/horarios", horariosRouter);
router.use("/asistencia", asistenciaRouter);
router.use("/dashboard", dashboardRouter);
router.use("/reportes", reportesRouter);
router.use("/vacaciones", vacacionesRouter);
router.use("/reposos", repososRouter);
router.use("/observaciones", observacionesRouter);
