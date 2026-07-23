import pool from './connection.js';

export const runMigration = async () => {
  try {
    console.log("Verificando y sincronizando la base de datos...");

    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- 1. TABLA: usuarios (Debe ir primera porque es la base de las FK)
      CREATE TABLE IF NOT EXISTS public.usuarios (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(100) NOT NULL,
          apellido VARCHAR(100),
          telefono VARCHAR(50),
          razon_social VARCHAR(255),
          nombre_emprendimiento VARCHAR(255) NOT NULL,
          cargo VARCHAR(100),
          cuil_cuit VARCHAR(100),
          direccion VARCHAR(100),
          rubro VARCHAR(100),
          sitio_web VARCHAR(200),
          email VARCHAR(255) NOT NULL UNIQUE,
          activo BOOLEAN DEFAULT true,
          password_hash TEXT NOT NULL,
          logo_url TEXT,
          logo_public_id TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          deleted_at TIMESTAMP
      );

      -- 2. TABLA: clientes
      CREATE TABLE IF NOT EXISTS public.clientes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id UUID NOT NULL,
          nombre VARCHAR(100) NOT NULL,
          apellido VARCHAR(100),
          cuil_cuit VARCHAR(100),
          email VARCHAR(255),
          telefono VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          deleted_at TIMESTAMP,
          CONSTRAINT fk_cliente_usuario
              FOREIGN KEY (usuario_id)
              REFERENCES usuarios(id)
              ON DELETE CASCADE
      );

      -- 3. TABLA: items
      CREATE TABLE IF NOT EXISTS public.items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id UUID NOT NULL,
          nombre VARCHAR(100) NOT NULL,
          cantidad INTEGER NOT NULL DEFAULT 0,
          precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
          activo BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          deleted_at TIMESTAMP,
          CONSTRAINT fk_item_usuario
              FOREIGN KEY (usuario_id)
              REFERENCES usuarios(id)
              ON DELETE CASCADE
      );

      -- 4. TABLA: presupuestos
      CREATE TABLE IF NOT EXISTS public.presupuestos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id UUID NOT NULL,
          cliente_id UUID NOT NULL,
          descripcion VARCHAR(255),
          subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
          descuento_porcentaje NUMERIC(5, 2) DEFAULT 0.00,
          total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
          estado VARCHAR(50) DEFAULT 'Borrador'
              CHECK (estado IN ('Borrador', 'Guardado', 'Enviado', 'Aceptado', 'Rechazado')),
          pdf_url TEXT,
          pdf_public_id TEXT,
          fecha_vencimiento TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          deleted_at TIMESTAMP,
          CONSTRAINT fk_presupuesto_usuario
              FOREIGN KEY (usuario_id)
              REFERENCES usuarios(id)
              ON DELETE CASCADE,
          CONSTRAINT fk_presupuesto_cliente
              FOREIGN KEY (cliente_id)
              REFERENCES clientes(id)
              ON DELETE CASCADE
      );

      -- 5. TABLA: detalle_presupuesto
      CREATE TABLE IF NOT EXISTS public.detalle_presupuesto (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          items_id UUID NOT NULL,
          presupuesto_id UUID NOT NULL,
          cantidad INTEGER NOT NULL DEFAULT 0,
          precio_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
          subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
          created_at TIMESTAMP DELTAULT NOW(), -- corregido a DEFAULT NOW()
          updated_at TIMESTAMP DEFAULT NOW(),
          deleted_at TIMESTAMP,
          CONSTRAINT fk_detalle_presupuesto_presupuesto
              FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id) ON DELETE CASCADE,
          CONSTRAINT fk_detalle_presupuesto_item
              FOREIGN KEY (items_id) REFERENCES items(id) ON DELETE SET NULL
      );
    `);

    console.log("¡Todas las tablas (usuarios, clientes, items, presupuestos, detalle) están listas y sincronizadas!");
  } catch (error) {
    console.error("Error al sincronizar las tablas en la base de datos:", error);
  }
};