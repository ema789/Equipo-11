import {
    createClienteRepository, 
    findClientesByClienteRepository,
    updateClienteRepository,
    existsClienteRepository
} from "../repositories/cliente.repository.js";

import { AppError } from "../utils/AppError.util.js";
/**
 * 
 * @param {
 *  usuarioId, 
 *   nombre, 
 *   apellido, 
 *   email, 
 *   cuil_cuit,
 *   telefono 
 * } clienteData 
 * 
 * @returns 
 */
export const createClienteService = async (usuarioId, clienteData) => {
    
    const dataToSave = { 
        ...clienteData, 
        usuario_id:usuarioId
    };

    return await createClienteRepository(dataToSave);

};

export const getClientesByUsuarioService = async (usuarioId) => {
    return await findClientesByClienteRepository(usuarioId);
};

export const updateClienteService = async (usuario_id, updateData) => {
    
     const exists = await existsClienteRepository(usuario_id, updateData.id);
    if(!exists) { throw new AppError("Cliente no encontrado", 404); }

    const dataToUpdate = { 
        ...updateData,
        usuario_id
    };

    const cliente = await updateClienteRepository(usuario_id, dataToUpdate);
    
    return cliente;


}

