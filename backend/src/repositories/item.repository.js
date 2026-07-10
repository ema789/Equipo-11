// Importamos la conexión a PostgreSQL.
// db es el Pool que configuramos en database.js
import pool from "../database/connection.js";

export const findItemByIdRepository = async (itemId, usuarioId) => {
    const query = `
        SELECT 
            id, 
            usuario_id, 
            nombre, 
            precio, 
            cantidad, 
            activo, 
            created_at, 
            updated_at
        FROM item 
        WHERE id = $1 
        AND usuario_id = $2 
        AND deleted_at IS NULL;
    `;
    
    const result = await pool.query(query, [itemId, usuarioId]);
    
    // Si encuentra algo, devuelve el objeto; si no, devuelve null
    return result.rows[0] || null;
};

export const findItemsByUsuarioRepository = async (usuarioId) => {
    const query = `
        SELECT id, nombre, precio, cantidad, activo
        FROM items
        WHERE usuario_id = $1 AND deleted_at IS NULL
        ORDER BY nombre ASC;
    `;
    const result = await pool.query(query, [usuarioId]);
    return result.rows;
};


export const createItemRepository = async (itemData) => {

    const { 
        usuarioId, 
        nombre,
        descripcion,
        precio, 
        cantidad 
    } = itemData;

    const query = `
        INSERT INTO item (usuario_id, nombre, descripcion, precio, cantidad)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, usuario_id, nombre, descripcion, precio, cantidad, activo, created_at;
    `;
    const result = await pool.query(query, [
        usuarioId, 
        nombre,  
        descripcion,
        precio,
        cantidad
    ]);
    return result.rows[0];
};

export const updateItemRepository = async  (usuarioId, itemData) => {

  
}
