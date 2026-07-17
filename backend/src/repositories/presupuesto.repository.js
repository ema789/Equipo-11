import pool from "../database/connection.js";

export const findPresupuestoConClienteRepository = async (presupuestoId, usuarioId) => {
    const query = `
        SELECT
            p.id, 
            p.estado,
            p.cliente_id, 
            c.nombre AS cliente_nombre,
            c.apellido AS cliente_apellido,
            c.email AS cliente_email
        FROM presupuestos p
        JOIN clientes c ON p.cliente_id = c.id
        WHERE p.id = $1 
          AND p.usuario_id = $2 
          AND p.deleted_at IS NULL;
    `;

    const result = await pool.query(query, [presupuestoId, usuarioId]);

    // Si no hay ninguna fila (el presupuesto no existe, no es de este usuario,
    // o está borrado lógicamente), devolvemos null en vez de undefined.
    return result.rows[0] || null;
};

/**
 * ==================================================
 *  Obtiene un presupuesto completo con sus detalles  
 *  y datos del cliente
 * ==================================================
 */

export const findPresupuestoConDetallesRepository = async (presupuestoId, usuarioId) => {
    const query = `
        SELECT
            p.id, p.fecha_vencimiento,
            p.subtotal, p.total, p.estado,
            c.nombre AS cliente_nombre,
            c.apellido AS cliente_apellido,

            -- JSON_AGG junta todas las filas de detalle_presupuesto de ESTE presupuesto
            -- en un solo array JSON, para no traer un renglón por cada ítem.
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', dp.id,
                    'item_nombre', i.nombre,
                    'cantidad', dp.cantidad,
                    'precio_unitario', dp.precio_unitario,
                    'subtotal', dp.subtotal
                -- ORDER BY adentro del JSON_AGG: sin esto, Postgres no garantiza
                -- el orden de los ítems dentro del array (podría cambiar entre consultas).
                ) ORDER BY dp.created_at
            ) AS detalles

        FROM presupuestos p

        -- INNER JOIN: si el cliente no existiera no debería pasar nunca
        -- (cliente_id es NOT NULL y tiene FK), así que este sí puede quedar INNER.
        JOIN clientes c ON p.cliente_id = c.id

        -- LEFT JOIN (antes era JOIN): si el presupuesto todavía no tiene ítems
        -- cargados (ej. un borrador a medio hacer), igual queremos que aparezca,
        -- con 'detalles' como un array vacío en vez de que la fila desaparezca entera.
        LEFT JOIN detalle_presupuesto dp ON dp.presupuesto_id = p.id

      
        -- 'items_id' (así quedó definida en detalle_presupuesto), no 'item_id'.
        LEFT JOIN item i ON dp.items_id = i.id

        WHERE p.id = $1 AND p.usuario_id = $2 AND p.deleted_at IS NULL

        -- Alcanza con agrupar por p.id: como es la Primary Key de presupuesto,
        -- Postgres permite traer el resto de columnas de 'p' (fecha_vencimiento,
        -- subtotal, total, estado) sin listarlas acá, por dependencia funcional.
        -- c.nombre y c.apellido sí hay que listarlos porque vienen de otra tabla.
        GROUP BY p.id, c.nombre, c.apellido;
    `;

    const result = await pool.query(query, [presupuestoId, usuarioId]);

    // Si no hay ninguna fila (el presupuesto no existe, no es de este usuario,
    // o está borrado lógicamente), devolvemos null en vez de undefined.
    return result.rows[0] || null;
};

/**
 * ==================================================
 * REPOSITORY: Crear presupuesto 
 * ==================================================
 **/
export const createPresupuestoTransaccionRepository = async ({
    usuarioId, 
    clienteId,  
    fechaVencimiento, 
    descripcion,
    estado,
    subtotal, 
    descuentoPorcentaje,
    total,
    detallesProcesados,
}) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Insertar cabecera del presupuesto
        const { rows: [nuevoPresupuesto] } = await client.query(
            `INSERT INTO presupuestos
                (usuario_id, cliente_id, fecha_vencimiento, descripcion, estado, subtotal, descuento_porcentaje, total)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, created_at, subtotal, total, estado;`,
            [usuarioId, clienteId, fechaVencimiento, descripcion, estado, subtotal, descuentoPorcentaje, total]
        );

        // 2. Insertar cada ítem del detalle
        for (const det of detallesProcesados) {
            await client.query(
                `INSERT INTO detalle_presupuesto
                    (   presupuesto_id, 
                        item_id, 
                        cantidad, 
                        precio_unitario, 
                        subtotal
                    )
                 VALUES ($1, $2, $3, $4, $5);`,
                [
                    nuevoPresupuesto.id, 
                    det.item_id, 
                    det.cantidad, 
                    det.precio_unitario, 
                    det.subtotal
                ]
            );
        }

        await client.query("COMMIT");
        return { ...nuevoPresupuesto, detalles: detallesProcesados };

    } catch (error) {
        await client.query("ROLLBACK");
        // Re-lanzar el error original para que el servicio lo maneje con AppError
        throw error;
    } finally {
        // SIEMPRE liberar la conexión al pool
        client.release();
    }
};

