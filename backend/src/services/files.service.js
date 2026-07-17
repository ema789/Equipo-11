import { Readable } from 'stream';
import cloudinary from "../config/cloudinary.config.js";
import { generateFolderName } from "../utils/generateFolderName.util.js";
/**
 * COMO EXPORTALO PARA USARLO EN LOS MODULOS SERVICE QUE LLEVA LA LOGICA.
 * Importación con llaves {}
 * Se utiliza cuando el archivo exporta elementos por nombre (Named Export).
 * import {
 *     uploadLogoService,
 *     uploadPdfService
 * } from "./file.service.js";
 */

/**
 * ==========================================================
 * SUBIR LOGO DE UNA EMPRESA
 * ==========================================================
 */
export const uploadLogoService = async (fileBuffer, nombreDeCarpeta) => {
    const nombreFolder = await generateFolderName(nombreDeCarpeta);

    // Convertimos el buffer a stream para Cloudinary
    const stream = Readable.from(fileBuffer);

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `empresa/${nombreFolder}/logos`,
                resource_type: "image",
                overwrite: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({ public_id: result.public_id, url: result.secure_url });
            }
        );
        stream.pipe(uploadStream);
    });
};

/**
 * ==========================================================
 * SUBIR PDF DE PRESUPUESTO
 * ==========================================================
 */

export const uploadPresupuestoService = async (
    filePath,
    nombreDeCarpeta,
    creacionFecha,
) => {
    //convierto el nombre de la carpeta " Panaderi Pepito " en Panaderia-Pepito.
    const nombreFolder = await generateFolderName(nombreDeCarpeta);
    // Sube el PDF a Cloudinary
    const result = await cloudinary.uploader.upload(
        filePath,
        {

            // Ruta donde se almacenarán
            // los presupuestos de la empresa
            // empresas/panaderia-san-martin/presupuestos
            folder: `empresas/${nombreFolder}/presupuestos/${creacionFecha}`,
            // Los PDFs se almacenan como RAW
            resource_type: "raw",
            // Mantiene el nombre del archivo original
            use_filename: true,
            // Evita conflictos de nombres
            unique_filename: true

        }
    );

    return {
        public_id: result.public_id,
        url: result.secure_url
    };
}

/**
 * ==========================================================
 * ELIMINAR ARCHIVO DE CLOUDINARY
 * ==========================================================
 */
export const deleteFileService = async (publicId, resourceType = "image") => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
        return result;
    } catch (error) {
        console.error("Error al eliminar archivo en Cloudinary:", error);
        throw error;
    }
};