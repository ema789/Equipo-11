import { 
    registerItemService, 
    getItemsByUsuarioService,
    updateItemService
} from "../services/item.service.js";

export const createItemController = async (req, res, next) => {
    try {
        const usuarioId = req.auth.id; 
        const nuevoItem = await registerItemService({ ...req.body, usuarioId });
        res.status(201).json({ success: true, item: nuevoItem });
    } catch (error) {
        next(error);
    }
};

export const getItemsController = async (req, res, next) => {
    try {
        const usuarioId = req.auth.id; 
        const items = await getItemsByUsuarioService(usuarioId);
        res.json({ success: true, items });
    } catch (error) {
        next(error);
    }
};

export const updateItemController = async (req, res, next) => {
    try {

        const usuarioId = req.auth.id;
        const itemId = req.params.id;
        const updateData = req.body;
        
        const updatedItem = await updateItemService(usuarioId, itemId, updateData);
        
        res.status(200).json({
            success: true, 
            message: "Item actualizado correctamente",
            item: updatedItem 
        });

    }catch (error){
        next(error);
    }
};