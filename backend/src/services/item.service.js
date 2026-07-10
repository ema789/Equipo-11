import {
    createItemRepository,
    updateItemRepository,
    findItemsByUsuarioRepository,
    findItemByIdRepository,
} from "../repositories/item.repository.js";

import { AppError } from "../utils/AppError.util.js";

/**
 * Servicio encargado de registrar un nuevo item.
 * Recibe un objeto desestructurado con las propiedades: usuarioId, nombre, precio, cantidad.
 * Valida los datos del item usando la función del validador.
 * Llama al repositorio para crear el item en la base de datos y retorna el resultado.
 */
export const getItemsByUsuarioService = async (usuarioId) => {
    if (!usuarioId) {
        throw new AppError("El ID de usuario es requerido", 400);
    }
    return await findItemsByUsuarioRepository(usuarioId);
};

export const registerItemService = async (itemData) => {



    // 1. Normalización: Aseguramos que la cantidad sea un entero antes de enviarla al repositorio
    const sanitizedData = {
        ...itemData,
        cantidad: Math.floor(Number(itemData.cantidad) || 0)
    };

    // 2. Llamar al repositorio para crear el item  
    return await createItemRepository(sanitizedData);
};

export const updateItemService = async (usuarioId, itemId, updateData) => {

    // 1. Verificación básica: ¿Existe el ítem?
    const itemDate = await findItemByIdRepository(itemId, usuarioId);

    if (!itemDate) {
        throw new AppError("El item no existe o no pertenece a este usuario", 404);
    }
    // 2. REGLA DE NEGOCIO: ¿Está activo?
    // Si el campo no existe, o si es 'false', impedimos la actualización.
    if (itemDate.activo !== true) {
        throw new AppError("Para realizar cambios, el ítem debe estar activo (true).", 400);
    }

    // 3. Normalización: Aseguramos que la cantidad sea un entero antes de enviarla al repositorio
    const sanitizedData = {
        ...updateData,
        cantidad: Math.floor(Number(updateData.cantidad) || 0),
        // Si no envían 'activo', usamos el valor actual que ya tenemos en itemDate
        activo: updateData.activo !== undefined ? updateData.activo : itemDate.activo
    };

    // 4. Llamar al repositorio para actualizar el item
    return await updateItemRepository(itemDate.id, usuarioId, sanitizedData);

}