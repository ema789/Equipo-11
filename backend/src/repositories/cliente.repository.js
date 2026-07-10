import pool from "../database/connection.js";

export const findClientesByClienteRepository = async (usuarioId) => {
    const query = `
        SELECT id, nombre, apellido, email, cuil_cuit,  telefono, created_at
        FROM clientes
        WHERE usuario_id = $1 AND deleted_at IS NULL
        ORDER BY nombre ASC;
    `;
    const result = await pool.query(query, [usuarioId]);
    return result.rows;
};

export const existsClienteRepository = async (usuario_id, clienteId) => {
    const query = `
        SELECT EXISTS (
            SELECT 1 
            FROM clientes 
            WHERE id = $1 
            AND usuario_id = $2 
            AND deleted_at IS NULL
        );
    `;
    const result = await pool.query(query, [clienteId, usuario_id]);
    return result.rows[0].exists;
};

export const createClienteRepository = async (clienteData) => {
    const { 
        usuario_id, 
        nombre, 
        apellido, 
        email,
        cuil_cuit, 
        telefono 
    } = clienteData;
    
    const query = `
        INSERT INTO clientes (
            usuario_id, 
            nombre, 
            apellido, 
            email, 
            cuil_cuit, 
            telefono)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, usuario_id, nombre, apellido, email, cuil_cuit, telefono, created_at;
    `;
    
    // Ahora pasamos los 6 parámetros en el orden correcto
    const result = await pool.query(query, [
        usuario_id, 
        nombre, 
        apellido, 
        email, 
        cuil_cuit, 
        telefono
    ]);
    
    return result.rows[0];
};

export const updateClienteRepository = async (usuario_id, updateData) => {
    
    const { 
        id, 
        nombre, 
        apellido, 
        email, 
        cuil_cuit, 
        telefono 
    } = updateData;

    // 2. Verificamos que el ID exista para evitar errores SQL
    if (!id) {
        throw new Error("El ID del cliente es obligatorio para actualizar");
    }

    const query = `
        UPDATE clientes
        SET nombre = $1,
            apellido = $2,
            email = $3,
            cuil_cuit = $4,
            telefono = $5,
            updated_at = NOW()
        WHERE id = $6 AND usuario_id = $7 AND deleted_at IS NULL
        RETURNING id, usuario_id, nombre, apellido, email, cuil_cuit, telefono, updated_at;
    `;

    const result = await pool.query(query, [
        nombre, 
        apellido, 
        email, 
        cuil_cuit, 
        telefono, 
        id, 
        usuario_id
    ]);

    return result.rows[0];
};



