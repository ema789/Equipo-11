import { Router } from "express";
import { 
    createClienteController, 
    getClientesController,
    updateClienteController,
} from "../controllers/cliente.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createClienteValidation } from "../validators/cliente.validator.js";
const router = Router();

// Todas las rutas de clientes requieren autenticación
router.use(authMiddleware);

router.post("/", createClienteValidation, validate, createClienteController);
router.get("/", getClientesController);
router.put("/update/:id",createClienteValidation, validate, updateClienteController);

export default router;