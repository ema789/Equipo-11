import { body } from "express-validator";

export const createItemValidation = [
    body("nombre")
        .trim()
        .notEmpty().withMessage("El nombre del ítem es obligatorio")
        .isLength({ max: 150 }).withMessage("El nombre no puede superar 150 caracteres")
        .escape(),
    body("descripcion")
        .optional()
        .trim()
        .escape(),
    body("cantidad")
        .trim()
        .notEmpty()
        .withMessage("La cantidad es obligatoria")
        .isInt({ min: 0 })
        .withMessage("La cantidad debe ser un número entero mayor o igual a 0"),
    body("precio")
        .notEmpty()
        .withMessage("El precio es obligatorio")
        .isFloat({ min: 0 })
        .withMessage("El precio debe ser un número mayor o igual a 0"),
];