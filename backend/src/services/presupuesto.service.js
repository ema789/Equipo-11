import { uploadPresupuestoService } from "./files.service.js";
import { AppError } from "../utils/AppError.util.js";
import {
    createPresupuestoTransaccionRepository,
    findPresupuestoConDetallesRepository,
    addPdfRepository,
    findPresupuestoConClienteRepository,
    findPresupuestosConFiltrosRepository,
    contarPresupuestosConFiltrosRepository,
} from "../repositories/presupuesto.repository.js";

/**
 * Estados válidos del presupuesto.
 * Cualquier valor fuera de esta lista será rechazado.
 */
const ESTADOS_VALIDOS = ["Borrador", "Guardado", "Enviado", "Aceptado", "Rechazado"];
/**
 * ==================================================
 * SERVICE: Crear presupuesto completo
 * ==================================================
 **/
export const createPresupuestoCompletoService = async ({
    usuarioId,
    clienteId,
    fechaVencimiento,
    descripcion,
    estado,
    detalles,
    descuentoPorcentaje = 0
}) => {
    // 1. Validaciones de negocio
    // Un presupuesto sin ítems no tiene sentido: cortamos acá antes de tocar
    // Cloudinary o la base de datos.
    if (!detalles || detalles.length === 0) {
        throw new AppError("No se puede generar un presupuesto sin ítems cargados", 400);
    }

    // Si no viene estado desde el front, arranca como Borrador por defecto.
    const estadoFinal = estado || "Borrador";
    // Rechazamos cualquier valor que no esté en la lista blanca de estados
    // permitidos (evita que llegue un string cualquiera y rompa el CHECK de la DB
    // con un error feo de Postgres en vez de un error de negocio prolijo).
    if (!ESTADOS_VALIDOS.includes(estadoFinal)) {
        throw new AppError(
            `Estado inválido: "${estadoFinal}". Los valores permitidos son: ${ESTADOS_VALIDOS.join(", ")}.`,
            400
        );
    }

    // 2. Cálculo de subtotales y total en el backend (nunca confiar en el frontend)
    // Aunque el front ya calculó y mostró estos números en pantalla, NO nos fiamos:
    // alguien podría mandar un total manipulado directo a la API. Los recalculamos acá.
    let subtotalCalculado = 0;
    const detallesProcesados = detalles.map((det) => {
        const itemSubtotal = Number(det.cantidad) * Number(det.precio_unitario);
        subtotalCalculado += itemSubtotal;
        // Devolvemos el detalle original + el subtotal ya calculado por línea,
        // así el repositorio no tiene que recalcular nada, solo insertar.
        return { ...det, subtotal: itemSubtotal };
    });

    // 3. Cálculo de Descuento (maneja 0 o cualquier porcentaje)
    // Si descuentoPorcentaje es 0, el resultado será 0, lo cual es correcto.
    const descPorcentaje = Number(descuentoPorcentaje) || 0;
    const descMonto = subtotalCalculado * (descPorcentaje / 100);

    //4. Total Final
    const total = subtotalCalculado - descMonto;

    // 5. Delegar la transacción ACID al repositorio
    return await createPresupuestoTransaccionRepository({
        usuarioId,
        clienteId,
        fechaVencimiento,
        descripcion,
        estado: estadoFinal,
        subtotal: subtotalCalculado,
        descuentoPorcentaje: descPorcentaje,
        total,
        detalles: detallesProcesados
    });
};

/**
 * ==================================================
 * SERVICE: Obtener presupuesto por ID
 * ==================================================
 **/
export const getPresupuestoByIdService = async (presupuestoId, usuarioId) => {
    // Este service no tiene lógica propia todavía, solo delega al repositorio.
    // Lo dejamos como función separada (en vez de llamar al repositorio directo
    // desde el controller) para poder sumarle reglas de negocio más adelante
    // (ej: chequear permisos, formatear la respuesta) sin tocar el controller.
    return await findPresupuestoConDetallesRepository(presupuestoId, usuarioId);
};

/**
 * GUARDAR PDF 
 */
export const addPdfService = async (
    {
        usuarioId,
        presupuestoId,
    },
    file,
) => {

    const cliente = await findPresupuestoConClienteRepository(presupuestoId, usuarioId);

    if(!cliente) throw new AppError("El cliente no existe");

    if (!file) throw new AppError("No se encuentra el archivo");

    //  Subida del PDF a Cloudinary (si se adjuntó uno)

    /** DIVIDIMOS LA CARPETA POR FECHA DE CREACION & NOMBRE DEL CLIENTE*/
    const nombreDelCliente = `${cliente.cliente_nombre}_${cliente.cliente_apellido}`;
    const creacionFecha = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const uploadResult = await uploadPresupuestoService(file.buffer, nombreDelCliente, creacionFecha);

    return await addPdfRepository({
        usuarioId,
        clienteId,
        presupuestoId,
        pdf_url: uploadResult.url,
        pdf_public_id: uploadResult.public_id,
        estado: 'Guardado'
    })
}

/**
 * ==================================================
 * SERVICE: FILTRADO POR FECHA ESTADO MONTO Y CLIENTE
 * ==================================================
 **/

export const filtroPresupuestoService = async (
    usuarioId,
    pagina = 1,
    limite = 10,
    filtro = {},
) => {

    // 1. Calcular el desplazamiento (Offset)
    const skip = (pagina - 1) * limite;

    // 2. Llamar al repositorio
    // NOTA: Asegúrate de que tu repositorio acepte 'limit' y 'offset' 
    // para que la paginación ocurra en la base de datos (más eficiente)

    const presupuesto = await findPresupuestosConFiltrosRepository(
        usuarioId,
        filtros,
        limite,
        skip
    );

    // 3. (Opcional pero recomendado) Obtener total para el frontend
    // Esto es útil para calcular cuántas páginas existen en total

    const total = await contarPresupuestosConFiltrosRepository(usuarioId, filtros);

    return {
        data: presupuestos,
        meta: {
            total,
            pagina,
            limite,
            totalPaginas: Math.ceil(total / limite)
        }
    };

}