import pool from './connection.js';

export const runMigration = async () => {
  try {
    console.log("Iniciando verificación y creación de tablas en la base de datos...");

    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
    `);

    console.log("¡La tabla 'usuarios' ha sido verificada o creada exitosamente!");
  } catch (error) {
    console.error("Error crítico al ejecutar la migración:", error);
  }
};