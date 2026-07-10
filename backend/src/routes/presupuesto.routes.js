import { Router } from "express";

import { 
    createPresupuesto, 
    getPresupuestoById,
    addPdfController,
    filtroPresuestoController
} from "../controllers/presupuesto.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validateUUID } from "../middlewares/validateUUID.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Todas las rutas de presupuestos requieren autenticación
router.use(authMiddleware);

// upload.single("pdf") procesa el archivo PDF opcional del presupuesto
router.post("/", upload.single("pdf"), createPresupuesto);

// validateUUID verifica que el :id sea un UUID válido antes de llegar al controlador
router.get("/:id", validateUUID, getPresupuestoById);

// Ruta para actualizar PDF: Esta sí es PUT porque modifica un recurso
router.put("/:presupuestoId/pdf", upload.single("pdf"), addPdfController);

// Ruta para listar/filtrar presupuestos
router.get("/", filtroPresuestoController);

export default router;