/**
 * ===================================================
 * REPOSITORY: GUARDAR PRESUPUESTO PDF
 * ===================================================
 */

export const addPdfRepository = async (dato) => {

    const {
        usuarioId,
        presupuestoId,
        pdf_url,
        pdf_public_id,
        estado
    } = dato;

    // Usamos UPDATE porque el presupuesto ya existe
    const query = `
        UPDATE presupuestos
        SET pdf_url = $1, 
            pdf_public_id = $2,
            estado = $3,
            updated_at = NOW()
        WHERE id = $4 
          AND usuario_id = $5
          AND deleted_at IS NULL
        RETURNING id, pdf_url, estado;
    `;

    const result = await pool.query(query, [
        pdf_url, 
        pdf_public_id, 
        estado,
        presupuestoId, 
        usuarioId
    ]);


    // Si result.rows.length es 0, significa que no se encontró el presupuesto 
    // o el usuario no tiene permisos sobre él.
    if (result.rows.length === 0) {
        throw new AppError("No se pudo actualizar el PDF: presupuesto no encontrado o no autorizado", 404);
    }

    return result.rows[0];
}


/**
 * =================================================
 * REPOSITORY: FILTROS POR FECHA, ESTADO Y CLIENTE 
 * =================================================
 */

export const findPresupuestosConFiltrosRepository = async (
    usuarioId, 
    filtros,
    limite,
    skip
) => {
    // 1. Array para guardar las condiciones (WHERE)
    const conditions = ['usuario_id = $1', 'deleted_at IS NULL'];
    const values = [usuarioId];

    // Función auxiliar para agregar condiciones de forma limpia
    const addFilter = (cond, val) => {
        conditions.push(`${cond} $${values.length + 1}`);
        values.push(val);
    };

    // 2. Filtro dinámico: Si el cliente envía 'estado', lo sumamos a la query
    if (filtros.estado) {
        conditions.push(`estado = $${values.length + 1}`);
        values.push(filtros.estado);
    }

    if (filtros.busqueda) {
        conditions.push(`(c.nombre ILIKE $${values.length + 1} OR c.apellido ILIKE $${values.length + 1})`);
        values.push(`%${filtros.busqueda}%`);
    }

    if (filtros.fechaInicio) {
        conditions.push(`created_at >= $${values.length + 1}`);
        values.push(filtros.fechaInicio);
    }

    if (filtros.montoMinimo) {
        conditions.push(`p.total >= $${values.length + 1}`);
        values.push(filtros.montoMinimo);
    }

    if (filtros.montoMaximo) {
        conditions.push(`p.total <= $${values.length + 1}`);
        values.push(filtros.montoMaximo);
    }

    // 3. Construcción final
    const query = `
        SELECT p.*, c.nombre, c.apellido 
        FROM presupuestos p
        JOIN clientes c ON p.cliente_id = c.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY created_at DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2};;
    `;

    values.push(limite, skip);

    const result = await pool.query(query, values);
    return result.rows;
};


export const contarPresupuestosConFiltrosRepository = async (
    usuarioId,
    filtros
) => {
    const conditions = ['p.usuario_id = $1', 'p.deleted_at IS NULL'];
    const values = [usuarioId];

    if (filtros.estado) {
        conditions.push(`p.estado = $${values.length + 1}`);
        values.push(filtros.estado);
    }
    if (filtros.busqueda) {
        conditions.push(`(c.nombre ILIKE $${values.length + 1} OR c.apellido ILIKE $${values.length + 1})`);
        values.push(`%${filtros.busqueda}%`);
    }
    if (filtros.fechaInicio) {
        conditions.push(`p.created_at >= $${values.length + 1}`);
        values.push(filtros.fechaInicio);
    }
    if (filtros.montoMinimo) {
        conditions.push(`p.total >= $${values.length + 1}`);
        values.push(filtros.montoMinimo);
    }
    if (filtros.montoMaximo) {
        conditions.push(`p.total <= $${values.length + 1}`);
        values.push(filtros.montoMaximo);
    }

    const query = `
        SELECT COUNT(*) 
        FROM presupuestos p
        JOIN clientes c ON p.cliente_id = c.id
        WHERE ${conditions.join(' AND ')};
    `;

    const result = await pool.query(query, values);
    // Retornamos el número convertido a entero
    return parseInt(result.rows[0].count, 10);
};
