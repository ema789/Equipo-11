import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './connection.js'; // Ajusta la ruta a tu archivo connection.js

// Esto es necesario para obtener la ruta actual si usas "import" (ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigration = async () => {
  try {
    // Apunta a la ruta exacta donde tienes tu archivo schema.sql
    // Por ejemplo, si está en la misma carpeta database:
    const sqlFilePath = path.join(__dirname, 'schema.sql'); 
    
    // Lee el contenido del archivo SQL como texto plano
    const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

    // Ejecuta todo el script SQL de golpe en la base de datos de Render
    await pool.query(sqlQuery);
    console.log("¡Tablas creadas y verificadas exitosamente desde el archivo SQL!");
  } catch (error) {
    console.error("Error al ejecutar el archivo SQL de migración:", error);
  }
};