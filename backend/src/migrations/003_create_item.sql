-- ==================================================
-- TABLA: ITEMS
-- Guarda los items de cada usuario
-- ==================================================

CREATE TABLE items (
    -- Clave Primaria: Genera un UUID único automáticamente usando la función nativa de Postgres
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Usuario dueño del ítem (Clave Foránea)
    usuario_id UUID NOT NULL, 

    -- Nombre del ítem (Obligatorio, máximo 100 caracteres)
    nombre VARCHAR(100) NOT NULL,

    -- En lugar de cantidad NUMERIC(10, 2)
    cantidad INTEGER NOT NULL DEFAULT 0,

    -- 'NUMERIC(10,2)' significa 10 dígitos en total, con 2 decimales (ej: 99999999.99).
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,

    -- Es buena práctica que el campo 'activo' no sea NULL y tenga un valor por defecto (true) al crearse.
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    -- Auditoría: Fecha de creación del ítem (Toma la hora actual del servidor por defecto)
    created_at TIMESTAMP DEFAULT NOW(),

    -- Fecha de última modificación (Útil para actualizar mediante un Trigger en Postgres)
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Soft Delete: Si este campo tiene una fecha, significa que el ítem fue "borrado" lógicamente
    deleted_at TIMESTAMP,

    --'fk_item_usuario' para que sea coherente con la tabla 'item'.
    -- Si el usuario se elimina, se borran automáticamente sus ítems en cascada (ON DELETE CASCADE).
    CONSTRAINT fk_item_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);