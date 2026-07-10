-- ==================================================
-- TABLA: clientes
-- Clientes pertenecientes a un usuario
-- ==================================================

CREATE TABLE clientes (

    -- ID único del cliente
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Usuario dueño del cliente
    usuario_id UUID NOT NULL,

    -- Nombre del cliente
    nombre VARCHAR(100) NOT NULL,

    -- Apellido
    apellido VARCHAR(100),

    -- Cuil o Cuit del Usuario
    cuil_cuit VARCHAR(100),

    -- Email del cliente
    email VARCHAR(255),

    -- Teléfono
    telefono VARCHAR(50),

    -- Auditoría
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,

    -- Relación con usuarios
    CONSTRAINT fk_cliente_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);