// Importamos la librería 'bcrypt' para el hash de contraseñas de forma segura
import bcrypt from "bcrypt";
// Importamos la librería 'jsonwebtoken' para generar tokens de autenticación basados en JWT
import jwt from "jsonwebtoken";

// Importamos las funciones del repositorio para interactuar directamente con la base de datos de usuarios
import {
    findUserByEmailRepository,
    findUserByIdRepository,
    createUserRepository,
    updateUserDateRepository,
    updateUserCompanyRepository,
    updateUserLogoRepository
} from "../repositories/usuario.repository.js";
// Importamos el servicio encargado de subir los archivos (logos) a la nube o servidor
import {
    uploadLogoService,
    deleteFileService,
} from "./files.service.js";

import { 
    validateRegisterData 
} from "../validators/user.validator.js"; 

import { AppError } from "../utils/AppError.util.js";

/**
 * Servicio encargado del registro de un nuevo usuario/emprendimiento.
 * Recibe un objeto desestructurado con las propiedades: email, password, nombreEmprendimiento y file.
 * nombre,apellido,email,password, nombreEmprendimiento,*/
    
export const registerService = async (datos) => {

    // Validamos los datos de registro usando la función del validador
    validateRegisterData(datos);

    const { 
        nombre, 
        apellido, 
        email, 
        password, 
        nombreEmprendimiento 
    } = datos;
    // Busca en la base de datos si ya existe un usuario    registrado con el email proporcionado
    const existingUser =
        await findUserByEmailRepository(email);

    // Si el usuario ya existe, interrumpe la ejecución lanzando un error descriptivo
    if (existingUser) {
        throw new AppError(
            "El email ya está registrado",
            409
        );
    }


    // Encripta (aplica un hash) a la contraseña usando bcrypt con un factor de costo (salt rounds) de 10
    const passwordHash =
        await bcrypt.hash(password, 10);

    // Guarda el nuevo usuario en la base de datos llamando al repositorio y retorna el resultado
    return await createUserRepository({
        nombre,
        apellido,
        email,
        passwordHash,
        nombreEmprendimiento,
    });
};

/**
 * Servicio encargado del inicio de sesión (login) de un usuario.
 * Recibe un objeto desestructurado con las propiedades: email y password.
 */
export const loginService = async ({
    email,
    password
}) => {

    // Busca al usuario en la base de datos utilizando el email provisto
    const user =
        await findUserByEmailRepository(email);

    // Si no encuentra ningún usuario con ese email, lanza un error genérico por seguridad
    if (!user) {
        throw new AppError(
            "El email no está registrado",
            404
        );
    }

    // Compara la contraseña en texto plano ingresada con el hash guardado en la base de datos (user.password_hash)
    const validPassword =
        await bcrypt.compare(
            password,
            user.password_hash
        );

    // Si la contraseña no coincide, lanza el mismo error genérico para no dar pistas a atacantes
    if (!validPassword) {
        throw new AppError(
            "Credenciales inválidas",
            401
        );
    }

    // Si todo es correcto, genera un Token JWT firmándolo con los datos del usuario (payload),
    // una clave secreta del entorno (process.env.JWT_SECRET) y define un tiempo de expiración de 1 hora
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    // Retorna un objeto con el token generado y los datos públicos del usuario para ser usados en el cliente (frontend)
    return {
        token,
        user: {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            nombreEmprendimiento:
                user.nombre_emprendimiento // Mapea la propiedad de la base de datos (snake_case) al formato JS (camelCase)
        }
    };
};


export const getUserByIdService = async (userId) => {
    
    const user = await findUserByIdRepository(userId);

    if (!user) {
        throw new AppError("Usuario no encontrado", 404);
    }

    return {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        nombreEmprendimiento: user.nombre_emprendimiento,
        telefono: user.telefono,
        cargo: user.cargo,
        logo_url: user.logo_url,
        logo_public_id: user.logo_public_id,
        razon_social: user.razon_social,
        cuil_cuit: user.cuil_cuit,
        direccion: user.direccion,
        rubro: user.rubro,
        sitio_web: user.sitio_web,
        created_at: user.created_at,
        updated_at: user.updated_at
    };
};          
    
/** Actualizar datos del Usuario 
 *    userId,
    nombre,
    apellido,
    email,
    telefono,
    cargo,**/
export const updateUserDateService = async (dato) => {
    // 1. Obtener datos actuales para saber si ya tiene un logo
    const user = await findUserByIdRepository(dato.userId);

    if(!user) throw new AppError("Usuario no existe", 404);

    return await updateUserDateRepository(dato)
}

/**
 * Actuzalizamos los datos de la empresa del usuario
 *     userId,
    razon_social,
    cuil_cuit,
    direccion,
    rubro,
    sitio_web,
 */

export const updateUserCompanyService = async (dato) => {

    const user = await findUserByIdRepository(dato.userId);

    if (!user) throw new AppError("Usuario no existe", 404);

    return await updateUserCompanyRepository(dato)
}

/** Actualizar Logo del Usuario **/
export const updateUserLogoService = async (
    id,
    file
) => {

    // 1. Obtener datos actuales para saber si ya tiene un logo
    const user = await findUserByIdRepository(id);

    if (!user) throw new AppError("Usuario no existe", 404);

    let logo_url = user.logo_url;
    let logo_public_id = user.logo_public_id;

    // 2. Solo si el usuario envía un archivo nuevo, procesamos el cambio de logo
    if (file) {
        // A. Borramos el anterior SOLO SI existía
        if (user.logo_public_id) {
            await deleteFileService(user.logo_public_id, "image");
        }

        // B. Subimos el nuevo
        const { public_id: newPublicId, url: newUrl } = await uploadLogoService(file.buffer, user.nombre_emprendimiento);

        logo_url = newUrl;
        logo_public_id = newPublicId;
    }

    return await updateUserLogoRepository({
        id: user.id,
        logo_url,
        logo_public_id
    })
}