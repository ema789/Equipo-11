import {
    createClienteService,
    getClientesByUsuarioService,
    getClienteByIdService,
    updateClienteService
} from "../services/cliente.service.js";

export const createClienteController = async (req, res, next) => {
    try {
        const usuarioId = req.auth.id;
        const nuevoCliente = await createClienteService(usuarioId, { ...req.body });
        res.status(201).json({
            success: true,
            message: "Cliente creado correctamente",
            cliente: nuevoCliente
        });
    } catch (error) {
        next(error);
    }
};

export const getClientesController = async (req, res, next) => {
    try {
        const usuarioId = req.auth.id;
        const clientes = await getClientesByUsuarioService(usuarioId);
        res.json({ success: true, clientes });
    } catch (error) {
        next(error);
    }
};

export const getClienteByIdController = async (req, res, next) => {
    try {
        const usuarioId = req.auth.id;
        const clienteId = req.params.id;
        const cliente = await getClienteByIdService(usuarioId, clienteId);

        res.status(200).json({ success: true, cliente });
    } catch (error) {
        next(error);
    }
};

export const updateClienteController = async (req, res, next) => {

    try {
        const usuarioId = req.auth.id;
        const clienteId = req.params.id;
        const updateData = {
            ...req.body,
            id: clienteId
        };

        const updatedCliente = await updateClienteService(usuarioId, updateData);
        res.status(200).json({
            success: true,
            message: "Cliente actualizado correctamente",
            cliente: updatedCliente
        });
    } catch (error) {
        next(error);
    }
}