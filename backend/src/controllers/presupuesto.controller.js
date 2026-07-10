import {
    createPresupuestoCompletoService,
    getPresupuestoByIdService,
    addPdfService,
    filtroPresupuestoService,
} from "../services/presupuesto.service.js";
import { AppError } from "../utils/AppError.util.js";

/**
 * POST /api/presupuestos
 * Crea un presupuesto completo con sus ítems de detalle.
 */
export const createPresupuesto = async (req, res, next) => {
    try {
        const usuarioId = req.auth.id;

        let detalles;
        try {
            detalles =
                typeof req.body.detalles === "string"
                    ? JSON.parse(req.body.detalles)
                    : req.body.detalles;
        } catch {
            return next(new AppError("El campo 'detalles' no es un JSON válido", 400));
        }

        const datosPresupuesto = {
            usuarioId,
            clienteId: req.body.cliente_id,
            fechaVencimiento: req.body.fecha_vencimiento,
            estado: req.body.estado,
            detalles,
        };

        const resultado = await createPresupuestoCompletoService(
            datosPresupuesto,
            req.file,
        );

        res.status(201).json({ 
            success: true, 
            message: "Se creo un nuevo presupuesto",
            presupuesto: resultado 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/presupuestos/:id
 * Obtiene un presupuesto con sus detalles.
 */
export const getPresupuestoById = async (req, res, next) => {
    try {
        const usuarioId = req.auth.id; 
        const { id } = req.params;
        
        const presupuesto = await getPresupuestoByIdService(id, usuarioId);

        if (!presupuesto) {
            return next(new AppError("Presupuesto no encontrado", 404));
        }

        res.status(200).json({ 
            success: true, 
            presupuesto 
        });

    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/presupuesto/
 * guardamos el pdf creado 
*/
export const addPdfController = async (req, res, next) => {
    try{
        const { presupuestoId } = req.params;
        const file = req.file; 
        const usuarioId = req.auth.id;
        const pdf = await addPdfService(
            { 
                usuarioId, 
                presupuestoId 
            },
            file
        );
        res.status(200).json({
            success: true,
            message: "Se guardo el PDF",
            data:pdf
        })
    }catch(error){
        next(error);
    }
}

/**
 * PUT /api/presupuesto/
 * filtrado
 */

export const filtroPresuestoController = async (req, res, next) => {

    try{

        const {
            pagina =  1,
            limite = 10,
            filtro = '{}'
        } = req.query;

        const usuarioId = req.auth.id;

        let filtrosObj;
        try {
            filtrosObj = typeof filtro === 'string' ? JSON.parse(filtro) : filtro;
        } catch (e) {
            return next(new AppError("Formato de filtro inválido", 400));
        }
        
        const data = await filtroPresupuestoService(
            usuarioId,
            Number(pagina),
            Number(limite),
            filtrosObj
        );

        res.status(200).json({
            success: true,
            ...data
        })

    }catch (error){
        next(error);
    }

}