import { body } from "express-validator"; 
// Reglas de validación para crear cliente
export const createClienteValidation = [
    body("nombre")
        .trim()
        .notEmpty().withMessage("El nombre del cliente es obligatorio")
        .isLength({ max: 100 }).withMessage("El nombre no puede superar 100 caracteres")
        .escape(),
    body("apellido")
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage("El apellido no puede superar 100 caracteres")
        .escape(),
    body("email")
        .optional()
        .isEmail().withMessage("Debe ser un email válido")
        .normalizeEmail(),
    body("cuit_cuil")
        .optional()
        .trim()
        .isLength({ max: 20 }).withMessage("El CUIT no puede superar 20 caracteres")
        .escape(),
    body("telefono")
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage("El teléfono no puede superar 50 caracteres")
        .escape(),
];