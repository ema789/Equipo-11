import { Router } from "express";
import { 
    createItemController,
    getItemsController,
    updateItemController
} from "../controllers/item.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createItemValidation } from "../validators/item.validator.js";
const router = Router();

// Todas las rutas de ítems requieren autenticación
router.use(authMiddleware);

router.post("/", createItemValidation, validate, createItemController);
router.get("/", getItemsController);
router.put("/:id", updateItemController);

export default router;