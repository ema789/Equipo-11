// Importa el enrutador de Express para crear endpoints modulares
import { Router } from "express"; 
// Importa tus funciones de controlador donde reside la lógica de negocio
import { 
    registerController, 
    loginController, 
    logoutController, 
    getUserByIdController,
    updateUserDateController,
    updateUserCompanyController,
    updateUserLogoController
} from "../controllers/auth.controller.js";
import { 
    registerValidation, 
    loginValidation 
} from "../validators/auth.validator.js";
import upload from "../config/multer.config.js";
import { 
    authLimiter 
} from "../middlewares/rateLimiter.middleware.js";
// Importa middlewares personalizados para proteger rutas y validar campos
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router(); // Crea una instancia de router para definir tus rutas

// Definición de rutas y encadenamiento de middlewares
// El orden importa: Primero limitas (RateLimit), luego validas los campos (Validator), luego ejecutas el controlador
router.post("/register", authLimiter, registerValidation, validate, registerController);
router.post("/login",    authLimiter, loginValidation,    validate, loginController);

// Rutas protegidas: requieren que el usuario esté autenticado previamente
router.post("/logout",   authMiddleware, logoutController); // Ejecuta el middleware de sesión antes de cerrar
router.get("/me",        authMiddleware, getUserByIdController);  // Solo permite ver el perfil si el token es válido

//Rutas protegidas para actualizar datos del usuario
router.put("/update", authMiddleware, updateUserDateController);
router.put("/updateCompany", authMiddleware, updateUserCompanyController);
router.patch("/updateLogo", authMiddleware, upload.single("logo"), updateUserLogoController);
export default router; // Exporta el router para usarlo en tu servidor principal
